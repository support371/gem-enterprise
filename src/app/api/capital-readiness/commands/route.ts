import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api/auth-helpers";
import { requireCapitalWorkspaceAccess } from "@/lib/capital-readiness/access";
import { capitalCommandSchema } from "@/lib/capital-readiness/command-schemas";
import { CapitalCommandError, executeCapitalCommand } from "@/lib/capital-readiness/commands";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
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

  const parsed = capitalCommandSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", fields: parsed.error.flatten().fieldErrors }, 400);
  }

  const access = await requireCapitalWorkspaceAccess(gate.session.userId, parsed.data.workspaceId);
  if (!access.allowed || !access.workspace) {
    return json({ error: access.reason, code: access.code }, access.code === "WORKSPACE_LOCKED" ? 423 : 403);
  }

  if (parsed.data.command === "ADD_ENGAGEMENT_FEE" && parsed.data.payload.feeType === "TRANSACTION_BASED_FEE") {
    return json(
      {
        error:
          "Transaction-based fees remain disabled until securities counsel, a verified licensed partner, compliance, and the production owner activate a jurisdiction-specific fee arrangement.",
        code: "TRANSACTION_BASED_FEES_NOT_ACTIVATED",
      },
      423,
    );
  }

  if (parsed.data.command === "AUTHORIZE_CLOSING") {
    return json(
      {
        error: "Use the dedicated closing authorization endpoint so every persisted field and closing gate is explicit.",
        code: "DEDICATED_CLOSING_AUTHORIZATION_REQUIRED",
        endpoint: `/api/capital-readiness/closings/${parsed.data.payload.closingId}/authorize`,
      },
      409,
    );
  }

  try {
    const result = await executeCapitalCommand(parsed.data, gate.session.userId);
    return json({ ok: true, command: parsed.data.command, workspaceId: access.workspace.id, ...result });
  } catch (error) {
    if (error instanceof CapitalCommandError) {
      return json({ error: error.message, code: error.code }, error.statusCode);
    }
    console.error("[POST /api/capital-readiness/commands]", error);
    return json({ error: "The capital command could not be completed.", code: "CAPITAL_COMMAND_FAILED" }, 500);
  }
}
