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
const ISSUER_ROLES = new Set(["super_admin", "internal"]);
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
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
      "Referrer-Policy": "no-referrer",
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
    throw new InvitationError(403, "FORBIDDEN", "Platform Owner access is required");
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
    throw new InvitationError(400, "INVALID_EMAIL", "A valid organization-owner email is required");
  }
  return email;
}

function normalizeName(value: unknown, field: string, max = 120, required = true) {
  const name = typeof value === "string" ? value.trim() : "";
  if ((required && name.length < 2) || name.length > max) {
    throw new InvitationError(400, "INVALID_NAME", `${field} is invalid`);
  }
  return name || null;
}

function normalizeSummary(value: unknown) {
  const summary = typeof value === "string" ? value.trim() : "";
  if (summary.length > 2000) throw new InvitationError(400, "INVALID_SUMMARY", "Project summary is too long");
  return summary || null;
}

function slug(value: string) {
  const result = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!result) throw new InvitationError(400, "INVALID_SLUG", "A valid name is required");
  return result;
}

function requireTokenHash(value: unknown) {
  const tokenHash = typeof value === "string" ? value.toLowerCase() : "";
  if (!SHA256_PATTERN.test(tokenHash)) {
    throw new InvitationError(400, "INVALID_INVITATION", "Invitation capability is invalid");
  }
  return tokenHash;
}

async function audit(userId: string, operation: string, resourceId: string, metadata: Record<string, unknown>) {
  const { error } = await db.from("audit_logs").insert({
    id: crypto.randomUUID(),
    userId,
    action: "admin_action",
    resource: "workspace_owner_invitation",
    resourceId,
    metadata: { operation, ...metadata },
    createdAt: new Date().toISOString(),
  });
  if (error) console.error("workspace owner invitation audit", error.message);
}

async function publicStatus(body: Record<string, unknown>) {
  const tokenHash = requireTokenHash(body.tokenHash);
  const { data, error } = await db.rpc("gem_workspace_owner_invitation_status", {
    p_token_hash: tokenHash,
  });
  if (error) throw new InvitationError(503, "INVITATION_STATUS_FAILED", "Invitation status is unavailable");
  const row = Array.isArray(data) ? data[0] : null;
  return {
    valid: row?.valid === true,
    maskedEmail: row?.masked_email ?? null,
    organizationName: row?.organization_name ?? null,
    workspaceName: row?.workspace_name ?? null,
    projectName: row?.project_name ?? null,
    expiresAt: row?.expires_at ?? null,
  };
}

async function publicAccept(body: Record<string, unknown>) {
  const tokenHash = requireTokenHash(body.tokenHash);
  const passwordHash = typeof body.passwordHash === "string" ? body.passwordHash : "";
  if (passwordHash.length < 50 || !passwordHash.startsWith("$2")) {
    throw new InvitationError(400, "INVALID_PASSWORD_HASH", "Password setup is invalid");
  }
  const firstName = normalizeName(body.firstName, "First name", 80);
  const lastName = normalizeName(body.lastName, "Last name", 80);
  const { data, error } = await db.rpc("gem_consume_workspace_owner_invitation", {
    p_token_hash: tokenHash,
    p_password_hash: passwordHash,
    p_first_name: firstName,
    p_last_name: lastName,
  });
  if (error) throw new InvitationError(503, "INVITATION_ACCEPT_FAILED", "Workspace owner account could not be created");
  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.ok || !row.user_id || !row.email || !row.organization_id || !row.workspace_id) {
    throw new InvitationError(400, "INVALID_OR_EXPIRED_INVITATION", "This invitation is invalid, expired, revoked, or already used");
  }
  return {
    ok: true,
    userId: row.user_id,
    email: row.email,
    role: "client",
    organizationId: row.organization_id,
    workspaceId: row.workspace_id,
    projectId: row.project_id ?? null,
    loginPath: "/client-login?next=%2Fapp%2Fworkspace",
    credentialsExposed: false,
  };
}

