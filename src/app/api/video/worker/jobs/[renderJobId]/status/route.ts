import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTrustedVideoWorker } from "@/lib/video/worker-auth";
import {
  getVideoRenderJobById,
  updateVideoRenderState,
} from "@/lib/video/store";
import {
  correlationId,
  emitTokMetricAudit,
  parseJson,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const requestSchema = z.object({
  promptId: z.string().trim().min(1).max(300),
  state: z.enum(["RUNNING", "FAILED"]),
  errorCode: z.string().trim().min(1).max(100).optional(),
  errorMessage: z.string().trim().min(1).max(500).optional(),
});

type RouteContext = { params: Promise<{ renderJobId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);
  try {
    requireTrustedVideoWorker(request);
    const input = await parseJson(request, requestSchema);
    const { renderJobId } = await context.params;
    const record = await getVideoRenderJobById(renderJobId);
    if (!record || record.externalPromptId !== input.promptId) {
      throw new TokMetricError(
        409,
        "VIDEO_RENDER_OWNERSHIP_INVALID",
        "The provider prompt is not bound to this durable render job.",
      );
    }
    if (record.state === "FINALIZED") {
      return NextResponse.json(
        {
          ok: true,
          correlationId: cid,
          data: {
            renderJobId: record.id,
            state: record.state,
            idempotent: true,
            externalPublicationTaken: false,
          },
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }
    if (input.state === "FAILED" && (!input.errorCode || !input.errorMessage)) {
      throw new TokMetricError(
        400,
        "VIDEO_RENDER_FAILURE_DETAILS_REQUIRED",
        "Failed render status requires a safe error code and message.",
      );
    }
    const updated = await updateVideoRenderState({
      id: record.id,
      state: input.state,
      outputManifest: record.outputManifest,
      errorCode: input.state === "FAILED" ? input.errorCode : undefined,
      errorMessage: input.state === "FAILED" ? input.errorMessage : undefined,
    });
    await emitTokMetricAudit({
      workspaceId: updated.workspaceId,
      actorId: updated.requestedById ?? undefined,
      action: "video.render.worker_status",
      entityType: "video_render_job",
      entityId: updated.id,
      correlationId: cid,
      outcome: updated.state.toLowerCase(),
      sourceChannel: "video-render-worker",
      metadata: {
        contentId: updated.contentId,
        contentVersionId: updated.contentVersionId,
        promptId: updated.externalPromptId,
        errorCode: updated.errorCode,
        externalPublicationTaken: false,
      },
    });
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        data: {
          renderJobId: updated.id,
          state: updated.state,
          externalPublicationTaken: false,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
