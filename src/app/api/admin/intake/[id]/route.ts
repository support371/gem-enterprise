import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { getRequestContext, requireAdmin } from "@/lib/api/auth-helpers";
import {
  getIntakeSubmission,
  IntakeStatusConflictError,
  IntakeStoreUnavailableError,
  updateIntakeSubmission,
} from "@/lib/intake/repository";
import { intakeStatuses } from "@/lib/intake/types";
import { canTransitionIntake } from "@/lib/intake/workflow";

const updateSchema = z.object({
  status: z.enum(intakeStatuses),
  reason: z.string().trim().min(10).max(1_000),
  assignedToId: z.string().trim().min(1).max(128).nullable().optional(),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { id } = await context.params;

  try {
    const result = await getIntakeSubmission(id);
    if (!result) return json({ error: "Intake submission not found" }, 404);
    return json(result);
  } catch (error) {
    if (error instanceof IntakeStoreUnavailableError) {
      return json({ error: error.message, code: "INTAKE_STORAGE_NOT_READY" }, 503);
    }
    console.error("[GET /api/admin/intake/:id]", error);
    return json({ error: "Unable to load the intake submission" }, 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Validation failed", fields: parsed.error.flatten().fieldErrors }, 400);
  }

  try {
    const current = await getIntakeSubmission(id);
    if (!current) return json({ error: "Intake submission not found" }, 404);
    if (!canTransitionIntake(current.submission.status, parsed.data.status)) {
      return json(
        {
          error: `Status cannot move from ${current.submission.status} to ${parsed.data.status}`,
          code: "INVALID_STATUS_TRANSITION",
        },
        409,
      );
    }

    if (parsed.data.assignedToId) {
      const assignee = await db.user.findUnique({
        where: { id: parsed.data.assignedToId },
        select: { id: true, isActive: true, role: true },
      });
      if (
        !assignee ||
        !assignee.isActive ||
        !["analyst", "admin", "super_admin", "internal"].includes(assignee.role)
      ) {
        return json({ error: "The selected assignee is not an active reviewer" }, 400);
      }
    }

    const updated = await updateIntakeSubmission({
      id,
      status: parsed.data.status,
      expectedStatus: current.submission.status,
      actorId: gate.session.userId,
      reason: parsed.data.reason,
      assignedToId: parsed.data.assignedToId,
    });
    if (!updated) return json({ error: "Intake submission not found" }, 404);

    const { ipAddress, userAgent } = getRequestContext(request);
    await emitAuditLog({
      userId: gate.session.userId,
      action: "admin_action",
      resource: "intake_submission",
      resourceId: id,
      metadata: {
        publicId: updated.publicId,
        kind: updated.kind,
        fromStatus: current.submission.status,
        toStatus: updated.status,
        reason: parsed.data.reason,
        assignedToId:
          parsed.data.assignedToId === undefined
            ? current.submission.assignedToId
            : parsed.data.assignedToId,
      },
      ipAddress,
      userAgent,
    });

    return json({ ok: true, submission: updated });
  } catch (error) {
    if (error instanceof IntakeStoreUnavailableError) {
      return json({ error: error.message, code: "INTAKE_STORAGE_NOT_READY" }, 503);
    }
    if (error instanceof IntakeStatusConflictError) {
      return json(
        {
          error: error.message,
          code: "STALE_INTAKE_STATUS",
          currentStatus: error.currentStatus,
        },
        409,
      );
    }
    console.error("[PATCH /api/admin/intake/:id]", error);
    return json({ error: "Unable to update the intake submission" }, 500);
  }
}
