import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api/auth-helpers";
import { requireCapitalWorkspaceAccess } from "@/lib/capital-readiness/access";
import { requestCapitalApproval } from "@/lib/capital-readiness/approvals";
import { requestCapitalApprovalSchema } from "@/lib/capital-readiness/approval-validation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function GET(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const access = await requireCapitalWorkspaceAccess(gate.session.userId, workspaceId);
  if (!access.allowed || !access.workspace) return json({ error: access.reason, code: access.code }, access.code === "WORKSPACE_LOCKED" ? 423 : 403);

  const approvals = await db.approvalRequest.findMany({
    where: { workspaceId: access.workspace.id, action: { startsWith: "capital:" } },
    select: {
      id: true,
      action: true,
      requiredRole: true,
      objectHash: true,
      state: true,
      expiresAt: true,
      createdAt: true,
      requestedById: true,
      decisions: {
        select: { actorId: true, decision: true, reason: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return json({ approvals });
}

export async function POST(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const parsed = requestCapitalApprovalSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Validation failed", fields: parsed.error.flatten().fieldErrors }, 400);

  const access = await requireCapitalWorkspaceAccess(gate.session.userId, parsed.data.workspaceId);
  if (!access.allowed || !access.workspace) return json({ error: access.reason, code: access.code }, access.code === "WORKSPACE_LOCKED" ? 423 : 403);

  try {
    const result = await requestCapitalApproval({
      ...parsed.data,
      workspaceId: access.workspace.id,
      actorId: gate.session.userId,
    });
    return json({ ok: true, ...result }, result.reused ? 200 : 201);
  } catch (error) {
    console.error("[POST /api/capital-readiness/approvals]", error);
    return json({ error: "Unable to create the approval request", code: "CAPITAL_APPROVAL_CREATE_FAILED" }, 500);
  }
}
