import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  correlationId,
  parseJson,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  tokMetricErrorResponse,
  withIdempotency,
} from "@/lib/tokmetric/security";
import { queuePublishJob } from "@/lib/tokmetric/workflow";

const queueSchema = z.object({
  workspaceId: z.string().min(1),
  contentId: z.string().min(1),
  connectorId: z.string().min(1),
  scheduledFor: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const input = await parseJson(request, queueSchema);
    const membership = await requireWorkspaceAccess(input.workspaceId, session);
    requirePermission(membership, "publish", "content");
    const idempotencyKey = request.headers.get("idempotency-key");
    if (!idempotencyKey) {
      return NextResponse.json(
        { ok: false, error: { code: "IDEMPOTENCY_KEY_REQUIRED", message: "Queue requests require an Idempotency-Key header.", correlationId: cid } },
        { status: 400 },
      );
    }

    const result = await withIdempotency(
      input.workspaceId,
      idempotencyKey,
      input,
      async () => ({
        statusCode: 201,
        response: await queuePublishJob({
          workspaceId: input.workspaceId,
          contentId: input.contentId,
          connectorId: input.connectorId,
          actorId: session.userId,
          idempotencyKey,
          scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
          correlationId: cid,
        }),
      }),
      { action: "queue_publish", workspaceId: input.workspaceId, contentId: input.contentId, connectorId: input.connectorId, scheduledFor: input.scheduledFor },
    );

    return NextResponse.json({ ok: true, correlationId: cid, data: result.response }, { status: result.statusCode });
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