async function issue(user: { id: string }, body: Record<string, unknown>) {
  const email = normalizeEmail(body.email);
  const confirmEmail = normalizeEmail(body.confirmEmail);
  if (email !== confirmEmail) throw new InvitationError(400, "EMAIL_CONFIRMATION_MISMATCH", "Email confirmation does not match");
  const firstName = normalizeName(body.firstName, "First name", 80);
  const lastName = normalizeName(body.lastName, "Last name", 80);
  const organizationName = normalizeName(body.organizationName, "Organization name")!;
  const workspaceName = normalizeName(body.workspaceName, "Workspace name")!;
  const projectName = normalizeName(body.projectName, "Project name", 120, false);
  const projectSummary = normalizeSummary(body.projectSummary);
  const reason = normalizeName(body.reason, "Written reason", 500)!;
  if (reason.length < 12) throw new InvitationError(400, "INVALID_REASON", "Written reason must be at least 12 characters");
  const organizationSlug = slug(organizationName);
  const workspaceSlug = slug(workspaceName);
  const projectSlug = projectName ? slug(projectName) : null;
  const requestedMinutes = Number(body.expiresMinutes ?? 1440);
  const expiresMinutes = Number.isInteger(requestedMinutes)
    ? Math.max(15, Math.min(requestedMinutes, 10080))
    : 1440;

  const [{ data: existingUser, error: userError }, { data: existingOrganization, error: organizationError }] = await Promise.all([
    db.from("users").select("id").ilike("email", email).maybeSingle(),
    db.from("tokmetric_organizations").select("id").eq("slug", organizationSlug).maybeSingle(),
  ]);
  if (userError || organizationError) throw new InvitationError(503, "DATABASE_ERROR", userError?.message || organizationError?.message || "Lookup failed");
  if (existingUser) throw new InvitationError(409, "EMAIL_ALREADY_REGISTERED", "This email already belongs to a GEM account");
  if (existingOrganization) throw new InvitationError(409, "ORGANIZATION_EXISTS", "This organization already exists");

  await db
    .from("gem_workspace_owner_invitations")
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
    .from("gem_workspace_owner_invitations")
    .insert({
      email,
      first_name: firstName,
      last_name: lastName,
      organization_name: organizationName,
      organization_slug: organizationSlug,
      workspace_name: workspaceName,
      workspace_slug: workspaceSlug,
      project_name: projectName,
      project_slug: projectSlug,
      project_summary: projectSummary,
      token_hash: tokenHash,
      created_by_user_id: user.id,
      expires_at: expiresAt,
      metadata: {
        reason,
        delivery: "administrator_secure_channel",
        tokenStoredInPlaintext: false,
        invitationVersion: "1.0.0",
      },
    })
    .select("id,email,first_name,last_name,organization_name,workspace_name,project_name,expires_at,created_at")
    .single();
  if (error) throw new InvitationError(503, "INVITATION_CREATE_FAILED", error.message);

  await audit(user.id, "workspace_owner_invitation_issued", invitation.id, {
    targetEmail: email,
    organizationName,
    workspaceName,
    projectName,
    expiresAt,
    plaintextTokenStored: false,
    reason,
  });

  return {
    ok: true,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      firstName: invitation.first_name,
      lastName: invitation.last_name,
      organizationName: invitation.organization_name,
      workspaceName: invitation.workspace_name,
      projectName: invitation.project_name,
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
    },
    setupUrl: `${ORIGIN}/workspace-invitation#${token}`,
    safeguards: {
      tokenReturnedOnce: true,
      tokenStoredInPlaintext: false,
      tokenInUrlFragment: true,
      passwordNotGenerated: true,
      createsOnlyClientRole: true,
      expiresMinutes,
    },
  };
}

async function listInvitations() {
  const { data, error } = await db
    .from("gem_workspace_owner_invitations")
    .select("id,email,first_name,last_name,organization_name,workspace_name,project_name,expires_at,used_at,revoked_at,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new InvitationError(503, "DATABASE_ERROR", error.message);
  return {
    ok: true,
    invitations: (data ?? []).map((item) => ({
      id: item.id,
      email: item.email,
      firstName: item.first_name,
      lastName: item.last_name,
      organizationName: item.organization_name,
      workspaceName: item.workspace_name,
      projectName: item.project_name,
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

async function revoke(user: { id: string }, body: Record<string, unknown>) {
  const id = typeof body.id === "string" ? body.id : "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new InvitationError(400, "INVALID_INVITATION_ID", "Invitation identifier is invalid");
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("gem_workspace_owner_invitations")
    .update({ revoked_at: now, metadata: { reason: "administrator_revoked" } })
    .eq("id", id)
    .is("used_at", null)
    .is("revoked_at", null)
    .select("id,email,organization_name")
    .maybeSingle();
  if (error) throw new InvitationError(503, "INVITATION_REVOKE_FAILED", error.message);
  if (!data) throw new InvitationError(409, "INVITATION_NOT_ACTIVE", "Invitation is not active");
  await audit(user.id, "workspace_owner_invitation_revoked", data.id, {
    targetEmail: data.email,
    organizationName: data.organization_name,
  });
  return { ok: true, invitationId: data.id, revokedAt: now };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method === "GET") {
    return json({
      ok: true,
      service: "gem-workspace-owner-invitations",
      version: "1.0.0",
      plaintextTokensStored: false,
      directAnonymousRpcAccess: false,
      createsOnlyClientRole: true,
    });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json() as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    if (action === "status") return json(await publicStatus(body));
    if (action === "accept") return json(await publicAccept(body));

    const user = await requireIssuer(body.token);
    if (action === "issue") return json(await issue(user, body), 201);
    if (action === "list") return json(await listInvitations());
    if (action === "revoke") return json(await revoke(user, body));
    throw new InvitationError(400, "UNKNOWN_ACTION", "Unknown action");
  } catch (error) {
    if (error instanceof InvitationError) {
      return json({ error: error.message, code: error.code }, error.status);
    }
    console.error(error);
    return json({ error: "Workspace owner invitation service failed", code: "INTERNAL_ERROR" }, 500);
  }
});
