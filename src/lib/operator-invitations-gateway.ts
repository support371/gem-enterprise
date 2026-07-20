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

function gatewayProjectUrl() {
  const base = gatewayBaseUrl();
  return base.endsWith("/functions/v1")
    ? base.slice(0, -"/functions/v1".length)
    : new URL(base).origin;
}

function gatewayAnonKey() {
  return (
    process.env.GEM_SUPABASE_GATEWAY_ANON_KEY?.trim() ||
    DEFAULT_GATEWAY_ANON_KEY
  );
}

async function readJson<T>(response: Response): Promise<T | { error?: string; code?: string }> {
  return (await response.json().catch(() => ({}))) as T | {
    error?: string;
    code?: string;
  };
}

export type OperatorInvitationAction = "issue" | "list" | "revoke";

export async function operatorInvitationGateway<T>(
  action: OperatorInvitationAction,
  token: string,
  payload: Record<string, unknown> = {},
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
        body: JSON.stringify({ action, token, ...payload }),
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

async function rpc<T>(name: string, payload: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const key = gatewayAnonKey();
    const response = await fetch(
      `${gatewayProjectUrl()}/rest/v1/rpc/${name}`,
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
      throw new GatewayRequestError(
        response.status >= 500 ? 503 : response.status,
        "OPERATOR_INVITATION_RPC_FAILED",
        "Operator invitation setup is unavailable.",
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof GatewayRequestError) throw error;
    throw new GatewayRequestError(
      503,
      "OPERATOR_INVITATION_RPC_UNAVAILABLE",
      "Operator invitation setup is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function getOperatorInvitationStatus(tokenHash: string) {
  const rows = await rpc<
    Array<{
      valid: boolean;
      masked_email: string | null;
      invited_role: string | null;
      expires_at: string | null;
    }>
  >("gem_operator_invitation_status", { p_token_hash: tokenHash });
  const row = rows[0];
  return {
    valid: row?.valid === true,
    maskedEmail: row?.masked_email ?? null,
    role: row?.invited_role ?? null,
    expiresAt: row?.expires_at ?? null,
  };
}

export async function consumeOperatorInvitation(input: {
  tokenHash: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
}) {
  const rows = await rpc<
    Array<{ ok: boolean; user_id: string | null; email: string | null; role: string | null }>
  >("gem_consume_operator_invitation", {
    p_token_hash: input.tokenHash,
    p_password_hash: input.passwordHash,
    p_first_name: input.firstName ?? null,
    p_last_name: input.lastName ?? null,
  });
  const row = rows[0];
  if (!row?.ok || !row.user_id || !row.email || !row.role) {
    throw new GatewayRequestError(
      400,
      "INVALID_OR_EXPIRED_INVITATION",
      "This operator invitation is invalid, expired, revoked, or already used.",
    );
  }
  return {
    ok: true,
    userId: row.user_id,
    email: row.email,
    role: row.role,
  };
}
