import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getVideoRenderJobById,
  updateVideoRenderState,
  type VideoRenderJobState,
} from "@/lib/video/store";
import { requireVideoRenderWorker } from "@/lib/video/worker-auth";
import {
  correlationId,
  parseJson,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const requestSchema = z.object({
  promptId: z.string().trim().min(1).max(200),
  state: z.enum(["QUEUED", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"]),
  outputManifest: z.record(z.unknown()).optional(),
  errorCode: z.string().trim().min(1).max(100).optional(),
  errorMessage: z.string().trim().min(1).max(500).optional(),
});

type RouteContext = { params: Promise<{ renderJobId: string }> };

type StatusPayload = {
  promptId: string;
  state: VideoRenderJobState;
  outputManifest?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);
  try {
    requireVideoRenderWorker(request);
    const input = (await parseJson(request, requestSchema)) as StatusPayload;
    const { renderJobId } = await context.params;
    const record = await getVideoRenderJobById(renderJobId);
    if (!record || record.externalPromptId !== input.promptId) {
      throw new TokMetricError(
        409,
        "VIDEO_RENDER_WORKER_BINDING_INVALID",
        "The worker status update is not bound to this render job and provider prompt.",
      );
    }
    if (record.state === "FINALIZED") {
      return NextResponse.json(
        {
          ok: true,
          correlationId: cid,
          data: { renderJobId: record.id, state: record.state, unchanged: true },
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    const updated = await updateVideoRenderState({
      id: record.id,
      state: input.state,
      outputManifest: input.outputManifest,
      errorCode: input.errorCode,
      errorMessage: input.errorMessage,
    });
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        data: {
          renderJobId: updated.id,
          state: updated.state,
          updatedAt: updated.updatedAt,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
