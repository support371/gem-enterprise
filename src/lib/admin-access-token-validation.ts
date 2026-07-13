const DEFAULT_SUPABASE_URL = "https://slzdjoqpzbkwzuaexlkj.supabase.co";
const DEFAULT_PUBLISHABLE_KEY =
  "sb_publishable_3VgoXwVcWcoxNM2O-89hkw_uLxBNzd1";
const REQUEST_TIMEOUT_MS = 15_000;

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

function projectUrl(): string {
  const configured = process.env.GEM_SUPABASE_GATEWAY_BASE_URL?.trim();
  if (!configured) return DEFAULT_SUPABASE_URL;
  return configured.replace(/\/functions\/v1\/?$/, "").replace(/\/$/, "");
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

export async function validateAdminAccessToken(
  accessToken: string,
): Promise<AdminAccessTokenValidation> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const key = publishableKey();
    const response = await fetch(
      `${projectUrl()}/rest/v1/rpc/gem_validate_admin_access_token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_token_hash: await sha256Hex(accessToken),
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    const body = (await response.json().catch(() => null)) as
      | Array<{
          valid?: boolean;
          expires_at?: string | null;
          request_id?: string | null;
        }>
      | { message?: string }
      | null;

    if (!response.ok) {
      throw new AdminAccessValidationError(
        response.status >= 500 ? 503 : response.status,
        "ADMIN_ACCESS_VALIDATION_FAILED",
        "Administrator authorization could not be validated.",
      );
    }

    const result = Array.isArray(body) ? body[0] : null;
    return {
      valid: result?.valid === true,
      expiresAt:
        result?.valid === true && typeof result.expires_at === "string"
          ? result.expires_at
          : null,
      requestId:
        result?.valid === true && typeof result.request_id === "string"
          ? result.request_id
          : null,
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
