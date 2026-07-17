import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase runtime configuration");
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TOKEN_HASH_PATTERN = /^[a-f0-9]{64}$/;
const REQUEST_ID_PATTERN = /^aar_[a-f0-9]{32}$/;
const PASSWORD_HASH_PATTERN = /^\$2[aby]\$\d{2}\$.{53}$/;

const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Cross-Origin-Resource-Policy": "same-site",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

function invalidValidation() {
  return {
    valid: false,
    expiresAt: null,
    requestId: null,
  };
}

async function validateAuthorization(tokenHash: string, requestId: string) {
  const { data: token, error: tokenError } = await db
    .from("admin_access_tokens")
    .select("user_id, expires_at, request_id")
    .eq("token_hash", tokenHash)
    .eq("request_id", requestId)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (tokenError) {
    console.error("[gem-admin-access-gateway] token validation failed", tokenError.message);
    throw new Error("AUTHORIZATION_LOOKUP_FAILED");
  }
  if (!token) return invalidValidation();

  const { data: account, error: accountError } = await db
    .from("users")
    .select("email, role, status, isActive, isEmailVerified")
    .eq("id", token.user_id)
    .limit(1)
    .maybeSingle();

  if (accountError) {
    console.error("[gem-admin-access-gateway] account validation failed", accountError.message);
    throw new Error("ACCOUNT_LOOKUP_FAILED");
  }

  if (
    !account ||
    account.email !== "admin@gemcybersecurityassist.com" ||
    !["admin", "super_admin", "internal"].includes(account.role) ||
    account.status !== "active" ||
    account.isActive !== true ||
    account.isEmailVerified !== true
  ) {
    return invalidValidation();
  }

  return {
    valid: true,
    expiresAt: token.expires_at,
    requestId: token.request_id,
  };
}

async function consumeAuthorization(
  tokenHash: string,
  requestId: string,
  passwordHash: string,
) {
  const authorization = await validateAuthorization(tokenHash, requestId);
  if (!authorization.valid || authorization.requestId !== requestId) return null;

  const { data, error } = await db.rpc("gem_consume_admin_access_token", {
    p_token_hash: tokenHash,
    p_password_hash: passwordHash,
  });

  if (error) {
    console.error("[gem-admin-access-gateway] token consumption failed", error.message);
    throw new Error("AUTHORIZATION_CONSUMPTION_FAILED");
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.ok || typeof result.email !== "string") {
    return null;
  }

  return {
    ok: true,
    email: result.email,
    loginPath: "/client-login",
  };
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request", code: "INVALID_REQUEST" }, 400);
  }

  const action = typeof body.action === "string" ? body.action : "";
  const tokenHash = typeof body.tokenHash === "string" ? body.tokenHash : "";
  const requestId = typeof body.requestId === "string" ? body.requestId : "";

  if (!TOKEN_HASH_PATTERN.test(tokenHash) || !REQUEST_ID_PATTERN.test(requestId)) {
    if (action === "validate") return json(invalidValidation());
    return json(
      { error: "Invalid or expired setup capability.", code: "INVALID_TOKEN" },
      400,
    );
  }

  try {
    if (action === "validate") {
      return json(await validateAuthorization(tokenHash, requestId));
    }

    if (action === "consume") {
      const passwordHash =
        typeof body.passwordHash === "string" ? body.passwordHash : "";
      if (!PASSWORD_HASH_PATTERN.test(passwordHash)) {
        return json({ error: "Invalid request", code: "INVALID_REQUEST" }, 400);
      }

      const result = await consumeAuthorization(tokenHash, requestId, passwordHash);
      if (!result) {
        return json(
          { error: "Invalid or expired setup capability.", code: "INVALID_TOKEN" },
          400,
        );
      }
      return json(result);
    }

    return json({ error: "Invalid request", code: "UNKNOWN_ACTION" }, 400);
  } catch (error) {
    console.error(
      "[gem-admin-access-gateway] internal failure",
      error instanceof Error ? error.message : "unknown_error",
    );
    return json(
      {
        error: "Administrator authorization is temporarily unavailable.",
        code: "ADMIN_ACCESS_GATEWAY_UNAVAILABLE",
      },
      503,
    );
  }
});
