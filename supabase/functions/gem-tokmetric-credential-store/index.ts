import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WORKSPACE_ID = "ws_60488340ded94dcfab3b875ef9ae591c";
const MAX_ACTIVE_CREDENTIALS = 5;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase runtime configuration");
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://www.gemcybersecurityassist.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class GatewayError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

type Actor = {
  id: string;
  email: string;
  role: string;
  status: string;
  isActive: boolean;
};

type CredentialRecord = {
  id: string;
  label: string;
  status: string;
  actor_user_id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  last_used_at: string | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
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

async function requireSuperAdmin(token: unknown): Promise<Actor> {
  if (typeof token !== "string") {
    throw new GatewayError(401, "UNAUTHORIZED", "Authentication required.");
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new GatewayError(401, "INVALID_SESSION", "Invalid session token.");
  }

  const unsigned = `${parts[0]}.${parts[1]}`;
  const valid = await crypto.subtle.verify(
    "HMAC",
    await signingKey(),
    decodeB64url(parts[2]),
    encoder.encode(unsigned),
  );
  if (!valid) {
    throw new GatewayError(401, "INVALID_SESSION", "Invalid session token.");
  }

  const payload = JSON.parse(
    decoder.decode(decodeB64url(parts[1])),
  ) as Record<string, unknown>;
  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const expiry = typeof payload.exp === "number" ? payload.exp : 0;
  if (!userId || expiry <= Math.floor(Date.now() / 1000)) {
    throw new GatewayError(401, "SESSION_EXPIRED", "Session expired.");
  }
  if (
    payload.iss !== "gem-auth-gateway" ||
    payload.aud !== "gem-enterprise"
  ) {
    throw new GatewayError(401, "INVALID_SESSION", "Invalid session issuer.");
  }

  const { data: user, error } = await db
    .from("users")
    .select("id,email,role,status,isActive")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    throw new GatewayError(503, "DATABASE_ERROR", "Account lookup failed.");
  }
  if (!user) {
    throw new GatewayError(401, "ACCOUNT_NOT_FOUND", "Account not found.");
  }
  if (!user.isActive || user.status !== "active") {
    throw new GatewayError(403, "ACCOUNT_DISABLED", "Account is not active.");
  }
  if (user.role !== "super_admin") {
    throw new GatewayError(
      403,
      "SUPER_ADMIN_REQUIRED",
      "Super administrator access is required.",
    );
  }
  return user as Actor;
}

function requiredText(
  value: unknown,
  field: string,
  minLength: number,
  maxLength: number,
) {
  if (typeof value !== "string") {
    throw new GatewayError(400, "INVALID_REQUEST", `${field} is required.`);
  }
  const normalized = value.trim();
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new GatewayError(400, "INVALID_REQUEST", `${field} is invalid.`);
  }
  return normalized;
}

function requiredDigest(value: unknown) {
  const digest = requiredText(value, "tokenHash", 64, 64).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(digest)) {
    throw new GatewayError(
      400,
      "INVALID_DIGEST",
      "Credential digest is invalid.",
    );
  }
  return digest;
}

function credentialView(record: CredentialRecord) {
  return {
    id: record.id,
    label: record.label,
    status: record.status,
    actorUserId: record.actor_user_id,
    workspaceId: record.workspace_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    expiresAt: record.expires_at,
    lastUsedAt: record.last_used_at,
  };
}

async function requireWorkspace() {
  const { data, error } = await db
    .from("tokmetric_workspaces")
    .select(
      "id,name,slug,globalEmergencyLock,publishingDisabled,advertisingDisabled,shopWriteDisabled,connectorDisabled",
    )
    .eq("id", WORKSPACE_ID)
    .maybeSingle();
  if (error) {
    throw new GatewayError(503, "DATABASE_ERROR", "Workspace lookup failed.");
  }
  if (!data) {
    throw new GatewayError(404, "WORKSPACE_NOT_FOUND", "Workspace not found.");
  }
  return data;
}

async function recordAudit(
  actor: Actor,
  action: string,
  resourceId: string,
  metadata: Record<string, unknown>,
) {
  const now = new Date().toISOString();
  const results = await Promise.allSettled([
    db.from("audit_logs").insert({
      id: crypto.randomUUID(),
      userId: actor.id,
      action: "admin_action",
      resource: "tokmetric_gpt_credential",
      resourceId,
      metadata,
      createdAt: now,
    }),
    db.from("tokmetric_audit_events").insert({
      id: `audit_${crypto.randomUUID().replaceAll("-", "")}`,
      workspaceId: WORKSPACE_ID,
      actorId: actor.id,
      action,
      entityType: "gpt_credential",
      entityId: resourceId,
      correlationId: crypto.randomUUID(),
      outcome: "success",
      sourceChannel: "command_center",
      safeMetadata: metadata,
      createdAt: now,
    }),
  ]);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("tokmetric_credential_audit_failed");
    }
  }
}

async function listCredentials(actor: Actor) {
  const workspace = await requireWorkspace();
  const { data, error } = await db
    .from("tokmetric_gpt_credentials")
    .select(
      "id,label,status,actor_user_id,workspace_id,created_at,updated_at,expires_at,last_used_at",
    )
    .eq("workspace_id", WORKSPACE_ID)
    .order("created_at", { ascending: false });
  if (error) {
    throw new GatewayError(503, "DATABASE_ERROR", "Credential list failed.");
  }
  return {
    ok: true,
    viewer: { id: actor.id, role: actor.role },
    workspace,
    credentials: ((data ?? []) as CredentialRecord[]).map(credentialView),
  };
}

