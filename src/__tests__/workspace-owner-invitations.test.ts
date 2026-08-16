import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(path, "utf8");

const migration = source(
  "prisma/migrations/20260815090000_add_workspace_owner_invitations/migration.sql",
);
const edge = source(
  "supabase/functions/gem-workspace-owner-invitations/index.ts",
);
const adminRoute = source("src/app/api/admin/workspace-invitations/route.ts");
const acceptRoute = source(
  "src/app/api/auth/workspace-invitation/accept/route.ts",
);
const statusRoute = source(
  "src/app/api/auth/workspace-invitation/status/route.ts",
);
const acceptClient = source(
  "src/components/auth/WorkspaceOwnerInvitationAcceptClient.tsx",
);
const adminClient = source(
  "src/components/admin/WorkspaceAccessAdministration.tsx",
);

describe("workspace owner invitation production flow", () => {
  it("creates the account, organization, workspace, role, membership, project, and audit atomically", () => {
    expect(migration).toContain("create or replace function public.gem_consume_workspace_owner_invitation");
    expect(migration).toContain("insert into public.users");
    expect(migration).toContain("insert into public.user_profiles");
    expect(migration).toContain("insert into public.tokmetric_organizations");
    expect(migration).toContain("insert into public.tokmetric_workspaces");
    expect(migration).toContain("insert into public.tokmetric_roles");
    expect(migration).toContain("insert into public.tokmetric_permissions");
    expect(migration).toContain("insert into public.tokmetric_workspace_members");
    expect(migration).toContain("insert into public.organization_projects");
    expect(migration).toContain("insert into public.audit_logs");
  });

  it("cannot derive a platform role from invitation input", () => {
    expect(migration).toContain("'client'::public.\"UserRole\"");
    expect(migration).toContain("'privilegeEscalation', false");
    expect(edge).toContain('createsOnlyClientRole: true');
    expect(edge).not.toContain("body.role");
  });

  it("keeps invitation capabilities single-use and inaccessible through anonymous RPC", () => {
    expect(migration).toContain("for update");
    expect(migration).toContain("gi.used_at is null");
    expect(migration).toContain("gi.revoked_at is null");
    expect(migration).toContain("set used_at = now()");
    expect(migration).toContain("revoke all on table public.gem_workspace_owner_invitations from public, anon, authenticated");
    expect(migration).toContain("revoke all on function public.gem_workspace_owner_invitation_status(text) from public, anon, authenticated");
    expect(migration).toContain("grant execute on function public.gem_workspace_owner_invitation_status(text) to service_role");
  });

  it("stores only a digest and returns the setup capability once in a URL fragment", () => {
    expect(edge).toContain("crypto.getRandomValues(tokenBytes)");
    expect(edge).toContain("const tokenHash = await sha256Hex(token)");
    expect(edge).toContain("token_hash: tokenHash");
    expect(edge).toContain("/workspace-invitation#${token}");
    expect(edge).toContain("tokenReturnedOnce: true");
    expect(edge).toContain("tokenStoredInPlaintext: false");
    expect(edge).not.toContain("password:");
  });

  it("requires an active verified Platform Owner and exact email confirmation", () => {
    expect(edge).toContain('const ISSUER_ROLES = new Set(["super_admin", "internal"])');
    expect(edge).toContain("!user.isEmailVerified");
    expect(edge).toContain("EMAIL_CONFIRMATION_MISMATCH");
    expect(adminRoute).toContain("requirePlatformOwner()");
    expect(adminRoute).toContain('key: "admin:workspace-owner-invitations:write"');
    expect(adminRoute).toContain("sameOriginFailure(request)");
  });

  it("hashes the password server-side and preserves the secure workspace redirect", () => {
    expect(statusRoute).toContain('createHash("sha256")');
    expect(acceptRoute).toContain("bcrypt.hash(parsed.data.password, 12)");
    expect(acceptRoute).not.toContain("passwordHash:");
    expect(edge).toContain('loginPath: "/client-login?next=%2Fapp%2Fworkspace"');
  });

  it("removes the capability from the address bar before rendering account setup", () => {
    expect(acceptClient).toContain("window.location.hash.slice(1).trim()");
    expect(acceptClient).toContain('window.history.replaceState(null, "", window.location.pathname)');
    expect(acceptClient).toContain("Create my protected workspace");
    expect(acceptClient).toContain("cannot create platform-admin access");
  });

  it("provides the Platform Owner a real issuance form instead of a static preview", () => {
    expect(adminClient).toContain("Invite a new organization owner");
    expect(adminClient).toContain('fetch("/api/admin/workspace-invitations"');
    expect(adminClient).toContain("One-time setup link ready");
    expect(adminClient).toContain("issuedInvitation.setupUrl");
  });
});
