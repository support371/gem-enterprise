import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import {
  requireAdmin,
  getRequestContext,
  badRequest,
  serverError,
  forbidden,
} from "@/lib/api/auth-helpers";

// ─── GET /api/admin/users ─────────────────────────────────────────────────────

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        organizationId: true,
        lastLoginAt: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
            entityType: true,
            country: true,
          },
        },
      },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return serverError();
  }
}

// ─── PATCH /api/admin/users ───────────────────────────────────────────────────
//
// Per AGENTS.md rule 7: super_admin and internal roles are NEVER assignable
// via API. They can only be set in DB by an out-of-band operator. The schema
// keeps them read-only here so a compromised admin cannot self-escalate.

const ASSIGNABLE_ROLES = ["client", "analyst", "admin"] as const;

const patchSchema = z
  .object({
    id: z.string().min(1, "User ID is required"),
    role: z.enum(ASSIGNABLE_ROLES).optional(),
    isActive: z.boolean().optional(),
    status: z.enum(["active", "suspended", "pending_approval"]).optional(),
  })
  .refine(
    (v) => v.role !== undefined || v.isActive !== undefined || v.status !== undefined,
    { message: "At least one field (role, isActive, status) must be provided" },
  );

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const session = gate.session;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  const { id, role, isActive, status } = parsed.data;
  const { ipAddress, userAgent } = getRequestContext(req);

  try {
    const target = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true, status: true },
    });
    if (!target) return badRequest("User not found");

    // Guardrails:
    //   • An admin cannot demote a super_admin/internal user (only those roles
    //     can manage their peers).
    //   • An admin cannot suspend or modify themselves through this endpoint.
    if (
      (target.role === "super_admin" || target.role === "internal") &&
      session.role === "admin"
    ) {
      return forbidden("Insufficient permissions to modify this account");
    }
    if (target.id === session.userId && (isActive === false || status === "suspended")) {
      return forbidden("You cannot suspend your own account");
    }

    const data: {
      role?: (typeof ASSIGNABLE_ROLES)[number];
      isActive?: boolean;
      status?: "active" | "suspended" | "pending_approval";
    } = {};
    if (role !== undefined) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;
    if (status !== undefined) data.status = status;

    const updated = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        updatedAt: true,
      },
    });

    if (role !== undefined && role !== target.role) {
      await emitAuditLog({
        userId: session.userId,
        action: "role_change",
        resource: "user",
        resourceId: target.id,
        metadata: {
          targetEmail: target.email,
          previousRole: target.role,
          newRole: role,
        },
        ipAddress,
        userAgent,
      });
    }

    if (
      (isActive !== undefined && isActive !== target.isActive) ||
      (status !== undefined && status !== target.status)
    ) {
      await emitAuditLog({
        userId: session.userId,
        action: "admin_action",
        resource: "user",
        resourceId: target.id,
        metadata: {
          targetEmail: target.email,
          previousIsActive: target.isActive,
          newIsActive: isActive,
          previousStatus: target.status,
          newStatus: status,
        },
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/users]", error);
    return serverError();
  }
}