async function issueDigest(
  actor: Actor,
  body: Record<string, unknown>,
) {
  const tokenHash = requiredDigest(body.tokenHash);
  const label = requiredText(body.label, "label", 3, 120);
  const reason = requiredText(body.reason, "reason", 10, 500);
  const confirmation = requiredText(
    body.confirmWorkspaceId,
    "confirmWorkspaceId",
    3,
    200,
  );
  const expiresInDays =
    typeof body.expiresInDays === "number" ? body.expiresInDays : 90;

  if (confirmation !== WORKSPACE_ID) {
    throw new GatewayError(
      400,
      "WORKSPACE_CONFIRMATION_MISMATCH",
      "Workspace confirmation does not match.",
    );
  }
  if (
    !Number.isInteger(expiresInDays) ||
    expiresInDays < 1 ||
    expiresInDays > 365
  ) {
    throw new GatewayError(
      400,
      "INVALID_EXPIRY",
      "Credential expiry must be between 1 and 365 days.",
    );
  }

  const workspace = await requireWorkspace();
  const { count, error: countError } = await db
    .from("tokmetric_gpt_credentials")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", WORKSPACE_ID)
    .eq("status", "active");
  if (countError) {
    throw new GatewayError(503, "DATABASE_ERROR", "Capacity check failed.");
  }
  if ((count ?? 0) >= MAX_ACTIVE_CREDENTIALS) {
    throw new GatewayError(
      409,
      "ACTIVE_CREDENTIAL_LIMIT_REACHED",
      "Revoke an unused credential before issuing another.",
    );
  }

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + expiresInDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  const credentialId = `gptcred_${crypto.randomUUID().replaceAll("-", "")}`;
  const { data, error } = await db
    .from("tokmetric_gpt_credentials")
    .insert({
      id: credentialId,
      token_hash: tokenHash,
      actor_user_id: actor.id,
      workspace_id: WORKSPACE_ID,
      label,
      status: "active",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      expires_at: expiresAt,
      last_used_at: null,
    })
    .select(
      "id,label,status,actor_user_id,workspace_id,created_at,updated_at,expires_at,last_used_at",
    )
    .single();
  if (error || !data) {
    throw new GatewayError(503, "CREDENTIAL_ISSUE_FAILED", "Issuance failed.");
  }

  await recordAudit(actor, "tokmetric.gpt_credential.issued", credentialId, {
    label,
    reason,
    expiresAt,
    workspaceName: workspace.name,
    readableValueReceived: false,
    digestOnly: true,
  });
  return { ok: true, credential: credentialView(data as CredentialRecord) };
}

async function revokeCredential(
  actor: Actor,
  body: Record<string, unknown>,
) {
  const credentialId = requiredText(
    body.credentialId,
    "credentialId",
    3,
    200,
  );
  const confirmLabel = requiredText(body.confirmLabel, "confirmLabel", 3, 120);
  const reason = requiredText(body.reason, "reason", 10, 500);
  await requireWorkspace();

  const { data: existing, error: lookupError } = await db
    .from("tokmetric_gpt_credentials")
    .select(
      "id,label,status,actor_user_id,workspace_id,created_at,updated_at,expires_at,last_used_at",
    )
    .eq("id", credentialId)
    .eq("workspace_id", WORKSPACE_ID)
    .maybeSingle();
  if (lookupError) {
    throw new GatewayError(503, "DATABASE_ERROR", "Credential lookup failed.");
  }
  if (!existing) {
    throw new GatewayError(404, "CREDENTIAL_NOT_FOUND", "Credential not found.");
  }
  if (existing.label !== confirmLabel) {
    throw new GatewayError(
      400,
      "CREDENTIAL_CONFIRMATION_MISMATCH",
      "Credential label confirmation does not match.",
    );
  }
  if (existing.status === "revoked") {
    throw new GatewayError(
      409,
      "CREDENTIAL_ALREADY_REVOKED",
      "Credential is already revoked.",
    );
  }

  const { data, error } = await db
    .from("tokmetric_gpt_credentials")
    .update({ status: "revoked", updated_at: new Date().toISOString() })
    .eq("id", credentialId)
    .select(
      "id,label,status,actor_user_id,workspace_id,created_at,updated_at,expires_at,last_used_at",
    )
    .single();
  if (error || !data) {
    throw new GatewayError(503, "CREDENTIAL_REVOKE_FAILED", "Revocation failed.");
  }

  await recordAudit(actor, "tokmetric.gpt_credential.revoked", credentialId, {
    label: existing.label,
    reason,
  });
  return { ok: true, credential: credentialView(data as CredentialRecord) };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const actor = await requireSuperAdmin(body.token);
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "list") return json(await listCredentials(actor));
    if (action === "issue_hash") return json(await issueDigest(actor, body), 201);
    if (action === "revoke") return json(await revokeCredential(actor, body));
    throw new GatewayError(400, "UNKNOWN_ACTION", "Unknown action.");
  } catch (error) {
    if (error instanceof GatewayError) {
      return json({ error: error.message, code: error.code }, error.status);
    }
    console.error(
      "tokmetric_credential_store_internal_error",
      error instanceof Error ? error.name : "unknown",
    );
    return json(
      { error: "Credential storage is unavailable.", code: "INTERNAL_ERROR" },
      500,
    );
  }
});
