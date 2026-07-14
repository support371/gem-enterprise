import { db } from "@/lib/db";

export const workspacePermissionCatalog = [
  {
    action: "view",
    scope: "workspace",
    label: "View workspace",
    description: "See workspace identity, membership role, safety controls, and aggregate state.",
  },
  {
    action: "view",
    scope: "members",
    label: "View members",
    description: "See workspace membership identities and role labels.",
  },
  {
    action: "view",
    scope: "requests",
    label: "View requests",
    description: "See workspace-scoped service request records.",
  },
  {
    action: "manage",
    scope: "requests",
    label: "Manage requests",
    description: "Update workspace-scoped request workflow state where separately authorized.",
  },
  {
    action: "view",
    scope: "documents",
    label: "View documents",
    description: "See workspace-scoped document metadata where separately authorized.",
  },
  {
    action: "view",
    scope: "support",
    label: "View support",
    description: "See workspace-scoped support records.",
  },
  {
    action: "manage",
    scope: "support",
    label: "Manage support",
    description: "Update workspace-scoped support workflow state where separately authorized.",
  },
  {
    action: "view",
    scope: "approvals",
    label: "View approvals",
    description: "See approval records without granting decision authority.",
  },
] as const;

export type WorkspacePermissionCatalogItem = (typeof workspacePermissionCatalog)[number];
export type WorkspacePermissionKey = `${WorkspacePermissionCatalogItem["scope"]}:${WorkspacePermissionCatalogItem["action"]}`;

const allowedPermissionKeys = new Set<WorkspacePermissionKey>(
  workspacePermissionCatalog.map(
    (permission) => `${permission.scope}:${permission.action}` as WorkspacePermissionKey,
  ),
);

export type WorkspaceAdministrationContext = {
  actorUserId: string;
  ipAddress: string;
  userAgent: string;
};

export class WorkspaceAdministrationError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "WorkspaceAdministrationError";
  }
}

function conflict(message: string, code: string): never {
  throw new WorkspaceAdministrationError(message, 409, code);
}

function invalid(message: string, code: string): never {
  throw new WorkspaceAdministrationError(message, 400, code);
}

function missing(message: string, code: string): never {
  throw new WorkspaceAdministrationError(message, 404, code);
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeRoleName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function permissionKey(permission: { action: string; scope: string }): string {
  return `${permission.scope}:${permission.action}`;
}

function validatePermissions(permissions: Array<{ action: string; scope: string }>) {
  const unique = new Map<string, { action: string; scope: string }>();

  for (const permission of permissions) {
    const normalized = {
      action: permission.action.trim().toLowerCase(),
      scope: permission.scope.trim().toLowerCase(),
    };
    const key = permissionKey(normalized) as WorkspacePermissionKey;
    if (!allowedPermissionKeys.has(key)) {
      invalid(`Permission ${key} is not available in the controlled workspace catalog.`, "PERMISSION_NOT_ALLOWED");
    }
    unique.set(key, normalized);
  }

  if (unique.size === 0) {
    invalid("Select at least one controlled workspace permission.", "PERMISSION_REQUIRED");
  }

  return [...unique.values()].sort((left, right) =>
    permissionKey(left).localeCompare(permissionKey(right)),
  );
}

export async function getWorkspaceAdministrationSnapshot() {
  const [organizations, users] = await Promise.all([
    db.organization.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        workspaces: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            globalEmergencyLock: true,
            publishingDisabled: true,
            advertisingDisabled: true,
            shopWriteDisabled: true,
            connectorDisabled: true,
            roles: {
              orderBy: { name: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                updatedAt: true,
                permissions: {
                  orderBy: [{ scope: "asc" }, { action: "asc" }],
                  select: { id: true, action: true, scope: true },
                },
                _count: { select: { members: true } },
              },
            },
            members: {
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    isActive: true,
                    profile: {
                      select: { displayName: true, firstName: true, lastName: true },
                    },
                  },
                },
                role: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    }),
    db.user.findMany({
      where: { status: "active", isActive: true },
      orderBy: { email: "asc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        profile: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
    }),
  ]);

  return {
    permissionCatalog: workspacePermissionCatalog,
    organizations: organizations.map((organization) => ({
      ...organization,
      workspaces: organization.workspaces.map((workspace) => ({
        ...workspace,
        roles: workspace.roles.map((role) => ({
          ...role,
          updatedAt: role.updatedAt.toISOString(),
        })),
        members: workspace.members.map((membership) => ({
          ...membership,
          createdAt: membership.createdAt.toISOString(),
          updatedAt: membership.updatedAt.toISOString(),
        })),
      })),
    })),
    users,
  };
}

