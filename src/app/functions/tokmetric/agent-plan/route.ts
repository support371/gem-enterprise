import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runTokMetricAgent, resolveConfiguredTokMetricGptActor } from "@/lib/tokmetric/agentRuntime";
import { requireTokMetricGptAuth } from "@/lib/tokmetric/gptAuth";
import { correlationId, parseJson, redactSecrets, tokMetricErrorResponse } from "@/lib/tokmetric/security";

export const dynamic = "force-dynamic";

const schema = z.object({
  agent: z.enum(["content_strategist", "script_writer", "quality_reviewer", "publishing_coordinator"]),
  outputType: z.string().min(1).max(100),
  workspaceId: z.string().min(1),
  brief: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireTokMetricGptAuth(request);
    const body = await parseJson(request, schema);
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
    return tokMetricErrorResponse(error, cid);
  }
}
