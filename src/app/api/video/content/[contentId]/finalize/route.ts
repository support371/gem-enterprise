import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { finalizeContentRender } from "@/lib/video/content-rendering";
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

type FinalizePayload = {
  workspaceId: string;
  promptId: string;
};

const requestSchema = z.object({
  workspaceId: z.string().trim().min(1),
  promptId: z.string().trim().min(1).max(200),
});

type RouteContext = { params: Promise<{ contentId: string }> };

function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    throw new TokMetricError(
      403,
      "CROSS_ORIGIN_REQUEST_BLOCKED",
      "Video finalization requires a same-origin request.",
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const cid = correlationId(request);
  try {
    requireSameOrigin(request);
    const session = await requireActiveTokMetricSession(request);
    const input = (await parseJson(request, requestSchema)) as FinalizePayload;
    const membership = await requireWorkspaceAccess(input.workspaceId, session);
    requirePermission(membership, "create", "media");
    requirePermission(membership, "edit", "content");
    requirePermission(membership, "review", "content");
    requirePermission(membership, "request", "approvals");

    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) {
      throw new TokMetricError(
        400,
        "IDEMPOTENCY_KEY_REQUIRED",
        "Video finalization requests require an Idempotency-Key header.",
      );
    }
    const { contentId } = await context.params;
    const normalized = { ...input, contentId };
    const result = await withIdempotency(
      input.workspaceId,
      idempotencyKey,
      normalized,
      async () => ({
        statusCode: 201,
        response: await finalizeContentRender({
          workspaceId: input.workspaceId,
          contentId,
          promptId: input.promptId,
          actorId: session.userId,
          correlationId: cid,
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
