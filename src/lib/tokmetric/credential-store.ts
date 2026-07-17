import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const TOKMETRIC_PRODUCTION_WORKSPACE_ID =
  process.env.TOKMETRIC_WORKSPACE_ID?.trim() ||
  "ws_60488340ded94dcfab3b875ef9ae591c";

export const MAX_ACTIVE_CREDENTIALS_PER_WORKSPACE = 5;

export type JsonRecord = Record<string, unknown>;

export type AdminActor = {
  id: string;
  email: string;
  role: string;
};

export type CredentialRecord = {
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

export class CredentialStoreError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CredentialStoreError";
  }
}

export function credentialStore(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new CredentialStoreError(
      503,
      "TOKMETRIC_CREDENTIAL_SERVICE_NOT_CONFIGURED",
      "TokMetric credential service is not configured.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function verifiedSuperAdmin(
  db: SupabaseClient,
  userId: string,
  sessionRole: string,
): Promise<AdminActor> {
  const { data: account, error } = await db
    .from("users")
    .select("id,email,role,status,isActive")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new CredentialStoreError(
      503,
      "ACCOUNT_LOOKUP_FAILED",
      "Administrator account verification failed.",
    );
  }
  if (!account) {
    throw new CredentialStoreError(401, "ACCOUNT_NOT_FOUND", "Account not found.");
  }
  if (!account.isActive || account.status !== "active") {
    throw new CredentialStoreError(
      403,
      "ACCOUNT_DISABLED",
      "Account is not active.",
    );
  }
  if (account.role !== "super_admin" || sessionRole !== "super_admin") {
    throw new CredentialStoreError(
      403,
      "SUPER_ADMIN_REQUIRED",
      "Super administrator access is required.",
    );
  }

  return { id: account.id, email: account.email, role: account.role };
}

export function requiredText(
  value: unknown,
  field: string,
  minLength: number,
  maxLength: number,
) {
  if (typeof value !== "string") {
    throw new CredentialStoreError(
      400,
      "INVALID_REQUEST",
      `${field} is required.`,
    );
  }
  const normalized = value.trim();
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new CredentialStoreError(
      400,
      "INVALID_REQUEST",
      `${field} is invalid.`,
    );
  }
  return normalized;
}

