import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { runTokMetricAgent } from "@/lib/tokmetric/agentRuntime";
import {
  correlationId,
  parseJson,
  redactSecrets,
  requirePermission,
  requireTokMetricSession,
  requireWorkspaceAccess,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

export const dynamic = "force-dynamic";

const runSchema = z.object({
  workspaceId: z.string().min(1),
  agent: z.enum(["content_strategist", "script_writer", "quality_reviewer", "publishing_coordinator"]),
  outputType: z.string().min(1).max(100),
  brief: z.string().min(1).max(5000),
});

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    const rawLimit = request.nextUrl.searchParams.get("limit") ?? "25";
    const limit = Math.min(100, Math.max(1, Number.parseInt(rawLimit, 10) || 25));
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: { code: "WORKSPACE_ID_REQUIRED", message: "workspaceId is required.", correlationId: cid } }, { status: 400 });
    }

    const membership = await requireWorkspaceAccess(workspaceId, session);
    requirePermission(membership, "read", "agents");

    const events = await db.domainEvent.findMany({
      where: {
        workspaceId,
        aggregateType: "agent_run",
        eventType: { in: ["AGENT_RUN_COMPLETED", "AGENT_RUN_BLOCKED"] },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        aggregateId: true,
        eventType: true,
        correlationId: true,
        safeMetadata: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      correlationId: cid,
      data: {
        workspaceId,
        runs: redactSecrets(events),
        total: events.length,
      },
    });
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const body = await parseJson(request, runSchema);
    const membership = await requireWorkspaceAccess(body.workspaceId, session);
    requirePermission(membership, "create", "agents");

    const result = await runTokMetricAgent({
      workspaceId: body.workspaceId,
      actorId: session.userId,
      agent: body.agent,
      outputType: body.outputType,
      brief: body.brief,
      sourceChannel: "website",
      correlationId: cid,
    });

    return NextResponse.json({ ok: true, correlationId: cid, data: redactSecrets(result) }, { status: 201 });
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