export async function createWorkspaceRole(
  input: {
    workspaceId: string;
    confirmWorkspaceSlug: string;
    name: string;
    description?: string | null;
    permissions: Array<{ action: string; scope: string }>;
    reason: string;
  },
  context: WorkspaceAdministrationContext,
) {
  const name = normalizeRoleName(input.name);
  const permissions = validatePermissions(input.permissions);

  return db.$transaction(async (tx) => {
    const workspace = await tx.workspace.findUnique({
      where: { id: input.workspaceId },
      select: {
        id: true,
        name: true,
        slug: true,
        organization: { select: { id: true, name: true, status: true } },
      },
    });
    if (!workspace || workspace.organization.status !== "active") {
      missing("The selected active workspace was not found.", "WORKSPACE_NOT_FOUND");
    }
    if (input.confirmWorkspaceSlug.trim() !== workspace.slug) {
      invalid("Workspace slug confirmation does not match.", "WORKSPACE_CONFIRMATION_MISMATCH");
    }

    const existing = await tx.role.findUnique({
      where: { workspaceId_name: { workspaceId: workspace.id, name } },
      select: { id: true },
    });
    if (existing) conflict("A role with that name already exists in this workspace.", "ROLE_EXISTS");

    const role = await tx.role.create({
      data: {
        workspaceId: workspace.id,
        name,
        description: input.description?.trim() || null,
        permissions: { create: permissions },
      },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          orderBy: [{ scope: "asc" }, { action: "asc" }],
          select: { id: true, action: true, scope: true },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        userId: context.actorUserId,
        action: "admin_action",
        resource: "workspace_role",
        resourceId: role.id,
        metadata: {
          operation: "workspace_role_created",
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          organizationId: workspace.organization.id,
          organizationName: workspace.organization.name,
          roleName: role.name,
          permissions: role.permissions.map(({ action, scope }) => ({ action, scope })),
          reason: input.reason.trim(),
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });

    return {
      ...role,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  });
}

export async function assignWorkspaceMembership(
  input: {
    workspaceId: string;
    confirmWorkspaceSlug: string;
    userId: string;
    confirmEmail: string;
    roleId: string;
    reason: string;
  },
  context: WorkspaceAdministrationContext,
) {
  return db.$transaction(async (tx) => {
    const workspace = await tx.workspace.findUnique({
      where: { id: input.workspaceId },
      select: {
        id: true,
        name: true,
        slug: true,
        organization: { select: { id: true, name: true, status: true } },
      },
    });
    if (!workspace || workspace.organization.status !== "active") {
      missing("The selected active workspace was not found.", "WORKSPACE_NOT_FOUND");
    }
    if (input.confirmWorkspaceSlug.trim() !== workspace.slug) {
      invalid("Workspace slug confirmation does not match.", "WORKSPACE_CONFIRMATION_MISMATCH");
    }

    const [user, role, existing] = await Promise.all([
      tx.user.findUnique({
        where: { id: input.userId },
        select: { id: true, email: true, role: true, status: true, isActive: true },
      }),
      tx.role.findUnique({
        where: { id: input.roleId },
        select: { id: true, workspaceId: true, name: true },
      }),
      tx.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId: workspace.id, userId: input.userId },
        },
        select: { id: true, status: true, updatedAt: true },
      }),
    ]);

    if (!user || !user.isActive || user.status !== "active") {
      missing("The selected active user was not found.", "USER_NOT_ACTIVE");
    }
    if (normalizeEmail(input.confirmEmail) !== normalizeEmail(user.email)) {
      invalid("Target email confirmation does not match.", "EMAIL_CONFIRMATION_MISMATCH");
    }
    if (!role || role.workspaceId !== workspace.id) {
      invalid("The selected role does not belong to this workspace.", "ROLE_WORKSPACE_MISMATCH");
    }
    if (existing) {
      conflict(
        "This user already has a workspace membership. Use the controlled update workflow instead.",
        "MEMBERSHIP_EXISTS",
      );
    }

    const membership = await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        roleId: role.id,
        status: "active",
      },
      select: {
        id: true,
        workspaceId: true,
        userId: true,
        roleId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: context.actorUserId,
        action: "admin_action",
        resource: "workspace_membership",
        resourceId: membership.id,
        metadata: {
          operation: "workspace_membership_assigned",
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          organizationId: workspace.organization.id,
          organizationName: workspace.organization.name,
          targetUserId: user.id,
          targetEmail: user.email,
          accountRole: user.role,
          workspaceRoleId: role.id,
          workspaceRoleName: role.name,
          newStatus: membership.status,
          reason: input.reason.trim(),
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });

    return {
      ...membership,
      createdAt: membership.createdAt.toISOString(),
      updatedAt: membership.updatedAt.toISOString(),
    };
  });
}

