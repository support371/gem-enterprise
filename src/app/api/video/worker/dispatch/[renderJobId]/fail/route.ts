import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTrustedVideoWorker } from "@/lib/video/worker-auth";
import { releaseVideoRenderDispatchClaim } from "@/lib/video/store";
import {
  correlationId,
  emitTokMetricAudit,
  parseJson,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const requestSchema = z.object({
  claimId: z.string().uuid(),
  retryable: z.boolean(),
  errorCode: z.string().trim().min(1).max(100),
  errorMessage: z.string().trim().min(1).max(500),
});

type RouteContext = { params: Promise<{ renderJobId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);
  try {
    requireTrustedVideoWorker(request);
    const input = await parseJson(request, requestSchema);
    const { renderJobId } = await context.params;
    const job = await releaseVideoRenderDispatchClaim({
      id: renderJobId,
      claimId: input.claimId,
      retryable: input.retryable,
      errorCode: input.errorCode,
      errorMessage: input.errorMessage,
    });
    await emitTokMetricAudit({
      workspaceId: job.workspaceId,
      actorId: job.requestedById ?? undefined,
      action: "video.render.dispatch_failed",
      entityType: "video_render_job",
      entityId: job.id,
      correlationId: cid,
      outcome: job.state.toLowerCase(),
      sourceChannel: "video-render-worker",
      metadata: {
        renderJobId: job.id,
        dispatchAttemptCount: job.dispatchAttemptCount,
        retryable: input.retryable,
        errorCode: input.errorCode,
        externalPublicationTaken: false,
      },
    });
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        data: {
          renderJobId: job.id,
          state: job.state,
          dispatchAttemptCount: job.dispatchAttemptCount,
          externalPublicationTaken: false,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
