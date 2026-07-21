import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-helpers";
import { requireCapitalWorkspaceAccess } from "@/lib/capital-readiness/access";
import {
  CapitalLifecycleError,
  capitalLifecycleSchema,
  executeCapitalLifecycle,
} from "@/lib/capital-readiness/lifecycle";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: NextRequest) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;
  if (gate.accountStatus !== "active") {
    return json({ error: "An active account is required.", code: "ACTIVE_ACCOUNT_REQUIRED" }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = capitalLifecycleSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", fields: parsed.error.flatten().fieldErrors }, 400);
  }

  const access = await requireCapitalWorkspaceAccess(gate.session.userId, parsed.data.workspaceId);
  if (!access.allowed || !access.workspace) {
    return json({ error: access.reason, code: access.code }, access.code === "WORKSPACE_LOCKED" ? 423 : 403);
  }

  try {
    const result = await executeCapitalLifecycle(parsed.data, {
      id: gate.session.userId,
      workspaceRole: access.workspace.role.name,
    });
    return json({
      ok: true,
      action: parsed.data.action,
      workspaceId: access.workspace.id,
      result,
    });
  } catch (error) {
    if (error instanceof CapitalLifecycleError) {
      return json({ error: error.message, code: error.code }, error.statusCode);
    }
    console.error("[POST /api/capital-readiness/lifecycle]", error);
    return json({ error: "The lifecycle action could not be completed.", code: "CAPITAL_LIFECYCLE_FAILED" }, 500);
  }
}
