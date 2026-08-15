import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canOpenProjectEnvironment, projectEnvironmentIds, projectEnvironments } from "@/lib/projectWorkspace";

const source = (path: string) => readFileSync(path, "utf8");

describe("project-centered workspace", () => {
  it("provides separate environments anchored to one project", () => {
    expect(projectEnvironmentIds).toEqual(["overview","production","development","marketing","sales","finance","team","client","services","tools","monitoring","admin"]);
    expect(new Set(projectEnvironments.map((item)=>item.id)).size).toBe(projectEnvironmentIds.length);
  });

  it("keeps project administration permission controlled", () => {
    const admin = projectEnvironments.find((item)=>item.id==="admin")!;
    expect(canOpenProjectEnvironment(admin, [{action:"view",scope:"workspace"}])).toBe(false);
    expect(canOpenProjectEnvironment(admin, [{action:"manage",scope:"projects"}])).toBe(true);
  });

  it("revalidates project access through active workspace membership", () => {
    const domain = source("src/lib/organizationWorkspace.ts");
    expect(domain).toContain("requireWorkspaceMembership(userId, project.workspaceId)");
    expect(domain).toContain('project.status === "ARCHIVED"');
  });

  it("uses a protected nested project route", () => {
    const page = source("src/app/app/workspace/projects/[projectId]/[[...environment]]/page.tsx");
    expect(page).toContain("requireSession()");
    expect(page).toContain("canOpenProjectEnvironment");
    expect(page).toContain("getOrganizationProjectWorkspace");
  });

  it("makes project cards open the project workspace", () => {
    const workspace = source("src/components/workspace/OrganizationWorkspaceOperatingSystem.tsx");
    expect(workspace).toContain("/app/workspace/projects/");
    expect(workspace).toContain("Open project workspace");
  });

  it("renders every environment as a Bentley-style full operations dashboard", () => {
    const shell = source("src/components/workspace/ProjectWorkspaceShell.tsx");
    expect(shell).toContain("Project activity and readiness");
    expect(shell).toContain("Project reporting feed");
    expect(shell).toContain("Workspace connection state");
    expect(shell).toContain("Quick actions");
    expect(shell).toContain("current.destinations");
  });

  it("uses authoritative project counts and reports rather than fabricated metrics", () => {
    const domain = source("src/lib/organizationWorkspace.ts");
    expect(domain).toContain('_count: { select: { updates: true } }');
    expect(domain).toContain('take: 6');
    expect(domain).toContain('members: true, connectors: true, approvalRequests: true');
  });

  it("routes the legacy dashboard into the workspace instead of showing unrelated sample metrics", () => {
    const dashboard = source("src/app/app/dashboard/page.tsx");
    expect(dashboard).toContain('redirect("/app/workspace")');
    expect(dashboard).not.toContain("$2,500,000");
  });

  it("explains the project-centered architecture on the public website", () => {
    const home = source("src/app/page.tsx");
    const showcase = source("src/components/home/ProjectWorkspaceShowcase.tsx");
    expect(home).toContain("<ProjectWorkspaceShowcase />");
    for (const label of ["Production","Development","Marketing","Sales","Finance","Team","Client hub","Tools","Monitoring","Administration"]) {
      expect(showcase).toContain(`label: "${label}"`);
    }
    expect(showcase).toContain("Governance loop:");
  });

  it("gives super admins an explicit access and reporting governance loop", () => {
    const admin = source("src/app/app/admin/page.tsx");
    expect(admin).toContain('viewerRole === "super_admin"');
    expect(admin).toContain('/app/admin/workspace-access');
    expect(admin).toContain('/app/admin/organization-reports');
    expect(admin).toContain("oversight does not silently impersonate a client");
  });
});
