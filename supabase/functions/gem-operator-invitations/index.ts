import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Missing Supabase runtime configuration");

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ORIGIN = "https://www.gemcybersecurityassist.com";
const ALLOWED_ROLES = new Set(["analyst", "admin"]);
const ISSUER_ROLES = new Set(["super_admin", "internal"]);
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

class InvitationError extends Error {
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
      "X-Content-Type-Options": "nosniff",
    },
  });
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
    ["verify"],
  );
}

async function verifyGatewayToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new InvitationError(401, "INVALID_SESSION", "Invalid session token");
  const unsigned = `${parts[0]}.${parts[1]}`;
  const valid = await crypto.subtle.verify(
    "HMAC",
    await signingKey(),
    decodeB64url(parts[2]),
    encoder.encode(unsigned),
  );
  if (!valid) throw new InvitationError(401, "INVALID_SESSION", "Invalid session token");
  const payload = JSON.parse(decoder.decode(decodeB64url(parts[1]))) as Record<string, unknown>;
  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  if (!userId || exp <= Math.floor(Date.now() / 1000)) {
    throw new InvitationError(401, "SESSION_EXPIRED", "Session expired");
  }
  if (payload.iss !== "gem-auth-gateway" || payload.aud !== "gem-enterprise") {
    throw new InvitationError(401, "INVALID_SESSION", "Invalid session issuer");
  }
  return userId;
}

async function requireIssuer(token: unknown) {
  const raw = typeof token === "string" ? token : "";
  if (!raw) throw new InvitationError(401, "UNAUTHORIZED", "A valid GEM session is required");
  const userId = await verifyGatewayToken(raw);
  const { data: user, error } = await db
    .from("users")
    .select("id,email,role,status,isActive,isEmailVerified")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new InvitationError(503, "DATABASE_ERROR", error.message);
  if (!user || !user.isActive || user.status !== "active" || !user.isEmailVerified) {
    throw new InvitationError(403, "ACCOUNT_DISABLED", "Account is not active and verified");
  }
  if (!ISSUER_ROLES.has(user.role)) {
    throw new InvitationError(403, "FORBIDDEN", "Super administrator access is required");
  }
  return user;
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Hex(value: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return Array.from(digest).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeEmail(value: unknown) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new InvitationError(400, "INVALID_EMAIL", "A valid operator email is required");
  }
  return email;
}

function normalizeName(value: unknown) {
  const name = typeof value === "string" ? value.trim() : "";
  if (name.length > 80) throw new InvitationError(400, "INVALID_NAME", "Name is too long");
  return name || null;
}

async function audit(userId: string, action: string, resourceId: string, metadata: Record<string, unknown>) {
  const { error } = await db.from("audit_logs").insert({
    id: crypto.randomUUID(),
    userId,
    action,
    resource: "operator_invitation",
    resourceId,
    metadata,
    createdAt: new Date().toISOString(),
  });
  if (error) console.error("operator invitation audit", error.message);
}

