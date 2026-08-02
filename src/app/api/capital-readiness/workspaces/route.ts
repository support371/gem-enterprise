import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api/auth-helpers";
import { listAccessibleWorkspaces } from "@/lib/workspaceAccess";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  try {
    const workspaces = await listAccessibleWorkspaces(gate.session.userId);
    return NextResponse.json(
      {
        workspaces: workspaces.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          organization: workspace.organization,
          role: workspace.role,
          permissions: workspace.permissions,
          controls: workspace.controls,
        })),
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("[GET /api/capital-readiness/workspaces]", error);
    return NextResponse.json(
      { error: "Unable to load accessible workspaces", code: "WORKSPACE_DIRECTORY_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
