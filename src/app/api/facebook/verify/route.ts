import { NextRequest, NextResponse } from "next/server";
import { listSocialConnectors } from "@/lib/social-media/oauth/store";
import {
  correlationId,
  requireTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim();
    const pageId = request.nextUrl.searchParams.get("pageId")?.trim();
    if (!workspaceId) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "workspaceId is required.");
    }
    await requireWorkspaceAccess(workspaceId, session);
    const connectors = (await listSocialConnectors(workspaceId)).filter(
      (connector) => connector.provider === "META",
    );
    const connector = pageId
      ? connectors.find(
          (item) =>
            item.externalAccountId === pageId ||
            item.safeMetadata.facebookPageId === pageId,
        )
      : connectors[0];
    if (!connector) {
      return NextResponse.json(
        {
          ok: true,
          correlationId: cid,
          status: "NOT_CONNECTED",
          connectorStatus: "MISSING",
          externalPublishingEnabled: false,
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        status: connector.state,
        connector: {
          id: connector.id,
          displayName: connector.displayName,
          externalAccountId: connector.externalAccountId,
          grantedScopes: connector.grantedScopes,
          accountType: connector.safeMetadata.accountType || null,
          lastHealthAt: connector.lastHealthAt,
        },
        verification: {
          credentialState: connector.state,
          accountDiscovered: Boolean(connector.externalAccountId),
          scopesPresent: connector.grantedScopes.length > 0,
          readyForGovernedQueue: connector.state === "CONNECTED",
          livePublishingEnabled: false,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}

/**
 * Credential tests and refreshes are performed only by the shared lifecycle
 * endpoint so tokens never enter URLs or the legacy CBC decryption path.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "USE_SHARED_CONNECTOR_HEALTH_ENDPOINT",
        message:
          "Use /api/social-media/connectors/health with workspaceId and connectorId.",
      },
      canonicalEndpoint: "/api/social-media/connectors/health",
      externalActionTaken: false,
    },
    {
      status: 409,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
