import { Hono } from "hono";
import { z } from "zod";
import type { Env, SessionPayload, UserRole } from "../types/env.js";
import { authMiddleware, getSession, requireRole } from "../middleware/auth.js";
import { emitAuditLog, getClientIp } from "../middleware/audit.js";

type HonoEnv = { Bindings: Env; Variables: { session: SessionPayload } };

const rbac = new Hono<HonoEnv>();

rbac.use("/*", authMiddleware);

const ROLE_HIERARCHY: Record<UserRole, number> = {
  client: 0,
  analyst: 1,
  admin: 2,
  super_admin: 3,
  internal: 4,
};

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  client: ["read:own_profile", "read:own_documents", "write:own_requests", "read:own_notifications"],
  analyst: [
    "read:own_profile", "read:own_documents", "write:own_requests", "read:own_notifications",
    "read:kyc_applications", "write:kyc_reviews", "read:service_requests",
  ],
  admin: [
    "read:own_profile", "read:own_documents", "write:own_requests", "read:own_notifications",
    "read:kyc_applications", "write:kyc_reviews", "read:service_requests",
    "read:all_users", "write:user_roles", "write:user_status", "read:audit_logs",
    "write:campaigns", "read:admin_stats",
  ],
  super_admin: [
    "read:own_profile", "read:own_documents", "write:own_requests", "read:own_notifications",
    "read:kyc_applications", "write:kyc_reviews", "read:service_requests",
    "read:all_users", "write:user_roles", "write:user_status", "read:audit_logs",
    "write:campaigns", "read:admin_stats",
    "write:system_config", "delete:users", "read:all_audit_logs",
  ],
  internal: [
    "read:own_profile", "read:own_documents", "write:own_requests", "read:own_notifications",
    "read:kyc_applications", "write:kyc_reviews", "read:service_requests",
    "read:all_users", "write:user_roles", "write:user_status", "read:audit_logs",
    "write:campaigns", "read:admin_stats",
    "write:system_config", "delete:users", "read:all_audit_logs",
    "write:internal_tools", "read:system_internals",
  ],
};

// GET /api/rbac/permissions — get permissions for current user
rbac.get("/permissions", (c) => {
  const session = getSession(c);
  const permissions = ROLE_PERMISSIONS[session.role] ?? [];

  return c.json({
    success: true,
    data: {
      userId: session.userId,
      role: session.role,
      roleLevel: ROLE_HIERARCHY[session.role],
      permissions,
    },
    timestamp: new Date().toISOString(),
  });
});

const checkPermissionSchema = z.object({
  permission: z.string().min(1),
});

// POST /api/rbac/check — check if current user has a specific permission
rbac.post("/check", async (c) => {
  const body = checkPermissionSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ success: false, error: "Invalid request body", timestamp: new Date().toISOString() }, 400);
  }

  const session = getSession(c);
  const permissions = ROLE_PERMISSIONS[session.role] ?? [];
  const hasPermission = permissions.includes(body.data.permission);

  return c.json({
    success: true,
    data: {
      userId: session.userId,
      role: session.role,
      permission: body.data.permission,
      granted: hasPermission,
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/rbac/roles — list all roles and their hierarchy (admin+)
rbac.get("/roles", requireRole("admin", "super_admin", "internal"), (c) => {
  const roles = Object.entries(ROLE_HIERARCHY).map(([role, level]) => ({
    role,
    level,
    permissions: ROLE_PERMISSIONS[role as UserRole],
  }));

  return c.json({
    success: true,
    data: { roles },
    timestamp: new Date().toISOString(),
  });
});

const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["client", "analyst", "admin"]),
});

// POST /api/rbac/assign — assign a role to a user (admin+, cannot escalate to super_admin/internal)
rbac.post("/assign", requireRole("admin", "super_admin", "internal"), async (c) => {
  const body = assignRoleSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({ success: false, error: "Invalid request body", timestamp: new Date().toISOString() }, 400);
  }

  const session = getSession(c);

  await emitAuditLog({
    db: c.env.DB,
    userId: session.userId,
    action: "role_change",
    resource: "user",
    resourceId: body.data.userId,
    metadata: { newRole: body.data.role, assignedBy: session.userId },
    ipAddress: getClientIp(c.req.raw),
    userAgent: c.req.header("User-Agent"),
  });

  return c.json({
    success: true,
    data: {
      userId: body.data.userId,
      newRole: body.data.role,
      assignedBy: session.userId,
    },
    timestamp: new Date().toISOString(),
  });
});

export { rbac };
