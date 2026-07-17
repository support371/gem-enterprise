import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getGatewaySessionToken } from "@/lib/auth";
import {
  GatewayRequestError,
  tokMetricCredentialStoreGateway,
} from "@/lib/supabase-gateway";

export const TOKMETRIC_PRODUCTION_WORKSPACE_ID =
  "ws_60488340ded94dcfab3b875ef9ae591c";

export type TokMetricCredentialAdminAction = "list" | "issue" | "revoke";
type JsonRecord = Record<string, unknown>;

type CredentialMetadata = {
  id: string;
  label: string;
  status: string;
  actorUserId: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
};

type CredentialListResult = {
  ok: true;
  viewer: { id: string; role: string };
  workspace: {
    id: string;
    name: string;
    publishingDisabled: boolean;
    advertisingDisabled: boolean;
    shopWriteDisabled: boolean;
  };
  credentials: CredentialMetadata[];
};

type CredentialMutationResult = {
  ok: true;
  credential: CredentialMetadata;
};

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

async function requireGatewayToken() {
  const token = await getGatewaySessionToken();
  if (!token) {
    throw new GatewayRequestError(
      401,
      "GEM_SESSION_REQUIRED",
      "Authentication required.",
    );
  }
  return token;
}

function generateOneTimeValue() {
  return `tokmetric_gpt_${randomBytes(48).toString("base64url")}`;
}

function digestOneTimeValue(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function listCredentials() {
  const token = await requireGatewayToken();
  return tokMetricCredentialStoreGateway<CredentialListResult>(
    "list",
    token,
  );
}

async function issueCredential(payload: JsonRecord) {
  const token = await requireGatewayToken();
  const oneTimeValue = generateOneTimeValue();
  const result = await tokMetricCredentialStoreGateway<CredentialMutationResult>(
    "issue_hash",
    token,
    {
      tokenHash: digestOneTimeValue(oneTimeValue),
      label: payload.label,
      reason: payload.reason,
      expiresInDays: payload.expiresInDays,
      confirmWorkspaceId: payload.confirmWorkspaceId,
    },
  );

  return {
    ...result,
    bearer: oneTimeValue,
    oneTimeDisplay: true,
    warning:
      "Copy this bearer now. GEM stores only its SHA-256 hash and cannot display it again.",
  };
}

async function revokeCredential(payload: JsonRecord) {
  const token = await requireGatewayToken();
  return tokMetricCredentialStoreGateway<CredentialMutationResult>(
    "revoke",
    token,
    {
      credentialId: payload.credentialId,
      confirmLabel: payload.confirmLabel,
      reason: payload.reason,
    },
  );
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
    if (error instanceof GatewayRequestError) {
      return json(
        { error: error.message, code: error.code },
        error.statusCode,
      );
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
