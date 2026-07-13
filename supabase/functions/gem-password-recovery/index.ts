import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import bcrypt from "npm:bcryptjs@2.4.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const RESET_EMAIL_FROM = Deno.env.get("RESET_EMAIL_FROM") || "";
const RESET_REPLY_TO = Deno.env.get("RESET_REPLY_TO") || "";
const CANONICAL_APP_ORIGIN = "https://www.gemcybersecurityassist.com";
const RESET_PAGE_URL = `${CANONICAL_APP_ORIGIN}/reset-password`;
const RESET_TTL_SECONDS = 15 * 60;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Missing Supabase runtime configuration");

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

class RecoveryError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
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

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signResetToken(user: { id: string; email: string; passwordHash: string }) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT", kid: "gem-recovery-v2" }));
  const payload = b64url(JSON.stringify({
    sub: user.id,
    email: user.email,
    purpose: "password_reset",
    passwordFingerprint: await sha256(user.passwordHash),
    iat: now,
    exp: now + RESET_TTL_SECONDS,
    iss: "gem-password-recovery",
    aud: "gem-enterprise",
    jti: crypto.randomUUID(),
  }));
  const unsigned = `${header}.${payload}`;
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(unsigned));
  return `${unsigned}.${b64url(new Uint8Array(signature))}`;
}

async function verifyResetToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const unsigned = `${parts[0]}.${parts[1]}`;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(),
      decodeB64url(parts[2]),
      encoder.encode(unsigned),
    );
    if (!valid) return null;
    const claims = JSON.parse(decoder.decode(decodeB64url(parts[1]))) as Record<string, unknown>;
    const now = Math.floor(Date.now() / 1000);
    if (
      claims.purpose !== "password_reset" ||
      claims.iss !== "gem-password-recovery" ||
      claims.aud !== "gem-enterprise" ||
      typeof claims.sub !== "string" ||
      typeof claims.email !== "string" ||
      typeof claims.passwordFingerprint !== "string" ||
      typeof claims.exp !== "number" ||
      claims.exp <= now
    ) return null;
    return {
      userId: claims.sub,
      email: claims.email,
      passwordFingerprint: claims.passwordFingerprint,
    };
  } catch {
    return null;
  }
}

async function audit(userId: string | null, metadata: Record<string, unknown>) {
  const { error } = await db.from("audit_logs").insert({
    id: crypto.randomUUID(),
    userId,
    action: "password_change",
    resource: "auth",
    resourceId: userId,
    metadata,
    createdAt: new Date().toISOString(),
  });
  if (error) console.error("password_recovery_audit_failed", error.message);
}

function emailDeliveryConfigured() {
  return Boolean(RESEND_API_KEY && RESET_EMAIL_FROM);
}

function readiness() {
  return {
    ok: true,
    service: "gem-password-recovery" as const,
    version: "2.0.0",
    emailDeliveryConfigured: emailDeliveryConfigured(),
    canonicalResetPage: RESET_PAGE_URL === "https://www.gemcybersecurityassist.com/reset-password",
    resetPageOrigin: new URL(RESET_PAGE_URL).origin,
    sessionRevocation: true,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendResetEmail(email: string, resetUrl: string) {
  const safeUrl = escapeHtml(resetUrl);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESET_EMAIL_FROM,
      to: [email],
      subject: "Reset your GEM Enterprise password",
      text:
        "A password reset was requested for your GEM Enterprise account. Open this canonical GEM link within 15 minutes: " +
        resetUrl +
        "\n\nIf you did not request this, ignore this message.",
      html:
        "<p>A password reset was requested for your GEM Enterprise account.</p>" +
        `<p><a href="${safeUrl}">Reset your password</a>. This canonical GEM link expires in 15 minutes.</p>` +
        "<p>If you did not request this, ignore this message.</p>",
      ...(RESET_REPLY_TO ? { reply_to: RESET_REPLY_TO } : {}),
    }),
  });
  if (!response.ok) {
    const failure = await response.json().catch(() => ({})) as { name?: string; statusCode?: number };
    console.error("password_recovery_email_failed", response.status, failure.name || "unknown");
    return { sent: false, status: response.status, errorCode: failure.name || "unknown" };
  }
  return { sent: true, status: response.status, errorCode: null };
}

