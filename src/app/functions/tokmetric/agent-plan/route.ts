import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTokMetricGptAuth } from "@/lib/tokmetric/gptAuth";
import { getTokMetricAgent, validateAgentOutput, type TokMetricAgentName } from "@/lib/tokmetric/agents";
import { correlationId, parseJson, tokMetricErrorResponse } from "@/lib/tokmetric/security";

const schema = z.object({
  agent: z.enum(["content_strategist", "script_writer", "quality_reviewer", "publishing_coordinator"]),
  outputType: z.string().min(1),
  workspaceId: z.string().min(1),
  brief: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireTokMetricGptAuth(request);
    const body = await parseJson(request, schema);
    const agent = validateAgentOutput(body.agent as TokMetricAgentName, body.outputType);
    getTokMetricAgent(body.agent);

    return NextResponse.json({
      ok: true,
      correlationId: cid,
      workspaceId: body.workspaceId,
      agent,
      result: {
        status: "draft_only",
        outputType: body.outputType,
        brief: body.brief,
        nextStep: agent.requiresHumanApproval ? "Send to human review." : "Create or update a draft.",
        externalActionTaken: false,
      },
    });
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
