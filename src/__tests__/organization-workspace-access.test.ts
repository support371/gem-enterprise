import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { workspaceAccessPolicy } from "@/lib/workspaceAccessPolicy";

const source = (path: string) => readFileSync(path, "utf8");

const accessSource = source("src/lib/workspaceAccess.ts");
const routeSource = source("src/app/api/workspaces/route.ts");
const pageSource = source("src/app/app/workspace/page.tsx");
const ownerPreviewPageSource = source("src/app/app/admin/plan-workspaces/page.tsx");

describe("organization-scoped workspace access", () => {
  it("uses active membership as the authoritative access edge", () => {
    expect(accessSource).toContain("db.workspaceMember.findMany");
    expect(accessSource).toContain("userId: normalizedUserId");
    expect(accessSource).toContain('status: "active"');
    expect(accessSource).toContain('organization.status === "active"');
    expect(accessSource).not.toContain("db.workspace.findUnique");
    expect(accessSource).not.toContain("db.workspace.findFirst");
    expect(workspaceAccessPolicy.authority).toBe("active_workspace_membership");
  });

  it("revalidates a requested workspace against the accessible membership list", () => {
    expect(accessSource).toContain(
      "workspaces.find((workspace) => workspace.id === normalizedWorkspaceId)",
    );
    expect(accessSource).toContain("requestedDenied");
    expect(routeSource).toContain("WORKSPACE_ACCESS_DENIED");
    expect(pageSource).toContain("resolution.requestedDenied");
    expect(workspaceAccessPolicy.requestedWorkspaceLookup).toBe(
      "accessible_membership_set_only",
    );
  });

  it("protects the workspace API with authoritative session and account state", () => {
    expect(routeSource).toContain("requireSession()");
    expect(routeSource).toContain('gate.accountStatus !== "active"');
    expect(routeSource).toContain('"Cache-Control": "no-store"');
    expect(routeSource).not.toContain("requirePlatformOwner");
    expect(workspaceAccessPolicy.requireActiveAccount).toBe(true);
  });

  it("removes dated sample tasks from the real workspace route", () => {
    expect(pageSource).toContain("resolveWorkspaceAccess");
    expect(pageSource).toContain("No active workspace assignment");
    expect(pageSource).toContain("Membership scoped");
    expect(pageSource).not.toContain("Upload Q1 financial statements");
    expect(pageSource).not.toContain("Mar 25, 2026");
    expect(pageSource).not.toContain("KYC renewal — annual identity verification");
  });

  it("keeps synthetic plan previews separate and owner-only", () => {
    expect(pageSource).toContain('href="/app/admin/plan-workspaces"');
    expect(ownerPreviewPageSource).toContain("requirePlatformOwner()");
    expect(ownerPreviewPageSource).toContain("planWorkspaceCatalog");
    expect(pageSource).toContain("does not use the");
    expect(pageSource).toContain("synthetic Basic, Professional, or Enterprise preview records");
    expect(workspaceAccessPolicy.platformOwnerMembershipBypass).toBe(false);
    expect(workspaceAccessPolicy.syntheticPreviewMayReadRealClientData).toBe(false);
  });

  it("excludes migration, billing activation, and client impersonation", () => {
    expect(workspaceAccessPolicy.databaseMigrationIncluded).toBe(false);
    expect(workspaceAccessPolicy.billingActivationIncluded).toBe(false);
    expect(workspaceAccessPolicy.clientImpersonationAllowed).toBe(false);
  });
});
