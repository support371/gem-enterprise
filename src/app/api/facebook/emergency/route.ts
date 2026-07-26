import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  correlationId,
  emitTokMetricAudit,
  parseJson,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const controlSchema = z.object({
  workspaceId: z.string().trim().min(1),
  connectorId: z.string().trim().min(1).optional(),
  reason: z.string().trim().max(1000).optional(),
});

function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    throw new TokMetricError(
      403,
      "CROSS_ORIGIN_REQUEST_BLOCKED",
      "Emergency controls require a same-origin request.",
    );
  }
}

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim();
    if (!workspaceId) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "workspaceId is required.");
    }
    await requireWorkspaceAccess(workspaceId, session);
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        connectorDisabled: true,
        publishingDisabled: true,
        globalEmergencyLock: true,
        updatedAt: true,
      },
    });
    if (!workspace) {
      throw new TokMetricError(404, "WORKSPACE_NOT_FOUND", "Workspace not found.");
    }
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        emergencyStatus: {
          isLocked:
            workspace.globalEmergencyLock || workspace.publishingDisabled,
          globalLocked: workspace.globalEmergencyLock,
          publishingLocked: workspace.publishingDisabled,
          connectorLocked: workspace.connectorDisabled,
          updatedAt: workspace.updatedAt,
        },
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
    const input = await parseJson(request, controlSchema);
    const membership = await requireWorkspaceAccess(input.workspaceId, session);
    requirePermission(membership, "manage", "workspace");
    const isUnlock = request.nextUrl.pathname.includes("unlock");
    const isLock = request.nextUrl.pathname.includes("lock") && !isUnlock;
    if (!isLock && !isUnlock) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "Unknown emergency action.");
    }
    const workspace = await db.workspace.update({
      where: { id: input.workspaceId },
      data: { publishingDisabled: isLock },
      select: { id: true, publishingDisabled: true, updatedAt: true },
    });
    await emitTokMetricAudit({
      workspaceId: input.workspaceId,
      actorId: session.userId,
      action: isLock
        ? "SOCIAL_PUBLISHING_EMERGENCY_LOCKED"
        : "SOCIAL_PUBLISHING_EMERGENCY_UNLOCKED",
      entityType: "WORKSPACE",
      entityId: input.workspaceId,
      correlationId: cid,
      outcome: isLock ? "LOCKED" : "UNLOCKED",
      sourceChannel: "facebook-operations-compatibility",
      metadata: {
        connectorId: input.connectorId || null,
        reason: input.reason || null,
      },
    });
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        emergencyStatus: {
          isLocked: workspace.publishingDisabled,
          updatedAt: workspace.updatedAt,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
