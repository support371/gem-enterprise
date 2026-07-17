const DEFAULT_GATEWAY_BASE_URL =
  "https://slzdjoqpzbkwzuaexlkj.supabase.co/functions/v1";
const DEFAULT_PUBLISHABLE_KEY =
  "sb_publishable_3VgoXwVcWcoxNM2O-89hkw_uLxBNzd1";
const REQUEST_TIMEOUT_MS = 15_000;
const ACCESS_TOKEN_PATTERN = /^(aar_[a-f0-9]{32})\.([A-Za-z0-9_-]{48,128})$/;

export interface AdminAccessTokenValidation {
  valid: boolean;
  expiresAt: string | null;
  requestId: string | null;
}

export class AdminAccessValidationError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdminAccessValidationError";
  }
}

function gatewayBaseUrl(): string {
  return (
    process.env.GEM_SUPABASE_GATEWAY_BASE_URL?.trim() ||
    DEFAULT_GATEWAY_BASE_URL
  ).replace(/\/$/, "");
}

function publishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.GEM_SUPABASE_GATEWAY_ANON_KEY?.trim() ||
    DEFAULT_PUBLISHABLE_KEY
  );
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

function requestIdFromAccessToken(accessToken: string): string {
  const match = ACCESS_TOKEN_PATTERN.exec(accessToken);
  if (!match) {
    throw new AdminAccessValidationError(
      400,
      "INVALID_TOKEN",
      "Administrator authorization is invalid or expired.",
    );
  }
  return match[1];
}

export async function validateAdminAccessToken(
  accessToken: string,
): Promise<AdminAccessTokenValidation> {
  const requestId = requestIdFromAccessToken(accessToken);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const key = publishableKey();
    const response = await fetch(`${gatewayBaseUrl()}/gem-admin-access-status`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tokenHash: await sha256Hex(accessToken),
        requestId,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => null)) as
      | { active?: boolean; expiresAt?: string | null; error?: string }
      | null;

    if (!response.ok) {
      throw new AdminAccessValidationError(
        response.status >= 500 ? 503 : response.status,
        "ADMIN_ACCESS_VALIDATION_FAILED",
        "Administrator authorization could not be validated.",
      );
    }

    const valid = body?.active === true;
    return {
      valid,
      expiresAt:
        valid && typeof body?.expiresAt === "string" ? body.expiresAt : null,
      requestId: valid ? requestId : null,
    };
  } catch (error) {
    if (error instanceof AdminAccessValidationError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AdminAccessValidationError(
        504,
        "ADMIN_ACCESS_VALIDATION_TIMEOUT",
        "Administrator authorization validation timed out.",
      );
    }
    throw new AdminAccessValidationError(
      503,
      "ADMIN_ACCESS_VALIDATION_UNAVAILABLE",
      "Administrator authorization validation is unavailable.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
