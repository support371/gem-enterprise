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

export function normalizeWorkspacePermissions(
  permissions: Array<{ action: string; scope: string }>,
): Array<{ action: string; scope: string }> {
  const unique = new Map<string, { action: string; scope: string }>();

  for (const permission of permissions) {
    const normalized = {
      action: permission.action.trim().toLowerCase(),
      scope: permission.scope.trim().toLowerCase(),
    };
    const key = `${normalized.scope}:${normalized.action}` as WorkspacePermissionKey;
    if (!allowedPermissionKeys.has(key)) {
      throw new Error(`PERMISSION_NOT_ALLOWED:${key}`);
    }
    unique.set(key, normalized);
  }

  if (unique.size === 0) throw new Error("PERMISSION_REQUIRED");

  return [...unique.values()].sort((left, right) =>
    `${left.scope}:${left.action}`.localeCompare(`${right.scope}:${right.action}`),
  );
}
