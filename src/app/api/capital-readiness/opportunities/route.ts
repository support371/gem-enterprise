import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api/auth-helpers";
import { requireCapitalWorkspaceAccess } from "@/lib/capital-readiness/access";
import { createCapitalOpportunity, listCapitalOpportunities } from "@/lib/capital-readiness/repository";
import { createCapitalOpportunitySchema } from "@/lib/capital-readiness/validation";

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

  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(requestedLimit) ? requestedLimit : 50;

  try {
    const opportunities = await listCapitalOpportunities(access.workspace.id, limit);
    return json({
      workspace: { id: access.workspace.id, name: access.workspace.name },
      opportunities,
    });
  } catch (error) {
    console.error("[GET /api/capital-readiness/opportunities]", error);
    return json(
      {
        error: "Capital-readiness storage is not available in this environment.",
        code: "CAPITAL_STORAGE_NOT_READY",
      },
      503,
    );
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = createCapitalOpportunitySchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", fields: parsed.error.flatten().fieldErrors }, 400);
  }

  const access = await requireCapitalWorkspaceAccess(gate.session.userId, parsed.data.workspaceId);
  if (!access.allowed || !access.workspace) {
    return json({ error: access.reason, code: access.code }, access.code === "WORKSPACE_LOCKED" ? 423 : 403);
  }

  try {
    const result = await createCapitalOpportunity(parsed.data, gate.session.userId);
    return json({ ok: true, ...result }, 201);
  } catch (error) {
    console.error("[POST /api/capital-readiness/opportunities]", error);
    return json(
      {
        error: "Unable to create the capital-readiness opportunity.",
        code: "CAPITAL_OPPORTUNITY_CREATE_FAILED",
      },
      500,
    );
  }
}
