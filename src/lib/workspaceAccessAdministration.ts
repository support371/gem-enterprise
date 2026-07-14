export {
  workspacePermissionCatalog,
  normalizeWorkspacePermissions,
  type WorkspacePermissionCatalogItem,
  type WorkspacePermissionKey,
} from "@/lib/workspace-access-admin/catalog";
export {
  WorkspaceAdministrationError,
  type WorkspaceAdministrationContext,
} from "@/lib/workspace-access-admin/errors";
export {
  getWorkspaceAdministrationSnapshot,
  type WorkspaceAdministrationSnapshot,
} from "@/lib/workspace-access-admin/snapshot";
export {
  createWorkspaceRole,
  assignWorkspaceMembership,
  updateWorkspaceMembership,
} from "@/lib/workspace-access-admin/mutations";
