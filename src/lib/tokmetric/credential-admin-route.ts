import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getGatewaySessionToken,
  getSession,
  type SessionPayload,
} from "@/lib/auth";
import { verifyGatewaySession } from "@/lib/supabase-gateway";
import {
  activeCredentialCount,
  credentialById,
  credentialRegistry,
  credentialStore,
  credentialView,
  CredentialStoreError,
  insertCredential,
  MAX_ACTIVE_CREDENTIALS_PER_WORKSPACE,
  productionWorkspace,
  recordCredentialAudit,
  requiredText,
  revokeStoredCredential,
  TOKMETRIC_PRODUCTION_WORKSPACE_ID,
  verifiedSuperAdmin,
  type JsonRecord,
} from "@/lib/tokmetric/credential-store";

export { TOKMETRIC_PRODUCTION_WORKSPACE_ID };

export type TokMetricCredentialAdminAction = "list" | "issue" | "revoke";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

async function resolvedSession(): Promise<SessionPayload | null> {
  const gatewayToken = await getGatewaySessionToken();
  if (gatewayToken) {
    try {
      return await verifyGatewaySession(gatewayToken);
    } catch {
      return null;
    }
  }
  return getSession();
}

async function requireSession() {
  const session = await resolvedSession();
  if (!session) {
    throw new CredentialStoreError(
      401,
      "GEM_SESSION_REQUIRED",
      "Authentication required.",
    );
  }
  return session;
}

function generateOneTimeValue() {
  return `tokmetric_gpt_${randomBytes(48).toString("base64url")}`;
}

function digestOneTimeValue(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function listCredentials() {
  const db = credentialStore();
  const session = await requireSession();
  const actor = await verifiedSuperAdmin(db, session.userId, session.role);
  const [workspace, credentials] = await Promise.all([
    productionWorkspace(db),
    credentialRegistry(db),
  ]);

  return {
    ok: true,
    viewer: { id: actor.id, role: actor.role },
    workspace,
    credentials: credentials.map(credentialView),
  };
}

async function issueCredential(payload: JsonRecord) {
  const db = credentialStore();
  const session = await requireSession();
  const actor = await verifiedSuperAdmin(db, session.userId, session.role);
  const confirmWorkspaceId = requiredText(
    payload.confirmWorkspaceId,
    "confirmWorkspaceId",
    3,
    200,
  );
  const label = requiredText(payload.label, "label", 3, 120);
  const reason = requiredText(payload.reason, "reason", 10, 500);
  const expiresInDays =
    typeof payload.expiresInDays === "number" ? payload.expiresInDays : 90;

  if (confirmWorkspaceId !== TOKMETRIC_PRODUCTION_WORKSPACE_ID) {
    throw new CredentialStoreError(
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
    throw new CredentialStoreError(
      400,
      "INVALID_EXPIRY",
      "Credential expiry must be between 1 and 365 days.",
    );
  }

  const [workspace, activeCount] = await Promise.all([
    productionWorkspace(db),
    activeCredentialCount(db),
  ]);
  if (activeCount >= MAX_ACTIVE_CREDENTIALS_PER_WORKSPACE) {
    throw new CredentialStoreError(
      409,
      "ACTIVE_CREDENTIAL_LIMIT_REACHED",
      "Revoke an unused TokMetric GPT credential before issuing another.",
    );
  }

  const oneTimeValue = generateOneTimeValue();
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + expiresInDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  const credentialId = `gptcred_${randomUUID().replaceAll("-", "")}`;
  const stored = await insertCredential(db, {
    id: credentialId,
    tokenHash: digestOneTimeValue(oneTimeValue),
    actorId: actor.id,
    label,
    createdAt: now.toISOString(),
    expiresAt,
  });

  await recordCredentialAudit(
    db,
    actor,
    "tokmetric.gpt_credential.issued",
    credentialId,
    {
      label,
      reason,
      expiresAt,
      workspaceName: workspace.name,
      plaintextStored: false,
      oneTimeDisplay: true,
    },
  );

  return {
    ok: true,
    credential: credentialView(stored),
    bearer: oneTimeValue,
    oneTimeDisplay: true,
    warning:
      "Copy this bearer now. GEM stores only its SHA-256 hash and cannot display it again.",
  };
}

async function revokeCredential(payload: JsonRecord) {
  const db = credentialStore();
  const session = await requireSession();
  const actor = await verifiedSuperAdmin(db, session.userId, session.role);
  const credentialId = requiredText(
    payload.credentialId,
    "credentialId",
    3,
    200,
  );
  const confirmLabel = requiredText(
    payload.confirmLabel,
    "confirmLabel",
    3,
    120,
  );
  const reason = requiredText(payload.reason, "reason", 10, 500);

  await productionWorkspace(db);
  const existing = await credentialById(db, credentialId);
  if (!existing) {
    throw new CredentialStoreError(
      404,
      "CREDENTIAL_NOT_FOUND",
      "Credential not found.",
    );
  }
  if (existing.label !== confirmLabel) {
    throw new CredentialStoreError(
      400,
      "CREDENTIAL_CONFIRMATION_MISMATCH",
      "Credential label confirmation does not match.",
    );
  }
  if (existing.status === "revoked") {
    throw new CredentialStoreError(
      409,
      "CREDENTIAL_ALREADY_REVOKED",
      "Credential is already revoked.",
    );
  }

  const revoked = await revokeStoredCredential(db, credentialId);
  await recordCredentialAudit(
    db,
    actor,
    "tokmetric.gpt_credential.revoked",
    credentialId,
    { label: existing.label, reason },
  );

  return { ok: true, credential: credentialView(revoked) };
}

export async function invokeTokMetricCredentialAdmin(
  action: TokMetricCredentialAdminAction,
  payload: JsonRecord = {},
  successStatus = 200,
) {
  try {
    const result =
      action === "list"
        ? await listCredentials()
        : action === "issue"
          ? await issueCredential(payload)
          : await revokeCredential(payload);
    return json(result, successStatus);
  } catch (error) {
    if (error instanceof CredentialStoreError) {
      return json({ error: error.message, code: error.code }, error.status);
    }

    console.error("[tokmetric credential admin] internal error", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return json(
      {
        error: "TokMetric credential service is unavailable.",
        code: "TOKMETRIC_CREDENTIAL_SERVICE_UNAVAILABLE",
      },
      503,
    );
  }
}
