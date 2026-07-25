import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  latestContentRender,
  queueContentRender,
} from "@/lib/video/content-rendering";
import {
  correlationId,
  parseJson,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  TokMetricError,
  tokMetricErrorResponse,
  withIdempotency,
} from "@/lib/tokmetric/security";

const requestSchema = z.object({
  workspaceId: z.string().trim().min(1),
  seed: z.number().int().nonnegative().optional(),
});

type RouteContext = { params: Promise<{ contentId: string }> };

function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    throw new TokMetricError(
      403,
      "CROSS_ORIGIN_REQUEST_BLOCKED",
      "Video rendering requires a same-origin request.",
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim();
    if (!workspaceId) {
      throw new TokMetricError(400, "VALIDATION_ERROR", "workspaceId is required.");
    }
    await requireWorkspaceAccess(workspaceId, session);
    const { contentId } = await context.params;
    const render = await latestContentRender({ workspaceId, contentId });
    return NextResponse.json(
      {
        ok: true,
        correlationId: cid,
        render,
        externalPublicationTaken: false,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);
  try {
    requireSameOrigin(request);
    const session = await requireTokMetricSession(request);
    const input = await parseJson(request, requestSchema);
    const membership = await requireWorkspaceAccess(input.workspaceId, session);
    requirePermission(membership, "create", "media");
    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      throw new TokMetricError(
        400,
        "IDEMPOTENCY_KEY_REQUIRED",
        "Content render requests require an Idempotency-Key header.",
      );
    }
    const { contentId } = await context.params;
    const normalized = {
      workspaceId: input.workspaceId,
      contentId,
      seed: input.seed ?? null,
    };
    const result = await withIdempotency(
      input.workspaceId,
      idempotencyKey,
      normalized,
      async () => ({
        statusCode: 202,
        response: await queueContentRender({
          workspaceId: input.workspaceId,
          contentId,
          actorId: session.userId,
          correlationId: cid,
          seed: input.seed,
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
