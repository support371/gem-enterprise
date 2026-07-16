import { NextRequest, NextResponse } from "next/server";
import { requireTokMetricGptAuth } from "@/lib/tokmetric/gptAuth";
import {
  executeTokMetricGptAction,
  TOKMETRIC_GPT_ACTIONS,
  type TokMetricGptAction,
} from "@/lib/tokmetric/gptActionsV2";
import {
  invokeTokMetricGptGateway,
  shouldUseTokMetricGptGateway,
  TokMetricGatewayUnavailableError,
} from "@/lib/tokmetric/gptGateway";
import {
  correlationId,
  redactSecrets,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

export const dynamic = "force-dynamic";

function isSupportedAction(action: string): action is TokMetricGptAction {
  return (TOKMETRIC_GPT_ACTIONS as readonly string[]).includes(action);
}

async function readRequestBody(request: NextRequest): Promise<unknown> {
  const raw = await request.text();
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new TokMetricError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const cid = correlationId(request);
  try {
    const { action } = await params;
    if (!isSupportedAction(action)) {
      throw new TokMetricError(
        404,
        "GPT_ACTION_NOT_FOUND",
        "The requested TokMetric GPT action does not exist.",
      );
    }

    const body = await readRequestBody(request);

    // The canonical Vercel runtime uses the Supabase gateway rather than a
    // direct Prisma connection. Forward the caller's bearer credential to the
    // dedicated TokMetric gateway, which validates a SHA-256 credential hash,
    // binds access to one production workspace, audits each action, and keeps
    // write operations blocked during the controlled launch.
    if (shouldUseTokMetricGptGateway()) {
      const result = await invokeTokMetricGptGateway({
        action,
        body,
        authorization: request.headers.get("authorization") ?? "",
        correlationId: cid,
      });

      return NextResponse.json(result.body, { status: result.statusCode });
    }

    requireTokMetricGptAuth(request);
    const result = await executeTokMetricGptAction(action, body, cid);
    return NextResponse.json(
      {
        ok: result.statusCode < 400,
        correlationId: cid,
        data: redactSecrets(result.data),
      },
      { status: result.statusCode },
    );
  } catch (error) {
    if (error instanceof TokMetricGatewayUnavailableError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
            correlationId: cid,
          },
        },
        { status: 503 },
      );
    }

    return tokMetricErrorResponse(error, cid);
  }
}
