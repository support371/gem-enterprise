import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-helpers";
import { requireCapitalWorkspaceAccess } from "@/lib/capital-readiness/access";
import {
  authorizeCapitalClosing,
  authorizeCapitalClosingSchema,
  CapitalClosingError,
} from "@/lib/capital-readiness/closing";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;
  if (gate.accountStatus !== "active") {
    return json({ error: "An active account is required.", code: "ACTIVE_ACCOUNT_REQUIRED" }, 403);
  }

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = authorizeCapitalClosingSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", fields: parsed.error.flatten().fieldErrors }, 400);
  }

  const access = await requireCapitalWorkspaceAccess(gate.session.userId, parsed.data.workspaceId);
  if (!access.allowed || !access.workspace) {
    return json({ error: access.reason, code: access.code }, access.code === "WORKSPACE_LOCKED" ? 423 : 403);
  }

  try {
    const result = await authorizeCapitalClosing({
      closingId: id,
      actorId: gate.session.userId,
      workspaceRole: access.workspace.role.name,
      data: parsed.data,
    });
    return json({ ok: true, workspaceId: access.workspace.id, ...result });
  } catch (error) {
    if (error instanceof CapitalClosingError) {
      return json({ error: error.message, code: error.code }, error.statusCode);
    }
    console.error("[POST /api/capital-readiness/closings/:id/authorize]", error);
    return json({ error: "Closing authorization could not be completed.", code: "CAPITAL_CLOSING_AUTHORIZATION_FAILED" }, 500);
  }
}
