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

async function invokeWorkspaceOwnerInvitation<T>(
  payload: Record<string, unknown>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const key = gatewayAnonKey();
    const response = await fetch(
      `${gatewayBaseUrl()}/gem-workspace-owner-invitations`,
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
    const body = (await response.json().catch(() => ({}))) as T | {
      error?: string;
      code?: string;
    };
    if (!response.ok) {
      const errorBody = body as { error?: string; code?: string };
      throw new GatewayRequestError(
        response.status,
        errorBody.code || "WORKSPACE_OWNER_INVITATION_FAILED",
        errorBody.error || "Workspace owner invitation request failed.",
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof GatewayRequestError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new GatewayRequestError(
        504,
        "WORKSPACE_OWNER_INVITATION_TIMEOUT",
        "Workspace owner invitation service timed out.",
      );
    }
    throw new GatewayRequestError(
      503,
      "WORKSPACE_OWNER_INVITATION_UNAVAILABLE",
      "Workspace owner invitation service is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export type WorkspaceOwnerInvitationAction = "issue" | "list" | "revoke";

export async function workspaceOwnerInvitationGateway<T>(
  action: WorkspaceOwnerInvitationAction,
  token: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  return invokeWorkspaceOwnerInvitation<T>({ action, token, ...payload });
}

export async function getWorkspaceOwnerInvitationStatus(tokenHash: string) {
  return invokeWorkspaceOwnerInvitation<{
    valid: boolean;
    maskedEmail: string | null;
    organizationName: string | null;
    workspaceName: string | null;
    projectName: string | null;
    expiresAt: string | null;
  }>({ action: "status", tokenHash });
}

export async function consumeWorkspaceOwnerInvitation(input: {
  tokenHash: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}) {
  return invokeWorkspaceOwnerInvitation<{
    ok: true;
    userId: string;
    email: string;
    role: "client";
    organizationId: string;
    workspaceId: string;
    projectId: string | null;
    loginPath: string;
    credentialsExposed: false;
  }>({
    action: "accept",
    tokenHash: input.tokenHash,
    passwordHash: input.passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
  });
}
