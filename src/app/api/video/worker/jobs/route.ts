import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTrustedVideoWorker } from "@/lib/video/worker-auth";
import { listTrustedWorkerRenderJobs } from "@/lib/video/worker-store";
import {
  correlationId,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const querySchema = z.coerce.number().int().min(1).max(20).default(10);

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireTrustedVideoWorker(request);
    const limit = querySchema.parse(
      request.nextUrl.searchParams.get("limit") ?? undefined,
    );
    const jobs = await listTrustedWorkerRenderJobs(limit);
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
