import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTrustedVideoWorker } from "@/lib/video/worker-auth";
import {
  bindWorkerPromptIdempotently,
  ensureWorkerQueuedEvidence,
} from "@/lib/video/worker-reliability";
import {
  correlationId,
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
    const job = await bindWorkerPromptIdempotently({
      id: renderJobId,
      claimId: input.claimId,
      promptId: input.promptId,
    });
    await ensureWorkerQueuedEvidence({ job, correlationId: cid });
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
