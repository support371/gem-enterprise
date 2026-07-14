import { db } from "@/lib/db";
import { workspacePermissionCatalog } from "@/lib/workspace-access-admin/catalog";

export async function getWorkspaceAdministrationSnapshot() {
  const [organizations, users, roles] = await Promise.all([
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
    db.role.findMany({
      where: { workspaceId: { not: null } },
      orderBy: [{ workspaceId: "asc" }, { name: "asc" }],
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
        _count: { select: { members: true } },
      },
    }),
  ]);

  const rolesByWorkspace = new Map<string, typeof roles>();
  for (const role of roles) {
    if (!role.workspaceId) continue;
    const existing = rolesByWorkspace.get(role.workspaceId) ?? [];
    existing.push(role);
    rolesByWorkspace.set(role.workspaceId, existing);
  }

  return {
    permissionCatalog: workspacePermissionCatalog,
    organizations: organizations.map((organization) => ({
      ...organization,
      workspaces: organization.workspaces.map((workspace) => ({
        ...workspace,
        roles: (rolesByWorkspace.get(workspace.id) ?? []).map((role) => ({
          ...role,
          createdAt: role.createdAt.toISOString(),
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

export type WorkspaceAdministrationSnapshot = Awaited<
  ReturnType<typeof getWorkspaceAdministrationSnapshot>
>;