async function issue(user: any, body: Record<string, unknown>) {
  const email = normalizeEmail(body.email);
  const role = typeof body.role === "string" ? body.role : "";
  if (!ALLOWED_ROLES.has(role)) {
    throw new InvitationError(400, "INVALID_ROLE", "Operator role must be analyst or admin");
  }
  const firstName = normalizeName(body.firstName);
  const lastName = normalizeName(body.lastName);
  const requestedMinutes = Number(body.expiresMinutes ?? 60);
  const expiresMinutes = Number.isInteger(requestedMinutes)
    ? Math.max(15, Math.min(requestedMinutes, 1440))
    : 60;

  const { data: existingUser, error: existingError } = await db
    .from("users")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (existingError) throw new InvitationError(503, "DATABASE_ERROR", existingError.message);
  if (existingUser) throw new InvitationError(409, "EMAIL_ALREADY_REGISTERED", "This email already belongs to a GEM account");

  await db
    .from("gem_operator_invitations")
    .update({ revoked_at: new Date().toISOString(), metadata: { reason: "superseded" } })
    .ilike("email", email)
    .is("used_at", null)
    .is("revoked_at", null);

  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = base64Url(tokenBytes);
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + expiresMinutes * 60_000).toISOString();

  const { data: invitation, error } = await db
    .from("gem_operator_invitations")
    .insert({
      email,
      role,
      first_name: firstName,
      last_name: lastName,
      token_hash: tokenHash,
      created_by_user_id: user.id,
      expires_at: expiresAt,
      metadata: {
        delivery: "administrator_secure_channel",
        tokenStoredInPlaintext: false,
        invitationVersion: "1.0.0",
      },
    })
    .select("id,email,role,first_name,last_name,expires_at,created_at")
    .single();
  if (error) throw new InvitationError(503, "INVITATION_CREATE_FAILED", error.message);

  await audit(user.id, "operator_invitation_issued", invitation.id, {
    email,
    role,
    expiresAt,
    plaintextTokenStored: false,
  });

  return {
    ok: true,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      firstName: invitation.first_name,
      lastName: invitation.last_name,
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
    },
    setupUrl: `${ORIGIN}/operator-invitation#${token}`,
    safeguards: {
      tokenReturnedOnce: true,
      tokenStoredInPlaintext: false,
      tokenInUrlFragment: true,
      passwordNotGenerated: true,
      expiresMinutes,
    },
  };
}

async function listInvitations(user: any) {
  const { data, error } = await db
    .from("gem_operator_invitations")
    .select("id,email,role,first_name,last_name,expires_at,used_at,revoked_at,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new InvitationError(503, "DATABASE_ERROR", error.message);
  return {
    ok: true,
    viewerRole: user.role,
    invitations: (data ?? []).map((item) => ({
      id: item.id,
      email: item.email,
      role: item.role,
      firstName: item.first_name,
      lastName: item.last_name,
      expiresAt: item.expires_at,
      usedAt: item.used_at,
      revokedAt: item.revoked_at,
      createdAt: item.created_at,
      status: item.used_at
        ? "used"
        : item.revoked_at
          ? "revoked"
          : new Date(item.expires_at).getTime() <= Date.now()
            ? "expired"
            : "active",
    })),
    secretValuesExposed: false,
  };
}

async function revoke(user: any, body: Record<string, unknown>) {
  const id = typeof body.id === "string" ? body.id : "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new InvitationError(400, "INVALID_INVITATION_ID", "Invitation identifier is invalid");
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("gem_operator_invitations")
    .update({ revoked_at: now, metadata: { reason: "administrator_revoked" } })
    .eq("id", id)
    .is("used_at", null)
    .is("revoked_at", null)
    .select("id,email,role")
    .maybeSingle();
  if (error) throw new InvitationError(503, "INVITATION_REVOKE_FAILED", error.message);
  if (!data) throw new InvitationError(409, "INVITATION_NOT_ACTIVE", "Invitation is not active");
  await audit(user.id, "operator_invitation_revoked", data.id, {
    email: data.email,
    role: data.role,
  });
  return { ok: true, invitationId: data.id, revokedAt: now };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method === "GET") {
    return json({
      ok: true,
      service: "gem-operator-invitations",
      version: "1.0.0",
      plaintextTokensStored: false,
      allowedRoles: Array.from(ALLOWED_ROLES),
    });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json() as Record<string, unknown>;
    const user = await requireIssuer(body.token);
    const action = typeof body.action === "string" ? body.action : "";
    if (action === "issue") return json(await issue(user, body), 201);
    if (action === "list") return json(await listInvitations(user));
    if (action === "revoke") return json(await revoke(user, body));
    throw new InvitationError(400, "UNKNOWN_ACTION", "Unknown action");
  } catch (error) {
    if (error instanceof InvitationError) {
      return json({ error: error.message, code: error.code }, error.status);
    }
    console.error(error);
    return json({ error: "Operator invitation service failed", code: "INTERNAL_ERROR" }, 500);
  }
});