export function credentialView(record: CredentialRecord) {
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

export async function productionWorkspace(db: SupabaseClient) {
  const { data, error } = await db
    .from("tokmetric_workspaces")
    .select(
      "id,name,slug,globalEmergencyLock,publishingDisabled,advertisingDisabled,shopWriteDisabled,connectorDisabled",
    )
    .eq("id", TOKMETRIC_PRODUCTION_WORKSPACE_ID)
    .maybeSingle();

  if (error) {
    throw new CredentialStoreError(
      503,
      "WORKSPACE_LOOKUP_FAILED",
      "TokMetric workspace verification failed.",
    );
  }
  if (!data) {
    throw new CredentialStoreError(
      404,
      "WORKSPACE_NOT_FOUND",
      "TokMetric workspace not found.",
    );
  }
  return data;
}

export async function credentialRegistry(db: SupabaseClient) {
  const { data, error } = await db
    .from("tokmetric_gpt_credentials")
    .select(
      "id,label,status,actor_user_id,workspace_id,created_at,updated_at,expires_at,last_used_at",
    )
    .eq("workspace_id", TOKMETRIC_PRODUCTION_WORKSPACE_ID)
    .order("created_at", { ascending: false });

  if (error) {
    throw new CredentialStoreError(
      503,
      "CREDENTIAL_LIST_FAILED",
      "Credential registry is unavailable.",
    );
  }
  return (data ?? []) as CredentialRecord[];
}

export async function activeCredentialCount(db: SupabaseClient) {
  const { count, error } = await db
    .from("tokmetric_gpt_credentials")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", TOKMETRIC_PRODUCTION_WORKSPACE_ID)
    .eq("status", "active");

  if (error) {
    throw new CredentialStoreError(
      503,
      "CREDENTIAL_CAPACITY_CHECK_FAILED",
      "Credential capacity check failed.",
    );
  }
  return count ?? 0;
}

export async function insertCredential(
  db: SupabaseClient,
  input: {
    id: string;
    tokenHash: string;
    actorId: string;
    label: string;
    createdAt: string;
    expiresAt: string;
  },
) {
  const { data, error } = await db
    .from("tokmetric_gpt_credentials")
    .insert({
      id: input.id,
      token_hash: input.tokenHash,
      actor_user_id: input.actorId,
      workspace_id: TOKMETRIC_PRODUCTION_WORKSPACE_ID,
      label: input.label,
      status: "active",
      created_at: input.createdAt,
      updated_at: input.createdAt,
      expires_at: input.expiresAt,
      last_used_at: null,
    })
    .select(
      "id,label,status,actor_user_id,workspace_id,created_at,updated_at,expires_at,last_used_at",
    )
    .single();

  if (error || !data) {
    throw new CredentialStoreError(
      503,
      "CREDENTIAL_ISSUE_FAILED",
      "Credential issuance failed.",
    );
  }
  return data as CredentialRecord;
}

export async function credentialById(db: SupabaseClient, credentialId: string) {
  const { data, error } = await db
    .from("tokmetric_gpt_credentials")
    .select(
      "id,label,status,actor_user_id,workspace_id,created_at,updated_at,expires_at,last_used_at",
    )
    .eq("id", credentialId)
    .eq("workspace_id", TOKMETRIC_PRODUCTION_WORKSPACE_ID)
    .maybeSingle();

  if (error) {
    throw new CredentialStoreError(
      503,
      "CREDENTIAL_LOOKUP_FAILED",
      "Credential lookup failed.",
    );
  }
  return (data as CredentialRecord | null) ?? null;
}

export async function revokeStoredCredential(
  db: SupabaseClient,
  credentialId: string,
) {
  const { data, error } = await db
    .from("tokmetric_gpt_credentials")
    .update({ status: "revoked", updated_at: new Date().toISOString() })
    .eq("id", credentialId)
    .eq("workspace_id", TOKMETRIC_PRODUCTION_WORKSPACE_ID)
    .select(
      "id,label,status,actor_user_id,workspace_id,created_at,updated_at,expires_at,last_used_at",
    )
    .single();

  if (error || !data) {
    throw new CredentialStoreError(
      503,
      "CREDENTIAL_REVOKE_FAILED",
      "Credential revocation failed.",
    );
  }
  return data as CredentialRecord;
}

export async function recordCredentialAudit(
  db: SupabaseClient,
  actor: AdminActor,
  action: string,
  resourceId: string,
  metadata: JsonRecord,
) {
  const now = new Date().toISOString();
  const [adminAudit, tokmetricAudit] = await Promise.all([
    db.from("audit_logs").insert({
      id: randomUUID(),
      userId: actor.id,
      action: "admin_action",
      resource: "tokmetric_gpt_credential",
      resourceId,
      metadata,
      createdAt: now,
    }),
    db.from("tokmetric_audit_events").insert({
      id: `audit_${randomUUID().replaceAll("-", "")}`,
      workspaceId: TOKMETRIC_PRODUCTION_WORKSPACE_ID,
      actorId: actor.id,
      action,
      entityType: "gpt_credential",
      entityId: resourceId,
      correlationId: randomUUID(),
      outcome: "success",
      sourceChannel: "command_center",
      safeMetadata: metadata,
      createdAt: now,
    }),
  ]);

  if (adminAudit.error) {
    console.error("[tokmetric credential] administrator audit failed", {
      code: adminAudit.error.code,
    });
  }
  if (tokmetricAudit.error) {
    console.error("[tokmetric credential] TokMetric audit failed", {
      code: tokmetricAudit.error.code,
    });
  }
}
