import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  correlationId,
  emitTokMetricAudit,
  enforceEmergencyLocks,
  parseJson,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";
import {
  getSocialOAuthProviderConfig,
  validateSocialOAuthProviderConfig,
} from "@/lib/social-media/oauth/config";
import { refreshSocialAccessToken } from "@/lib/social-media/oauth/client";
import { evaluateSocialCredentialLifecycle } from "@/lib/social-media/oauth/lifecycle";
import {
  loadSocialConnectorCredential,
  recordSocialConnectorLifecycle,
} from "@/lib/social-media/oauth/lifecycle-store";

const healthSchema = z.object({
  workspaceId: z.string().trim().min(1),
  connectorId: z.string().trim().min(1),
});

function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    throw new TokMetricError(
      403,
      "CROSS_ORIGIN_REQUEST_BLOCKED",
      "Connector credential checks require a same-origin request.",
    );
  }
}

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  let workspaceId: string | undefined;
  let connectorId: string | undefined;
  let provider: string | undefined;
  let actorId: string | undefined;
  let refreshAttempted = false;

  try {
    requireSameOrigin(request);
    const session = await requireTokMetricSession(request);
    actorId = session.userId;
    const parsed = await parseJson(request, healthSchema);
    workspaceId = parsed.workspaceId!;
    connectorId = parsed.connectorId!;
    const membership = await requireWorkspaceAccess(workspaceId, session);
    requirePermission(membership, "manage", "connectors");
    await enforceEmergencyLocks(workspaceId, "connector");

    const stored = await loadSocialConnectorCredential({ workspaceId, connectorId });
    provider = stored.connector.provider;
    const { config, missing, ok } = validateSocialOAuthProviderConfig(stored.connector.provider);
    if (!ok) {
      throw new TokMetricError(
        503,
        "SOCIAL_OAUTH_CONFIGURATION_CHANGED",
        `${getSocialOAuthProviderConfig(stored.connector.provider).displayName} configuration is incomplete: ${missing.join(", ")}`,
      );
    }

    let credential = stored.credential;
    let lifecycle = evaluateSocialCredentialLifecycle(config, credential);
    let refreshSucceeded = false;

    if (lifecycle.shouldRefresh) {
      refreshAttempted = true;
      try {
        const refreshed = await refreshSocialAccessToken({ config, credential });
        credential = refreshed.credential;
        lifecycle = evaluateSocialCredentialLifecycle(config, credential);
        refreshSucceeded = true;
      } catch (error) {
        const reauthorization = {
          ...lifecycle,
          lifecycle: "REAUTHORIZATION_REQUIRED" as const,
          connectorState: "REAUTHORIZATION_REQUIRED" as const,
          shouldRefresh: false,
        };
        await recordSocialConnectorLifecycle({
          workspaceId,
          connectorId,
          lifecycle: reauthorization,
          refreshAttempted: true,
          refreshSucceeded: false,
        });
        throw error;
      }
    }

    const connector = await recordSocialConnectorLifecycle({
      workspaceId,
      connectorId,
      lifecycle,
      credential: refreshSucceeded ? credential : undefined,
      refreshAttempted,
      refreshSucceeded,
    });

    await emitTokMetricAudit({
      workspaceId,
      actorId,
      action: "social.connector.credential_health_checked",
      entityType: "connector",
      entityId: connectorId,
      correlationId: cid,
      outcome: "success",
      sourceChannel: "website",
      metadata: {
        provider,
        lifecycle: lifecycle.lifecycle,
        tokenRefreshAttempted: refreshAttempted,
        tokenRefreshSucceeded: refreshSucceeded,
        providerAccountProbePerformed: false,
        externalPublishingEnabled: false,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        connector,
        credentialHealth: lifecycle,
        tokenRefreshAttempted: refreshAttempted,
        tokenRefreshSucceeded: refreshSucceeded,
        providerAccountProbePerformed: false,
        externalPublishingActionTaken: false,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (workspaceId) {
      await emitTokMetricAudit({
        workspaceId,
        actorId,
        action: "social.connector.credential_health_failed",
        entityType: "connector",
        entityId: connectorId,
        correlationId: cid,
        outcome: "failure",
        sourceChannel: "website",
        metadata: {
          provider,
          tokenRefreshAttempted: refreshAttempted,
          externalPublishingEnabled: false,
        },
      }).catch(() => undefined);
    }
    return tokMetricErrorResponse(error, cid);
  }
}
