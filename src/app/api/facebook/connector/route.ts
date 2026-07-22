import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  correlationId,
  enforceEmergencyLocks,
  parseJson,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";
import { listSocialConnectors } from "@/lib/social-media/oauth/connectors";

const authorizeSchema = z.object({
  workspaceId: z.string().trim().min(1),
});

function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    throw new TokMetricError(
      403,
      "CROSS_ORIGIN_REQUEST_BLOCKED",
      "Facebook connector changes require a same-origin request.",
    );
  }
}

/**
 * Compatibility bridge for the Facebook Operations UI.
 *
 * Meta authorization and credentials are canonical only in the shared social
 * connector lifecycle. This route must never create a second OAuth state,
 * connector, or token store.
 */
export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim();
    if (!workspaceId) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "workspaceId is required.");
    }
    await requireWorkspaceAccess(workspaceId, session);
    const connectors = (await listSocialConnectors(workspaceId)).filter(
      (connector) => connector.provider === "META" && !connector.disabledAt,
    );

    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        status: connectors.length > 0 ? "CONNECTED" : "NOT_CONNECTED",
        connectors,
        externalActionTaken: false,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireSameOrigin(request);
    const session = await requireTokMetricSession(request);
    const body = await parseJson(request, authorizeSchema);
    const workspaceId = body.workspaceId!;
    const membership = await requireWorkspaceAccess(workspaceId, session);
    requirePermission(membership, "manage", "connectors");
    await enforceEmergencyLocks(workspaceId, "connector");

    const authorizationUrl = new URL("/api/social-media/oauth/META/start", request.url);
    authorizationUrl.searchParams.set("workspaceId", workspaceId);
    authorizationUrl.searchParams.set(
      "redirectAfter",
      `/facebook/operations?workspace=${encodeURIComponent(workspaceId)}`,
    );

    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        authUrl: authorizationUrl.toString(),
        canonicalProvider: "META",
        externalActionTaken: false,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
