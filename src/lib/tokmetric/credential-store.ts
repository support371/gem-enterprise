import { randomUUID } from "node:crypto";

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

export type CredentialStore = {
  restUrl: string;
  authorization: string;
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

function query(parameters: Record<string, string>) {
  return new URLSearchParams(parameters).toString();
}

function storeHeaders(
  store: CredentialStore,
  extra: Record<string, string> = {},
) {
  return {
    Authorization: `Bearer ${store.authorization}`,
    apikey: store.authorization,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...extra,
  };
}

async function storeRequest<T>(
  store: CredentialStore,
  path: string,
  operation: string,
  init: RequestInit = {},
): Promise<{ data: T; response: Response }> {
  const response = await fetch(`${store.restUrl}/${path}`, {
    ...init,
    headers: storeHeaders(
      store,
      Object.fromEntries(new Headers(init.headers).entries()),
    ),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("[tokmetric credential store] request failed", {
      operation,
      status: response.status,
    });
    throw new CredentialStoreError(
      503,
      `${operation.toUpperCase()}_FAILED`,
      "TokMetric credential storage is unavailable.",
    );
  }

  const text = await response.text();
  return {
    data: (text ? JSON.parse(text) : null) as T,
    response,
  };
}

export function credentialStore(): CredentialStore {
  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new CredentialStoreError(
      503,
      "TOKMETRIC_CREDENTIAL_SERVICE_NOT_CONFIGURED",
      "TokMetric credential service is not configured.",
    );
  }

  return {
    restUrl: `${supabaseUrl}/rest/v1`,
    authorization: serviceRoleKey,
  };
}

export async function verifiedSuperAdmin(
  store: CredentialStore,
  userId: string,
  sessionRole: string,
): Promise<AdminActor> {
  const path = `users?${query({
    select: "id,email,role,status,isActive",
    id: `eq.${userId}`,
    limit: "1",
  })}`;
  const { data } = await storeRequest<Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    isActive: boolean;
  }>>(store, path, "account_lookup");
  const account = data[0];

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

export async function productionWorkspace(store: CredentialStore) {
  const path = `tokmetric_workspaces?${query({
    select:
      "id,name,slug,globalEmergencyLock,publishingDisabled,advertisingDisabled,shopWriteDisabled,connectorDisabled",
    id: `eq.${TOKMETRIC_PRODUCTION_WORKSPACE_ID}`,
    limit: "1",
  })}`;
  const { data } = await storeRequest<Array<{
    id: string;
    name: string;
    slug: string;
    globalEmergencyLock: boolean;
    publishingDisabled: boolean;
    advertisingDisabled: boolean;
    shopWriteDisabled: boolean;
    connectorDisabled: boolean;
  }>>(store, path, "workspace_lookup");
  const workspace = data[0];

  if (!workspace) {
    throw new CredentialStoreError(
      404,
      "WORKSPACE_NOT_FOUND",
      "TokMetric workspace not found.",
    );
  }
  return workspace;
}

const CREDENTIAL_COLUMNS =
  "id,label,status,actor_user_id,workspace_id,created_at,updated_at,expires_at,last_used_at";

export async function credentialRegistry(store: CredentialStore) {
  const path = `tokmetric_gpt_credentials?${query({
    select: CREDENTIAL_COLUMNS,
    workspace_id: `eq.${TOKMETRIC_PRODUCTION_WORKSPACE_ID}`,
    order: "created_at.desc",
  })}`;
  const { data } = await storeRequest<CredentialRecord[]>(
    store,
    path,
    "credential_list",
  );
  return data;
}

export async function activeCredentialCount(store: CredentialStore) {
  const path = `tokmetric_gpt_credentials?${query({
    select: "id",
    workspace_id: `eq.${TOKMETRIC_PRODUCTION_WORKSPACE_ID}`,
    status: "eq.active",
  })}`;
  const { response } = await storeRequest<Array<{ id: string }>>(
    store,
    path,
    "credential_capacity_check",
    {
      headers: {
        Prefer: "count=exact",
        Range: "0-0",
        "Range-Unit": "items",
      },
    },
  );
  const contentRange = response.headers.get("content-range") || "*/0";
  const total = Number(contentRange.split("/").pop() || 0);
  return Number.isFinite(total) ? total : 0;
}

export async function insertCredential(
  store: CredentialStore,
  input: {
    id: string;
    tokenHash: string;
    actorId: string;
    label: string;
    createdAt: string;
    expiresAt: string;
  },
) {
  const path = `tokmetric_gpt_credentials?${query({
    select: CREDENTIAL_COLUMNS,
  })}`;
  const { data } = await storeRequest<CredentialRecord[]>(
    store,
    path,
    "credential_issue",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
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
      }),
    },
  );
  const record = data[0];
  if (!record) {
    throw new CredentialStoreError(
      503,
      "CREDENTIAL_ISSUE_FAILED",
      "Credential issuance failed.",
    );
  }
  return record;
}

export async function credentialById(
  store: CredentialStore,
  credentialId: string,
) {
  const path = `tokmetric_gpt_credentials?${query({
    select: CREDENTIAL_COLUMNS,
    id: `eq.${credentialId}`,
    workspace_id: `eq.${TOKMETRIC_PRODUCTION_WORKSPACE_ID}`,
    limit: "1",
  })}`;
  const { data } = await storeRequest<CredentialRecord[]>(
    store,
    path,
    "credential_lookup",
  );
  return data[0] ?? null;
}

export async function revokeStoredCredential(
  store: CredentialStore,
  credentialId: string,
) {
  const path = `tokmetric_gpt_credentials?${query({
    select: CREDENTIAL_COLUMNS,
    id: `eq.${credentialId}`,
    workspace_id: `eq.${TOKMETRIC_PRODUCTION_WORKSPACE_ID}`,
  })}`;
  const { data } = await storeRequest<CredentialRecord[]>(
    store,
    path,
    "credential_revoke",
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "revoked",
        updated_at: new Date().toISOString(),
      }),
    },
  );
  const record = data[0];
  if (!record) {
    throw new CredentialStoreError(
      503,
      "CREDENTIAL_REVOKE_FAILED",
      "Credential revocation failed.",
    );
  }
  return record;
}

async function appendAudit(
  store: CredentialStore,
  table: string,
  body: JsonRecord,
  operation: string,
) {
  await storeRequest<null>(store, table, operation, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
}

export async function recordCredentialAudit(
  store: CredentialStore,
  actor: AdminActor,
  action: string,
  resourceId: string,
  metadata: JsonRecord,
) {
  const now = new Date().toISOString();
  const results = await Promise.allSettled([
    appendAudit(
      store,
      "audit_logs",
      {
        id: randomUUID(),
        userId: actor.id,
        action: "admin_action",
        resource: "tokmetric_gpt_credential",
        resourceId,
        metadata,
        createdAt: now,
      },
      "admin_audit",
    ),
    appendAudit(
      store,
      "tokmetric_audit_events",
      {
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
      },
      "tokmetric_audit",
    ),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[tokmetric credential] audit write failed", {
        name:
          result.reason instanceof Error ? result.reason.name : "unknown",
      });
    }
  }
}
