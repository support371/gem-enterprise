import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTokMetricGptAuth } from "@/lib/tokmetric/gptAuth";
import { correlationId, tokMetricErrorResponse } from "@/lib/tokmetric/security";
import { tokMetricAgents } from "@/lib/tokmetric/agents";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireTokMetricGptAuth(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: { code: "WORKSPACE_ID_REQUIRED", message: "workspaceId is required.", correlationId: cid } }, { status: 400 });
    }

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        globalEmergencyLock: true,
        publishingDisabled: true,
        connectorDisabled: true,
        _count: { select: { contents: true, approvalRequests: true, publishJobs: true, mediaAssets: true, connectors: true } },
      },
    });
    if (!workspace) {
      return NextResponse.json({ ok: false, error: { code: "WORKSPACE_NOT_FOUND", message: "Workspace was not found.", correlationId: cid } }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      correlationId: cid,
      workspace,
      agents: Object.values(tokMetricAgents),
      livePublishingEnabled: process.env.TOKMETRIC_LIVE_PUBLISHING_ENABLED === "true",
      controls: {
        externalSuccessRequiresPlatformConfirmation: true,
        draftAgentsCannotSubmitExternally: true,
        humanApprovalRequiredForQueueing: true,
      },
    });
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
