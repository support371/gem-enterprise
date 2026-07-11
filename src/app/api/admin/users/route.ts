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
import {
  getAssignableRolesForActor,
  validateReviewerRoleChange,
} from "@/lib/reviewer-role-policy";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

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
    return json({
      users,
      viewerRole: gate.session.role,
      rolePolicy: {
        assignableRoles: getAssignableRolesForActor(gate.session.role),
        requiresReason: true,
        requiresTargetEmailConfirmation: true,
        requiresReauthentication: true,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return serverError();
  }
}

const patchSchema = z
  .object({
    id: z.string().min(1, "User ID is required"),
    role: z.enum(["client", "analyst", "admin"]).optional(),
    isActive: z.boolean().optional(),
    status: z.enum(["active", "suspended", "pending_approval"]).optional(),
    reason: z.string().trim().min(10).max(500),
    confirmEmail: z.string().email().max(254).optional(),
  })
  .refine(
    (value) =>
      value.role !== undefined ||
      value.isActive !== undefined ||
      value.status !== undefined,
    { message: "At least one account field must be provided" },
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

  const { id, role, isActive, status, reason, confirmEmail } = parsed.data;
  const { ipAddress, userAgent } = getRequestContext(req);

  try {
    const target = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        status: true,
        isEmailVerified: true,
      },
    });
    if (!target) return badRequest("User not found");

    if (role !== undefined) {
      const policy = validateReviewerRoleChange({
        actorId: session.userId,
        actorRole: session.role,
        target,
        requestedRole: role,
        confirmEmail,
        reason,
      });
      if (!policy.ok) {
        return json(
          { error: policy.message, code: policy.code },
          policy.statusCode,
        );
      }
    }

    if (
      ["super_admin", "internal"].includes(target.role) &&
      session.role === "admin" &&
      (isActive !== undefined || status !== undefined)
    ) {
      return forbidden("Insufficient permissions to modify this account");
    }

    if (
      target.id === session.userId &&
      (isActive === false || status === "suspended")
    ) {
      return forbidden("You cannot suspend your own account");
    }

    const data: {
      role?: "client" | "analyst" | "admin";
      isActive?: boolean;
      status?: "active" | "suspended" | "pending_approval";
    } = {};
    if (role !== undefined && role !== target.role) data.role = role;
    if (isActive !== undefined && isActive !== target.isActive) {
      data.isActive = isActive;
    }
    if (status !== undefined && status !== target.status) data.status = status;

    if (Object.keys(data).length === 0) {
      return badRequest("The requested update does not change the account.");
    }

    const updated = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        isEmailVerified: true,
        updatedAt: true,
      },
    });

    if (data.role !== undefined) {
      await emitAuditLog({
        userId: session.userId,
        action: "role_change",
        resource: "user",
        resourceId: target.id,
        metadata: {
          targetEmail: target.email,
          previousRole: target.role,
          newRole: data.role,
          reason,
          targetMustReauthenticate: true,
        },
        ipAddress,
        userAgent,
      });
    }

    if (data.isActive !== undefined || data.status !== undefined) {
      await emitAuditLog({
        userId: session.userId,
        action: "admin_action",
        resource: "user",
        resourceId: target.id,
        metadata: {
          targetEmail: target.email,
          previousIsActive: target.isActive,
          newIsActive: data.isActive,
          previousStatus: target.status,
          newStatus: data.status,
          reason,
        },
        ipAddress,
        userAgent,
      });
    }

    return json({
      ok: true,
      user: updated,
      reauthenticationRequired: data.role !== undefined,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/users]", error);
    return serverError();
  }
}
