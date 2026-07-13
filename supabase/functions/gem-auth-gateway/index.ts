import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import bcrypt from "npm:bcryptjs@2.4.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Missing Supabase runtime configuration");

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PLACEHOLDER_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKxGhuM6NXk0RvPhgZQ1.0Y8wIJtZk4jAr8s2";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

class GatewayError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function b64url(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeB64url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SERVICE_ROLE_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signToken(userId: string, email: string, role: string, sessionVersion: number) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT", kid: "gem-auth-v2" }));
  const payload = b64url(JSON.stringify({
    sub: userId,
    email,
    role,
    sessionVersion,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    iss: "gem-auth-gateway",
    aud: "gem-enterprise",
    jti: crypto.randomUUID(),
  }));
  const unsigned = `${header}.${payload}`;
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(unsigned));
  return `${unsigned}.${b64url(new Uint8Array(signature))}`;
}

async function verifyToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new GatewayError(401, "INVALID_SESSION", "Invalid session token");
  const unsigned = `${parts[0]}.${parts[1]}`;
  const valid = await crypto.subtle.verify(
    "HMAC",
    await signingKey(),
    decodeB64url(parts[2]),
    encoder.encode(unsigned),
  );
  if (!valid) throw new GatewayError(401, "INVALID_SESSION", "Invalid session token");
  const payload = JSON.parse(decoder.decode(decodeB64url(parts[1]))) as Record<string, unknown>;
  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  const sessionVersion = typeof payload.sessionVersion === "number" ? payload.sessionVersion : -1;
  if (!userId || exp <= Math.floor(Date.now() / 1000)) {
    throw new GatewayError(401, "SESSION_EXPIRED", "Session expired");
  }
  if (!Number.isSafeInteger(sessionVersion) || sessionVersion < 0) {
    throw new GatewayError(401, "SESSION_REVOKED", "Session is no longer valid");
  }
  if (payload.iss !== "gem-auth-gateway" || payload.aud !== "gem-enterprise") {
    throw new GatewayError(401, "INVALID_SESSION", "Invalid session issuer");
  }
  return { userId, sessionVersion };
}

async function audit(userId: string | null, action: "login" | "failed_login" | "password_change", metadata: Record<string, unknown>) {
  const { error } = await db.from("audit_logs").insert({
    id: crypto.randomUUID(),
    userId,
    action,
    resource: "auth",
    resourceId: userId,
    metadata,
    createdAt: new Date().toISOString(),
  });
  if (error) console.error("audit", error.message);
}

async function userContext(userId: string, expectedSessionVersion?: number) {
  const { data: user, error } = await db
    .from("users")
    .select("id,email,role,status,organizationId,isActive,isEmailVerified,sessionVersion")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new GatewayError(503, "DATABASE_ERROR", error.message);
  if (!user) throw new GatewayError(401, "ACCOUNT_NOT_FOUND", "Account not found");
  if (!user.isActive || user.status === "suspended") {
    throw new GatewayError(403, "ACCOUNT_DISABLED", "Account is not active");
  }
  if (
    expectedSessionVersion !== undefined &&
    user.sessionVersion !== expectedSessionVersion
  ) {
    throw new GatewayError(401, "SESSION_REVOKED", "Session is no longer valid");
  }

  const [kyc, entitlements, portfolio] = await Promise.all([
    db.from("kyc_applications").select("id,status").eq("userId", user.id).order("createdAt", { ascending: false }).limit(1).maybeSingle(),
    db.from("entitlements").select("slug").eq("userId", user.id).eq("isActive", true),
    db.from("portfolio_memberships").select("portfolioId").eq("userId", user.id).order("assignedAt", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (kyc.error) throw new GatewayError(503, "DATABASE_ERROR", kyc.error.message);
  if (entitlements.error) throw new GatewayError(503, "DATABASE_ERROR", entitlements.error.message);
  if (portfolio.error) throw new GatewayError(503, "DATABASE_ERROR", portfolio.error.message);

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    kycStatus: kyc.data?.status ?? "not_started",
    kycApplicationId: kyc.data?.id ?? undefined,
    entitlements: (entitlements.data ?? []).map((item) => item.slug),
    portfolioId: portfolio.data?.portfolioId ?? undefined,
    organizationId: user.organizationId ?? undefined,
    sessionVersion: user.sessionVersion,
    authSource: "supabase_gateway",
  };
}

async function login(emailInput: unknown, passwordInput: unknown) {
  const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
  const password = typeof passwordInput === "string" ? passwordInput : "";
  if (!email || !password || password.length > 256) {
    throw new GatewayError(400, "INVALID_REQUEST", "Email and password are required");
  }

  const { data: user, error } = await db
    .from("users")
    .select("id,email,passwordHash,role,status,isActive,sessionVersion")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new GatewayError(503, "DATABASE_ERROR", error.message);

  const valid = await bcrypt.compare(password, user?.passwordHash ?? PLACEHOLDER_HASH);
  if (!user || !valid) {
    await audit(user?.id ?? null, "failed_login", { email, reason: user ? "bad_password" : "unknown_user" });
    throw new GatewayError(401, "INVALID_CREDENTIALS", "Invalid credentials");
  }
  if (!user.isActive || user.status === "suspended") {
    await audit(user.id, "failed_login", { email, reason: "disabled" });
    throw new GatewayError(403, "ACCOUNT_DISABLED", "Account is not active");
  }

  const session = await userContext(user.id);
  const token = await signToken(session.userId, session.email, session.role, session.sessionVersion);
  const now = new Date().toISOString();
  const { error: updateError } = await db.from("users").update({ lastLoginAt: now, updatedAt: now }).eq("id", user.id);
  if (updateError) throw new GatewayError(503, "DATABASE_ERROR", updateError.message);
  await audit(user.id, "login", {
    email: user.email,
    source: "supabase_gateway",
    sessionVersion: session.sessionVersion,
  });
  return { token, session, expiresIn: SESSION_TTL_SECONDS };
}

async function bootstrapStatus() {
  const { data, error } = await db
    .from("users")
    .select("email,role,status,isActive,isEmailVerified,createdAt")
    .in("role", ["admin", "super_admin", "internal"])
    .eq("isActive", true)
    .order("createdAt", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new GatewayError(503, "DATABASE_ERROR", error.message);
  return { configured: Boolean(data), admin: data ?? null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method === "GET") {
    return json({
      ok: true,
      service: "gem-auth-gateway",
      version: "2.0.0",
      sessionRevocation: true,
    });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json() as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    if (action === "login") return json(await login(body.email, body.password));
    if (action === "verify") {
      const token = typeof body.token === "string" ? body.token : "";
      const claims = await verifyToken(token);
      return json({ session: await userContext(claims.userId, claims.sessionVersion) });
    }
    if (action === "bootstrap_status") return json(await bootstrapStatus());
    throw new GatewayError(400, "UNKNOWN_ACTION", "Unknown action");
  } catch (error) {
    if (error instanceof GatewayError) return json({ error: error.message, code: error.code }, error.status);
    console.error(error);
    return json({ error: "Internal gateway error", code: "INTERNAL_ERROR" }, 500);
  }
});
