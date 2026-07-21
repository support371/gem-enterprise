import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api/auth-helpers";
import { requireCapitalWorkspaceAccess } from "@/lib/capital-readiness/access";
import { transitionCapitalMatter } from "@/lib/capital-readiness/repository";
import { capitalMatterTransitionSchema } from "@/lib/capital-readiness/validation";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = capitalMatterTransitionSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", fields: parsed.error.flatten().fieldErrors }, 400);
  }

  const access = await requireCapitalWorkspaceAccess(gate.session.userId, parsed.data.workspaceId);
  if (!access.allowed || !access.workspace) {
    return json({ error: access.reason, code: access.code }, access.code === "WORKSPACE_LOCKED" ? 423 : 403);
  }

  try {
    const result = await transitionCapitalMatter({
      matterId: id,
      workspaceId: access.workspace.id,
      nextStatus: parsed.data.nextStatus,
      actorId: gate.session.userId,
      reason: parsed.data.reason,
      supplementalContext: parsed.data.context,
    });

    if (result.kind === "not_found") {
      return json({ error: "Matter not found" }, 404);
    }
    if (result.kind === "blocked") {
      return json({ error: result.decision.reason, code: result.decision.code, context: result.context }, 409);
    }

    return json({ ok: true, matter: result.matter, decision: result.decision, correlationId: result.correlationId });
  } catch (error) {
    console.error("[POST /api/capital-readiness/matters/:id/transition]", error);
    return json(
      {
        error: "Unable to transition the capital-readiness matter.",
        code: "CAPITAL_MATTER_TRANSITION_FAILED",
      },
      500,
    );
  }
}
