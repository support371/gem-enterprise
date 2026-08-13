import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-helpers";
import { getOrganizationWorkspaceOverview, OrganizationWorkspaceError } from "@/lib/organizationWorkspace";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId")?.trim();
  if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  try {
    return NextResponse.json(await getOrganizationWorkspaceOverview(gate.session.userId, workspaceId), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof OrganizationWorkspaceError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    console.error("[workspace-overview] failed", error);
    return NextResponse.json({ error: "Workspace overview unavailable" }, { status: 500 });
  }
}
