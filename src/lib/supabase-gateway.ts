import type { SessionPayload } from "@/lib/auth";

const DEFAULT_GATEWAY_BASE_URL =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1";
const DEFAULT_GATEWAY_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsemRqb3FwemJrd3p1YWV4bGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTk1MTQsImV4cCI6MjA5ODg3NTUxNH0.0wfgX_m6SBn_TtD0ZNjkOZ-bk8Frp2Tq1HL9mYFBm4M";
const GATEWAY_COOKIE_PREFIX = "sg1.";
const REQUEST_TIMEOUT_MS = 60_000;

export class GatewayRequestError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "GatewayRequestError";
  }
}

interface GatewayErrorBody {
  error?: string;
  code?: string;
}

interface GatewayLoginResponse {
  token: string;
  session: SessionPayload;
  expiresIn: number;
}

function gatewayBaseUrl(): string {
  return (
    process.env.GEM_SUPABASE_GATEWAY_BASE_URL?.trim() ||
    DEFAULT_GATEWAY_BASE_URL
  ).replace(/\/$/, "");
}

function gatewayAnonKey(): string {
  return (
    process.env.GEM_SUPABASE_GATEWAY_ANON_KEY?.trim() ||
    DEFAULT_GATEWAY_ANON_KEY
  );
}

export function hasDirectDatabaseConfiguration(): boolean {
  return Boolean(
    process.env.POSTGRES_PRISMA_URL?.trim() ||
      process.env.DATABASE_URL?.trim() ||
      process.env.POSTGRES_URL?.trim() ||
      process.env.NEON_DATABASE_URL?.trim(),
  );
}

export function shouldUseSupabaseGateway(): boolean {
  if (process.env.GEM_AUTH_GATEWAY_ENABLED === "false") return false;
  if (process.env.GEM_AUTH_GATEWAY_ENABLED === "true") return true;
  return !hasDirectDatabaseConfiguration();
}

async function invokeGateway<T>(
  functionName: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const key = gatewayAnonKey();
    const response = await fetch(`${gatewayBaseUrl()}/${functionName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => ({}))) as
      | T
      | GatewayErrorBody;

    if (!response.ok) {
      const errorBody = body as GatewayErrorBody;
      throw new GatewayRequestError(
        response.status,
        errorBody.code || "GATEWAY_REQUEST_FAILED",
        errorBody.error || "Gateway request failed.",
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof GatewayRequestError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new GatewayRequestError(
        504,
        "GATEWAY_TIMEOUT",
        "Supabase gateway timed out.",
      );
    }
    throw new GatewayRequestError(
      503,
      "GATEWAY_UNAVAILABLE",
      "Supabase gateway is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function evidenceGatewayHealth<T = {
  ok: boolean;
  service: string;
  version: string;
  failClosed: boolean;
}>(): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const key = gatewayAnonKey();
    const response = await fetch(
      `${gatewayBaseUrl()}/gem-verify-evidence-gateway`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );
    const body = (await response.json().catch(() => ({}))) as T | GatewayErrorBody;
    if (!response.ok) {
      const errorBody = body as GatewayErrorBody;
      throw new GatewayRequestError(
        response.status,
        errorBody.code || "EVIDENCE_GATEWAY_UNAVAILABLE",
        errorBody.error || "Evidence gateway is unavailable.",
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof GatewayRequestError) throw error;
    throw new GatewayRequestError(
      503,
      "EVIDENCE_GATEWAY_UNAVAILABLE",
      "Evidence gateway is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function wrapGatewayToken(token: string): string {
  return `${GATEWAY_COOKIE_PREFIX}${token}`;
}

export function isWrappedGatewayToken(value: string): boolean {
  return value.startsWith(GATEWAY_COOKIE_PREFIX);
}

export function unwrapGatewayToken(value: string): string | null {
  if (!isWrappedGatewayToken(value)) return null;
  const token = value.slice(GATEWAY_COOKIE_PREFIX.length);
  return token.length > 20 ? token : null;
}

export async function loginWithGateway(
  email: string,
  password: string,
): Promise<GatewayLoginResponse> {
  return invokeGateway<GatewayLoginResponse>("gem-auth-gateway", {
    action: "login",
    email,
    password,
  });
}

export async function verifyGatewaySession(
  token: string,
): Promise<SessionPayload> {
  const response = await invokeGateway<{ session: SessionPayload }>(
    "gem-auth-gateway",
    { action: "verify", token },
  );
  return { ...response.session, authSource: "supabase_gateway" };
}

export async function bootstrapGatewayStatus<T>(): Promise<T> {
  return invokeGateway<T>("gem-auth-gateway", {
    action: "bootstrap_status",
  });
}

export async function adminReadGateway<T>(
  action: "users" | "stats" | "pilot_readiness" | "audit",
  token: string,
): Promise<T> {
  return invokeGateway<T>("gem-admin-read", { action, token });
}

export type AdminWriteGatewayAction =
  | "update_user"
  | "retention_policy_list"
  | "retention_policy_create"
  | "retention_policy_action";

export async function adminWriteGateway<T>(
  action: AdminWriteGatewayAction,
  token: string,
  payload: Record<string, unknown>,
): Promise<T> {
  return invokeGateway<T>("gem-admin-write", {
    action,
    token,
    ...payload,
  });
}

export type EvidenceGatewayAction =
  | "readiness"
  | "upload_intent"
  | "complete"
  | "items"
  | "review_url"
  | "status"
  | "approve_operations"
  | "activate_uploads"
  | "deactivate_uploads";

export async function evidenceGateway<T>(
  action: EvidenceGatewayAction,
  token: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  return invokeGateway<T>("gem-verify-evidence-gateway", {
    action,
    token,
    ...payload,
  });
}

export async function e2eProvisionGateway<T>(
  action: "create" | "cleanup",
  payload: Record<string, unknown>,
): Promise<T> {
  return invokeGateway<T>("gem-e2e-provision", {
    action,
    ...payload,
  });
}

export async function runPendingAdminLoginSmoke<T>(): Promise<T> {
  return invokeGateway<T>("gem-admin-login-smoke", {});
}

export async function setAdminPasswordWithAccessToken<T>(
  accessToken: string,
  password: string,
): Promise<T> {
  return invokeGateway<T>("gem-admin-access", {
    action: "set_password",
    accessToken,
    password,
  });
}
