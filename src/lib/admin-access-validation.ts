const DEFAULT_SUPABASE_URL = "https://slzdjoqpzbkwzuaexlkj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsemRqb3FwemJrd3p1YWV4bGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTk1MTQsImV4cCI6MjA5ODg3NTUxNH0.0wfgX_m6SBn_TtD0ZNjkOZ-bk8Frp2Tq1HL9mYFBm4M";

export interface AdminAccessValidationResult {
  valid: boolean;
  expiresAt: string | null;
  requestId: string | null;
}

function projectUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL
  ).replace(/\/$/, "");
}

function publishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    DEFAULT_SUPABASE_ANON_KEY
  );
}

async function sha256Hex(value: string) {
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
): Promise<AdminAccessValidationResult> {
  const tokenHash = await sha256Hex(accessToken);
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
      body: JSON.stringify({ p_token_hash: tokenHash }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Administrator authorization validation is unavailable.");
  }

  const body = (await response.json().catch(() => [])) as Array<{
    valid?: boolean;
    expires_at?: string | null;
    request_id?: string | null;
  }>;
  const result = body[0];

  return {
    valid: result?.valid === true,
    expiresAt: result?.expires_at ?? null,
    requestId: result?.request_id ?? null,
  };
}
