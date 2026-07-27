import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTrustedVideoWorker } from "@/lib/video/worker-auth";
import { finalizeVerifiedWorkerRendersReliably } from "@/lib/video/worker-reliability";
import {
  correlationId,
  parseJson,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const requestSchema = z.object({
  limit: z.number().int().min(1).max(20).default(5),
});

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireTrustedVideoWorker(request);
    const input = await parseJson(request, requestSchema);
    const result = await finalizeVerifiedWorkerRendersReliably({
      limit: input.limit,
      correlationId: cid,
    });
    return NextResponse.json(
      { ok: true, correlationId: cid, data: result },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
