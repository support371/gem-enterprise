import { GatewayRequestError } from "@/lib/supabase-gateway";

const DEFAULT_GATEWAY_BASE_URL =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1";
const DEFAULT_GATEWAY_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsemRqb3FwemJrd3p1YWV4bGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTk1MTQsImV4cCI6MjA5ODg3NTUxNH0.0wfgX_m6SBn_TtD0ZNjkOZ-bk8Frp2Tq1HL9mYFBm4M";
const REQUEST_TIMEOUT_MS = 30_000;

function gatewayBaseUrl() {
  return (
    process.env.GEM_SUPABASE_GATEWAY_BASE_URL?.trim() ||
    DEFAULT_GATEWAY_BASE_URL
  ).replace(/\/$/, "");
}

function gatewayAnonKey() {
  return (
    process.env.GEM_SUPABASE_GATEWAY_ANON_KEY?.trim() ||
    DEFAULT_GATEWAY_ANON_KEY
  );
}

async function readJson<T>(
  response: Response,
): Promise<T | { error?: string; code?: string }> {
  return (await response.json().catch(() => ({}))) as T | {
    error?: string;
    code?: string;
  };
}

async function invokeOperatorInvitation<T>(
  payload: Record<string, unknown>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const key = gatewayAnonKey();
    const response = await fetch(
      `${gatewayBaseUrl()}/gem-operator-invitations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      },
    );
    const body = await readJson<T>(response);
    if (!response.ok) {
      const errorBody = body as { error?: string; code?: string };
      throw new GatewayRequestError(
        response.status,
        errorBody.code || "OPERATOR_INVITATION_FAILED",
        errorBody.error || "Operator invitation request failed.",
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof GatewayRequestError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new GatewayRequestError(
        504,
        "OPERATOR_INVITATION_TIMEOUT",
        "Operator invitation service timed out.",
      );
    }
    throw new GatewayRequestError(
      503,
      "OPERATOR_INVITATION_UNAVAILABLE",
      "Operator invitation service is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export type OperatorInvitationAction = "issue" | "list" | "revoke";

export async function operatorInvitationGateway<T>(
  action: OperatorInvitationAction,
  token: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  return invokeOperatorInvitation<T>({ action, token, ...payload });
}

export async function getOperatorInvitationStatus(tokenHash: string) {
  return invokeOperatorInvitation<{
    valid: boolean;
    maskedEmail: string | null;
    role: string | null;
    expiresAt: string | null;
  }>({ action: "status", tokenHash });
}

export async function consumeOperatorInvitation(input: {
  tokenHash: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
}) {
  return invokeOperatorInvitation<{
    ok: true;
    userId: string;
    email: string;
    role: string;
    credentialsExposed: false;
  }>({
    action: "accept",
    tokenHash: input.tokenHash,
    passwordHash: input.passwordHash,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
  });
}
