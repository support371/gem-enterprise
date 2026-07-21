import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api/auth-helpers";
import { requireCapitalWorkspaceAccess } from "@/lib/capital-readiness/access";
import { buildCapitalCommandCenterSnapshot } from "@/lib/capital-readiness/repository";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function GET(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const access = await requireCapitalWorkspaceAccess(gate.session.userId, workspaceId);
  if (!access.allowed || !access.workspace) {
    return json({ error: access.reason, code: access.code }, access.code === "WORKSPACE_LOCKED" ? 423 : 403);
  }

  const snapshot = await buildCapitalCommandCenterSnapshot(access.workspace.id);
  return json(snapshot, snapshot.availability === "ready" ? 200 : 503);
}
