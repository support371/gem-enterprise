import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  finalizeContentRender,
  verifyRenderedUpload,
} from "@/lib/video/content-rendering";
import { getVideoRenderJobById } from "@/lib/video/store";
import { requireVideoRenderWorker } from "@/lib/video/worker-auth";
import {
  correlationId,
  parseJson,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const requestSchema = z.object({
  renderJobId: z.string().uuid(),
  storageRef: z.string().url().max(2000),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(["video/mp4", "video/webm", "video/quicktime"]),
  fileSize: z.number().int().positive().max(1024 * 1024 * 1024),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i),
});

type UploadPayload = {
  renderJobId: string;
  storageRef: string;
  fileName: string;
  mimeType: "video/mp4" | "video/webm" | "video/quicktime";
  fileSize: number;
  checksumSha256: string;
};

function autoFinalizeEnabled() {
  return process.env.VIDEO_RENDER_AUTO_FINALIZE?.trim().toLowerCase() === "true";
}

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireVideoRenderWorker(request);
    const input = (await parseJson(request, requestSchema)) as UploadPayload;
    const verification = await verifyRenderedUpload({
      ...input,
      correlationId: cid,
    });

    let finalization: Awaited<ReturnType<typeof finalizeContentRender>> | null = null;
    if (autoFinalizeEnabled()) {
      const actorId = process.env.VIDEO_RENDER_SYSTEM_ACTOR_ID?.trim();
      if (!actorId) {
        throw new TokMetricError(
          503,
          "VIDEO_RENDER_SYSTEM_ACTOR_NOT_CONFIGURED",
          "Automatic render finalization requires VIDEO_RENDER_SYSTEM_ACTOR_ID.",
        );
      }
      const job = await getVideoRenderJobById(input.renderJobId);
      if (!job?.externalPromptId) {
        throw new TokMetricError(
          409,
          "VIDEO_RENDER_JOB_NOT_READY",
          "The durable render job is missing its provider prompt binding.",
        );
      }
      finalization = await finalizeContentRender({
        workspaceId: job.workspaceId,
        contentId: job.contentId,
        promptId: job.externalPromptId,
        actorId,
        correlationId: cid,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        data: {
          verification,
          finalization,
          autoFinalized: Boolean(finalization),
          externalPublicationTaken: false,
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
