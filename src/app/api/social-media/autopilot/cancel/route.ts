import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  cancelPendingSocialAutopilotJobs,
} from "@/lib/social-media/publishing/store";
import {
  SOCIAL_AUTOPILOT_POLICY_VERSION,
} from "@/lib/social-media/autopilot/policy";
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

const cancelSchema = z.object({
  workspaceId: z.string().trim().min(1),
  currentPolicyOnly: z.boolean().default(false),
});

function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    throw new TokMetricError(
      403,
      "CROSS_ORIGIN_REQUEST_BLOCKED",
      "Social Autopilot cancellation requires a same-origin request.",
    );
  }
}

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireSameOrigin(request);
    const session = await requireTokMetricSession(request);
    const input = await parseJson(request, cancelSchema);
    const membership = await requireWorkspaceAccess(input.workspaceId, session);
    requirePermission(membership, "publish", "content");

    const result = await cancelPendingSocialAutopilotJobs({
      workspaceId: input.workspaceId,
      policyVersion: input.currentPolicyOnly
        ? SOCIAL_AUTOPILOT_POLICY_VERSION
        : undefined,
    });

    await emitTokMetricAudit({
      workspaceId: input.workspaceId,
      actorId: session.userId,
      action: "SOCIAL_AUTOPILOT_CANCELLED",
      entityType: "SOCIAL_PUBLISHING_JOB",
      correlationId: cid,
      outcome: "CANCELLED",
      sourceChannel: "social-autopilot",
      metadata: {
        cancelled: result.cancelled,
        currentPolicyOnly: input.currentPolicyOnly,
        policyVersion: SOCIAL_AUTOPILOT_POLICY_VERSION,
        externalActionTaken: false,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        ...result,
        externalActionTaken: false,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