export async function updateWorkspaceMembership(
  input: {
    membershipId: string;
    expectedUpdatedAt: string;
    confirmEmail: string;
    roleId?: string;
    status?: "active" | "suspended";
    reason: string;
  },
  context: WorkspaceAdministrationContext,
) {
  const expectedUpdatedAt = new Date(input.expectedUpdatedAt);
  if (Number.isNaN(expectedUpdatedAt.getTime())) {
    invalid("The expected membership version is invalid.", "MEMBERSHIP_VERSION_INVALID");
  }

  return db.$transaction(async (tx) => {
    const current = await tx.workspaceMember.findUnique({
      where: { id: input.membershipId },
      select: {
        id: true,
        workspaceId: true,
        userId: true,
        roleId: true,
        status: true,
        updatedAt: true,
        user: { select: { email: true, role: true, status: true, isActive: true } },
        role: { select: { id: true, name: true } },
        workspace: {
          select: {
            name: true,
            organization: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });
    if (!current || current.workspace.organization.status !== "active") {
      missing("The selected active membership was not found.", "MEMBERSHIP_NOT_FOUND");
    }
    if (normalizeEmail(input.confirmEmail) !== normalizeEmail(current.user.email)) {
      invalid("Target email confirmation does not match.", "EMAIL_CONFIRMATION_MISMATCH");
    }

    let nextRole = current.role;
    if (input.roleId) {
      nextRole = await tx.role.findUnique({
        where: { id: input.roleId },
        select: { id: true, name: true, workspaceId: true },
      });
      if (!nextRole || nextRole.workspaceId !== current.workspaceId) {
        invalid("The selected role does not belong to this workspace.", "ROLE_WORKSPACE_MISMATCH");
      }
    }

    const nextStatus = input.status ?? current.status;
    const nextRoleId = input.roleId ?? current.roleId;
    if (nextStatus === current.status && nextRoleId === current.roleId) {
      invalid("No membership change was requested.", "NO_MEMBERSHIP_CHANGE");
    }

    const changed = await tx.workspaceMember.updateMany({
      where: { id: current.id, updatedAt: expectedUpdatedAt },
      data: { status: nextStatus, roleId: nextRoleId },
    });
    if (changed.count !== 1) {
      conflict(
        "The membership changed after this page was loaded. Refresh before applying another update.",
        "MEMBERSHIP_VERSION_CONFLICT",
      );
    }

    const updated = await tx.workspaceMember.findUniqueOrThrow({
      where: { id: current.id },
      select: {
        id: true,
        workspaceId: true,
        userId: true,
        roleId: true,
        status: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: context.actorUserId,
        action: "admin_action",
        resource: "workspace_membership",
        resourceId: current.id,
        metadata: {
          operation: "workspace_membership_updated",
          workspaceId: current.workspaceId,
          workspaceName: current.workspace.name,
          organizationId: current.workspace.organization.id,
          organizationName: current.workspace.organization.name,
          targetUserId: current.userId,
          targetEmail: current.user.email,
          accountRole: current.user.role,
          previous: {
            status: current.status,
            roleId: current.roleId,
            roleName: current.role?.name ?? null,
            updatedAt: current.updatedAt.toISOString(),
          },
          next: {
            status: updated.status,
            roleId: updated.roleId,
            roleName: nextRole?.name ?? null,
            updatedAt: updated.updatedAt.toISOString(),
          },
          reason: input.reason.trim(),
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });

    return { ...updated, updatedAt: updated.updatedAt.toISOString() };
  });
}
