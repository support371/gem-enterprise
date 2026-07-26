import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTrustedVideoWorker } from "@/lib/video/worker-auth";
import { claimWorkerDispatchJobs } from "@/lib/video/dispatch-store";
import {
  correlationId,
  parseJson,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const requestSchema = z.object({
  limit: z.number().int().min(1).max(20).default(5),
  leaseMs: z.number().int().min(30_000).max(15 * 60_000).default(120_000),
});

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireTrustedVideoWorker(request);
    const input = await parseJson(request, requestSchema);
    const jobs = await claimWorkerDispatchJobs(input);
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
            complianceReviewId: job.complianceReviewId,
            clientId: job.clientId,
            claimId: job.dispatchClaimId,
            claimExpiresAt: job.dispatchClaimExpiresAt,
            dispatchAttemptCount: job.dispatchAttemptCount,
            dispatch: job.dispatchPayload,
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
