import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  correlationId,
  emitTokMetricAudit,
  parseJson,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";
import {
  disconnectSocialConnector,
  listSocialConnectors,
} from "@/lib/social-media/oauth/connectors";

const disconnectSchema = z.object({
  workspaceId: z.string().trim().min(1),
  connectorId: z.string().trim().min(1),
});

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim();
    if (!workspaceId) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "workspaceId is required", correlationId: cid },
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    await requireWorkspaceAccess(workspaceId, session);
    const connectors = await listSocialConnectors(workspaceId);
    return NextResponse.json(
      { ok: true, correlationId: cid, connectors, externalActionTaken: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}

export async function DELETE(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const body = await parseJson(request, disconnectSchema);
    const membership = await requireWorkspaceAccess(body.workspaceId, session);
    requirePermission(membership, "manage", "connectors");
    const result = await disconnectSocialConnector(body);
    await emitTokMetricAudit({
      workspaceId: body.workspaceId,
      actorId: session.userId,
      action: "social.connector.disconnected",
      entityType: "connector",
      entityId: body.connectorId,
      correlationId: cid,
      outcome: "success",
      sourceChannel: "website",
      metadata: {
        credentialDeleted: true,
        externalRevocationAttempted: false,
        externalPublishingEnabled: false,
      },
    });
    return NextResponse.json(
      { ok: true, correlationId: cid, ...result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
