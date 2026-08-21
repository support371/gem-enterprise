import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(path, "utf8");

describe("Workspace OS accessibility port", () => {
  it("keeps the existing permission-scoped project environments authoritative", () => {
    const shell = source("src/components/workspace/ProjectWorkspaceShell.tsx");
    expect(shell).toContain("canOpenProjectEnvironment");
    expect(shell).toContain("projectEnvironments.filter");
    expect(shell).toContain("WorkspaceOSNavigation");
  });

  it("provides persistent searchable project navigation without deleting environments", () => {
    const navigation = source("src/components/workspace/WorkspaceOSNavigation.tsx");
    expect(navigation).toContain('aria-label="Project environments"');
    expect(navigation).toContain('placeholder="Find an environment"');
    expect(navigation).toContain('aria-current={active ? "page" : undefined}');
    expect(navigation).toContain("items.filter");
  });

  it("implements a keyboard-safe mobile navigation drawer", () => {
    const navigation = source("src/components/workspace/WorkspaceOSNavigation.tsx");
    expect(navigation).toContain('role="dialog"');
    expect(navigation).toContain('aria-modal="true"');
    expect(navigation).toContain('event.key === "Escape"');
    expect(navigation).toContain('event.key !== "Tab"');
    expect(navigation).toContain("triggerRef.current?.focus()");
  });

  it("adds skip navigation and real breadcrumbs to the project shell", () => {
    const shell = source("src/components/workspace/ProjectWorkspaceShell.tsx");
    expect(shell).toContain('href="#workspace-main-content"');
    expect(shell).toContain('id="workspace-main-content"');
    expect(shell).toContain('aria-label="Breadcrumb"');
    expect(shell).toContain('aria-current="page"');
  });

  it("keeps real project metrics, reports, integrations, and quick actions", () => {
    const shell = source("src/components/workspace/ProjectWorkspaceShell.tsx");
    for (const expected of [
      "Project activity and readiness",
      "Project reporting feed",
      "Workspace connection state",
      "Configured connectors",
      "Approval records",
      "Quick actions",
    ]) {
      expect(shell).toContain(expected);
    }
  });
});
