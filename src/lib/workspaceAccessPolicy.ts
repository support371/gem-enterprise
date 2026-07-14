export const workspaceAccessPolicy = {
  authority: "active_workspace_membership",
  requireActiveAccount: true,
  requireActiveMembership: true,
  requireActiveOrganization: true,
  requestedWorkspaceLookup: "accessible_membership_set_only",
  platformOwnerMembershipBypass: false,
  clientImpersonationAllowed: false,
  syntheticPreviewPath: "/app/admin/plan-workspaces",
  syntheticPreviewMayReadRealClientData: false,
  databaseMigrationIncluded: false,
  billingActivationIncluded: false,
} as const;
