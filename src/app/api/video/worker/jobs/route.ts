import { NextRequest, NextResponse } from "next/server";
import { listWorkerVideoJobs } from "@/lib/video/worker-store";
import { requireVideoRenderWorker } from "@/lib/video/worker-auth";
import {
  correlationId,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireVideoRenderWorker(request);
    const requestedLimit = Number.parseInt(
      request.nextUrl.searchParams.get("limit") ?? "10",
      10,
    );
    const jobs = await listWorkerVideoJobs(
      Number.isFinite(requestedLimit) ? requestedLimit : 10,
    );
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
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
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
