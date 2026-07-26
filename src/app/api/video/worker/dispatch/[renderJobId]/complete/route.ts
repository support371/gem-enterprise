import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTrustedVideoWorker } from "@/lib/video/worker-auth";
import { bindVideoRenderPrompt } from "@/lib/video/store";
import {
  correlationId,
  emitDomainEvent,
  emitTokMetricAudit,
  parseJson,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const requestSchema = z.object({
  claimId: z.string().uuid(),
  promptId: z.string().trim().min(1).max(300),
});

type RouteContext = { params: Promise<{ renderJobId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);
  try {
    requireTrustedVideoWorker(request);
    const input = await parseJson(request, requestSchema);
    const { renderJobId } = await context.params;
    const job = await bindVideoRenderPrompt({
      id: renderJobId,
      claimId: input.claimId,
      promptId: input.promptId,
    });
    const metadata = {
      renderJobId: job.id,
      contentId: job.contentId,
      contentVersionId: job.contentVersionId,
      promptId: job.externalPromptId,
      dispatchMode: "trusted-worker",
      externalPublicationTaken: false,
    };
    await emitTokMetricAudit({
      workspaceId: job.workspaceId,
      actorId: job.requestedById ?? undefined,
      action: "video.render.queued",
      entityType: "video_render_job",
      entityId: job.id,
      correlationId: cid,
      outcome: "queued",
      sourceChannel: "video-render-worker",
      metadata,
    });
    await emitDomainEvent({
      workspaceId: job.workspaceId,
      aggregateType: "content",
      aggregateId: job.contentId,
      eventType: "VIDEO_RENDER_QUEUED",
      correlationId: cid,
      metadata,
    });
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        data: {
          renderJobId: job.id,
          promptId: job.externalPromptId,
          state: job.state,
          externalPublicationTaken: false,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