async function requestRecovery(emailInput: unknown) {
  const configured = emailDeliveryConfigured();
  const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
  const syntacticallyValid = email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!syntacticallyValid) {
    return {
      accepted: true,
      recovery: configured ? "email_requested" : "email_not_configured",
      emailDeliveryConfigured: configured,
    };
  }

  const { data: user, error } = await db
    .from("users")
    .select("id,email,passwordHash,status,isActive")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new RecoveryError(503, "DATABASE_ERROR", "Recovery service unavailable");

  const eligible = Boolean(user && user.isActive && user.status === "active");
  let delivery = configured ? "not_applicable" : "provider_not_configured";
  let providerStatus: number | null = null;
  let providerErrorCode: string | null = null;

  if (eligible && user && configured) {
    const token = await signResetToken(user);
    const resetUrl = `${RESET_PAGE_URL}#token=${encodeURIComponent(token)}`;
    const providerResult = await sendResetEmail(user.email, resetUrl);
    delivery = providerResult.sent ? "sent" : "provider_failed";
    providerStatus = providerResult.status;
    providerErrorCode = providerResult.errorCode;
  }

  await audit(user?.id || null, {
    flow: "forgot_password_request",
    accountEligible: eligible,
    delivery,
    provider: configured ? "resend" : "not_configured",
    providerStatus,
    providerErrorCode,
    resetPageOrigin: CANONICAL_APP_ORIGIN,
  });

  return {
    accepted: true,
    recovery: configured ? "email_requested" : "email_not_configured",
    emailDeliveryConfigured: configured,
  };
}

function passwordPolicySatisfied(password: string) {
  return (
    password.length >= 14 &&
    password.length <= 128 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

async function completeRecovery(tokenInput: unknown, passwordInput: unknown) {
  const token = typeof tokenInput === "string" ? tokenInput : "";
  const password = typeof passwordInput === "string" ? passwordInput : "";
  if (token.length < 20 || token.length > 4096) {
    throw new RecoveryError(400, "INVALID_TOKEN", "Invalid or expired reset link");
  }
  if (!passwordPolicySatisfied(password)) {
    throw new RecoveryError(422, "PASSWORD_POLICY_FAILED", "Use 14–128 characters with upper, lower, number, and symbol.");
  }

  const claims = await verifyResetToken(token);
  if (!claims) throw new RecoveryError(400, "INVALID_TOKEN", "Invalid or expired reset link");

  const { data: user, error } = await db
    .from("users")
    .select("id,email,passwordHash,status,isActive,sessionVersion")
    .eq("id", claims.userId)
    .maybeSingle();
  if (error) throw new RecoveryError(503, "DATABASE_ERROR", "Recovery service unavailable");
  if (
    !user ||
    !user.isActive ||
    user.status !== "active" ||
    user.email !== claims.email ||
    (await sha256(user.passwordHash)) !== claims.passwordFingerprint
  ) {
    throw new RecoveryError(400, "INVALID_TOKEN", "Invalid or expired reset link");
  }
  if (await bcrypt.compare(password, user.passwordHash)) {
    throw new RecoveryError(409, "PASSWORD_REUSED", "Choose a different password");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date().toISOString();
  const { data: changed, error: updateError } = await db
    .from("users")
    .update({ passwordHash, updatedAt: now })
    .eq("id", user.id)
    .eq("passwordHash", user.passwordHash)
    .eq("sessionVersion", user.sessionVersion)
    .select("id,sessionVersion")
    .maybeSingle();
  if (updateError) throw new RecoveryError(503, "DATABASE_ERROR", "Recovery service unavailable");
  if (!changed || changed.sessionVersion <= user.sessionVersion) {
    throw new RecoveryError(400, "INVALID_TOKEN", "Invalid or expired reset link");
  }

  await audit(user.id, {
    flow: "forgot_password_reset",
    result: "success",
    tokenVersion: "gem-recovery-v2",
    sessionsRevoked: true,
    sessionVersion: changed.sessionVersion,
  });

  return {
    ok: true,
    userId: user.id,
    sessionVersion: changed.sessionVersion,
    sessionsRevoked: true,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (request.method === "GET") return json(readiness());
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.action === "readiness") return json(readiness());
    if (body.action === "request") return json(await requestRecovery(body.email));
    if (body.action === "complete") return json(await completeRecovery(body.token, body.newPassword));
    throw new RecoveryError(400, "UNKNOWN_ACTION", "Unknown action");
  } catch (error) {
    if (error instanceof RecoveryError) {
      return json({ error: error.message, code: error.code }, error.status);
    }
    console.error("password_recovery_internal_error", error);
    return json({ error: "Recovery service unavailable", code: "INTERNAL_ERROR" }, 500);
  }
});
