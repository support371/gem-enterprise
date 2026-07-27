import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queueCampaignVideoRenders } from "@/lib/video/campaign-rendering";
import { videoRenderDispatchMode } from "@/lib/video/worker-dispatch";
import {
  correlationId,
  parseJson,
  requireActiveTokMetricSession,
  requirePermission,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
  withIdempotency,
} from "@/lib/tokmetric/security";

const requestSchema = z.object({
  workspaceId: z.string().trim().min(1),
  limit: z.number().int().min(1).max(100).default(25),
});

type RouteContext = { params: Promise<{ campaignId: string }> };

function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    throw new TokMetricError(
      403,
      "CROSS_ORIGIN_REQUEST_BLOCKED",
      "Campaign rendering requires a same-origin request.",
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);
  try {
    requireSameOrigin(request);
    const session = await requireActiveTokMetricSession(request);
    const input = await parseJson(request, requestSchema);
    const membership = await requireWorkspaceAccess(input.workspaceId, session);
    requirePermission(membership, "create", "media");
    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      throw new TokMetricError(
        400,
        "IDEMPOTENCY_KEY_REQUIRED",
        "Campaign render requests require an Idempotency-Key header.",
      );
    }
    const { campaignId } = await context.params;
    const normalized = {
      workspaceId: input.workspaceId,
      campaignId,
      limit: input.limit,
      dispatchMode: videoRenderDispatchMode(),
    };
    const result = await withIdempotency(
      input.workspaceId,
      idempotencyKey,
      normalized,
      async () => ({
        statusCode: 202,
        response: await queueCampaignVideoRenders({
          workspaceId: input.workspaceId,
          campaignId,
          actorId: session.userId,
          correlationId: cid,
          limit: input.limit,
        }),
      }),
      normalized,
    );
    return NextResponse.json(
      { ok: true, correlationId: cid, data: result.response },
      {
        status: result.statusCode,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
