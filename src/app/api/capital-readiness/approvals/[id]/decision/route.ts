import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api/auth-helpers";
import { requireCapitalWorkspaceAccess } from "@/lib/capital-readiness/access";
import { decideCapitalApproval } from "@/lib/capital-readiness/approvals";
import { decideCapitalApprovalSchema } from "@/lib/capital-readiness/approval-validation";

type RouteContext = { params: Promise<{ id: string }> };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;
  const { id } = await context.params;

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const parsed = decideCapitalApprovalSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Validation failed", fields: parsed.error.flatten().fieldErrors }, 400);

  const access = await requireCapitalWorkspaceAccess(gate.session.userId, parsed.data.workspaceId);
  if (!access.allowed || !access.workspace) return json({ error: access.reason, code: access.code }, access.code === "WORKSPACE_LOCKED" ? 423 : 403);

  try {
    const result = await decideCapitalApproval({
      workspaceId: access.workspace.id,
      approvalRequestId: id,
      actorId: gate.session.userId,
      actorWorkspaceRole: access.workspace.role.name,
      decision: parsed.data.decision,
      reason: parsed.data.reason,
    });
    if (result.kind === "not_found") return json({ error: "Approval request not found" }, 404);
    if (result.kind === "blocked") return json({ error: result.reason, code: result.code }, 409);
    return json({ ok: true, ...result });
  } catch (error) {
    console.error("[POST /api/capital-readiness/approvals/:id/decision]", error);
    return json({ error: "Unable to record the approval decision", code: "CAPITAL_APPROVAL_DECISION_FAILED" }, 500);
  }
}
