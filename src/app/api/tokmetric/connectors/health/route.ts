import { NextRequest, NextResponse } from "next/server";
import { correlationId, requireTokMetricSession, requireWorkspaceAccess, tokMetricErrorResponse } from "@/lib/tokmetric/security";
import { updateConnectorHealth, listWorkspaceConnectors } from "@/lib/tokmetric/oauth/connectors";

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "workspaceId is required", correlationId: cid } }, { status: 400 });
    await requireWorkspaceAccess(workspaceId, session);
    await updateConnectorHealth(workspaceId);
    return NextResponse.json({ ok: true, correlationId: cid, connectors: await listWorkspaceConnectors(workspaceId) });
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
