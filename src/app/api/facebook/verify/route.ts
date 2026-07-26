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
    const connectorId = request.nextUrl.searchParams.get("connectorId")?.trim();
    const pageId = request.nextUrl.searchParams.get("pageId")?.trim();
    if (!workspaceId) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "workspaceId is required.");
    }
    await requireWorkspaceAccess(workspaceId, session);
    const connectors = (await listSocialConnectors(workspaceId)).filter(
      (connector) => connector.provider === "META" && !connector.disabledAt,
    );
    if (connectors.length === 0) {
      return NextResponse.json(
        {
          ok: true,
          correlationId: cid,
          status: "NOT_CONNECTED",
          connectorStatus: "MISSING",
          destinations: [],
          externalPublishingEnabled: false,
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    if (!connectorId && !pageId) {
      return NextResponse.json(
        {
          ok: false,
          correlationId: cid,
          error: {
            code: "EXPLICIT_META_DESTINATION_REQUIRED",
            message:
              "Select an explicit Facebook Page or Instagram professional account before verification.",
          },
          destinations: connectors.map((connector) => ({
            id: connector.id,
            displayName: connector.displayName,
            externalAccountId: connector.externalAccountId,
            accountType: connector.safeMetadata.accountType || null,
            state: connector.state,
          })),
          externalPublishingEnabled: false,
        },
        {
          status: 409,
          headers: { "Cache-Control": "no-store, max-age=0" },
        },
      );
    }

    const connector = connectors.find(
      (item) =>
        (connectorId && item.id === connectorId) ||
        (pageId &&
          (item.externalAccountId === pageId ||
            item.safeMetadata.facebookPageId === pageId)),
    );
    if (!connector) {
      throw new TokMetricError(
        404,
        "META_DESTINATION_NOT_FOUND",
        "The selected Meta destination was not found in this workspace.",
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
    const response = tokMetricErrorResponse(error, cid);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
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
