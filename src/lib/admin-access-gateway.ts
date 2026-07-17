import bcrypt from "bcryptjs";

const DEFAULT_GATEWAY_BASE_URL =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1";
const DEFAULT_GATEWAY_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsemRqb3FwemJrd3p1YWV4bGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTk1MTQsImV4cCI6MjA5ODg3NTUxNH0.0wfgX_m6SBn_TtD0ZNjkOZ-bk8Frp2Tq1HL9mYFBm4M";
const REQUEST_TIMEOUT_MS = 60_000;
const ACCESS_TOKEN_PATTERN = /^(aar_[a-f0-9]{32})\.([A-Za-z0-9_-]{48,128})$/;

export interface AdminAccessTokenValidation {
  valid: boolean;
  expiresAt: string | null;
  requestId: string | null;
}

interface GatewayErrorBody {
  error?: string;
  code?: string;
}

export class AdminAccessGatewayError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdminAccessGatewayError";
  }
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

function requestIdFromAccessToken(accessToken: string): string {
  const match = ACCESS_TOKEN_PATTERN.exec(accessToken);
  if (!match) {
    throw new AdminAccessGatewayError(
      400,
      "INVALID_TOKEN",
      "Invalid or expired setup capability.",
    );
  }
  return match[1];
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function invokeAdminAccessGateway<T>(
  payload: Record<string, unknown>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const key = gatewayAnonKey();
    const response = await fetch(`${gatewayBaseUrl()}/gem-admin-access-gateway`, {
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
    const body = (await response.json().catch(() => ({}))) as T | GatewayErrorBody;

    if (!response.ok) {
      const errorBody = body as GatewayErrorBody;
      throw new AdminAccessGatewayError(
        response.status >= 500 ? 503 : response.status,
        errorBody.code || "ADMIN_ACCESS_GATEWAY_FAILED",
        errorBody.error || "Administrator authorization is unavailable.",
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof AdminAccessGatewayError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AdminAccessGatewayError(
        504,
        "ADMIN_ACCESS_GATEWAY_TIMEOUT",
        "Administrator authorization timed out.",
      );
    }
    throw new AdminAccessGatewayError(
      503,
      "ADMIN_ACCESS_GATEWAY_UNAVAILABLE",
      "Administrator authorization is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function validateAdminAccessTokenWithGateway(
  accessToken: string,
): Promise<AdminAccessTokenValidation> {
  const requestId = requestIdFromAccessToken(accessToken);
  const result = await invokeAdminAccessGateway<AdminAccessTokenValidation>({
    action: "validate",
    tokenHash: await sha256Hex(accessToken),
    requestId,
  });

  if (result.valid && result.requestId !== requestId) {
    throw new AdminAccessGatewayError(
      400,
      "INVALID_TOKEN",
      "Invalid or expired setup capability.",
    );
  }

  return result;
}

export async function setAdminPasswordWithAccessToken<T>(
  accessToken: string,
  password: string,
): Promise<T> {
  const requestId = requestIdFromAccessToken(accessToken);
  const result = await invokeAdminAccessGateway<{
    ok: boolean;
    email: string;
    loginPath: string;
  }>({
    action: "consume",
    tokenHash: await sha256Hex(accessToken),
    requestId,
    passwordHash: await bcrypt.hash(password, 12),
  });

  if (!result.ok || !result.email) {
    throw new AdminAccessGatewayError(
      400,
      "INVALID_TOKEN",
      "Invalid or expired setup capability.",
    );
  }

  return result as T;
}
