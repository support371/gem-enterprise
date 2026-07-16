import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  runTokMetricAgent,
  resolveConfiguredTokMetricGptActor,
} from "@/lib/tokmetric/agentRuntime";
import { requireTokMetricGptAuth } from "@/lib/tokmetric/gptAuth";
import {
  invokeTokMetricAgentGateway,
  shouldUseTokMetricAgentGateway,
  TokMetricAgentGatewayUnavailableError,
} from "@/lib/tokmetric/agentGateway";
import {
  correlationId,
  redactSecrets,
  TokMetricError,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

export const dynamic = "force-dynamic";

const schema = z.object({
  agent: z.enum([
    "content_strategist",
    "script_writer",
    "quality_reviewer",
    "publishing_coordinator",
  ]),
  outputType: z.string().min(1).max(100),
  workspaceId: z.string().min(1),
  brief: z.string().min(1).max(5000),
});

async function readBody(request: NextRequest) {
  const raw = await request.text();
  let parsed: unknown;
  try {
    parsed = raw.trim() ? JSON.parse(raw) : {};
  } catch {
    throw new TokMetricError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new TokMetricError(
      400,
      "VALIDATION_ERROR",
      "TokMetric specialized-agent input is invalid.",
    );
  }
  return result.data;
}

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const body = await readBody(request);

    if (shouldUseTokMetricAgentGateway()) {
      const result = await invokeTokMetricAgentGateway({
        body,
        authorization: request.headers.get("authorization") ?? "",
        correlationId: cid,
      });
      return NextResponse.json(result.body, { status: result.statusCode });
    }

    requireTokMetricGptAuth(request);
    const actor = await resolveConfiguredTokMetricGptActor(body.workspaceId);
    const result = await runTokMetricAgent({
      workspaceId: body.workspaceId,
      actorId: actor.id,
      agent: body.agent,
      outputType: body.outputType,
      brief: body.brief,
      sourceChannel: "custom_gpt",
      correlationId: cid,
    });

    return NextResponse.json({
      ok: true,
      correlationId: cid,
      workspaceId: body.workspaceId,
      data: redactSecrets(result),
    });
  } catch (error) {
    if (error instanceof TokMetricAgentGatewayUnavailableError) {
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
