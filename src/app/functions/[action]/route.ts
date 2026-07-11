import { NextRequest, NextResponse } from "next/server";
import { requireTokMetricGptAuth } from "@/lib/tokmetric/gptAuth";
import {
  executeTokMetricGptAction,
  TOKMETRIC_GPT_ACTIONS,
  type TokMetricGptAction,
} from "@/lib/tokmetric/gptActionsV2";
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
    requireTokMetricGptAuth(request);
    const { action } = await params;
    if (!isSupportedAction(action)) {
      throw new TokMetricError(404, "GPT_ACTION_NOT_FOUND", "The requested TokMetric GPT action does not exist.");
    }

    const body = await readRequestBody(request);
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
    return tokMetricErrorResponse(error, cid);
  }
}
