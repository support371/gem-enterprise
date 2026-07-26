import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTrustedVideoWorker } from "@/lib/video/worker-auth";
import { listTrustedWorkerRenderJobs } from "@/lib/video/worker-store";
import {
  correlationId,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const querySchema = z.coerce.number().int().min(1).max(20).default(10);

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireTrustedVideoWorker(request);
    const parsed = querySchema.safeParse(
      request.nextUrl.searchParams.get("limit") ?? undefined,
    );
    if (!parsed.success) {
      throw new TokMetricError(
        400,
        "VIDEO_WORKER_QUERY_INVALID",
        "The worker batch limit must be an integer from 1 to 20.",
      );
    }
    const jobs = await listTrustedWorkerRenderJobs(parsed.data);
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        data: {
          jobs: jobs.map((job) => ({
            renderJobId: job.id,
            workspaceId: job.workspaceId,
            contentId: job.contentId,
            contentVersionId: job.contentVersionId,
            promptId: job.externalPromptId,
            state: job.state,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
          })),
          externalPublicationTaken: false,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
