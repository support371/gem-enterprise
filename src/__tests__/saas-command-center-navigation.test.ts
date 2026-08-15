import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  commandCenterNavigationGroups,
  commandCenterSections,
  isCommandCenterSection,
} from "@/lib/commandCenter";
import {
  commandCenterRoleDirections,
  commandCenterWorkspaces,
  getCommandCenterWorkspace,
} from "@/lib/commandCenterNavigation";
import { clientPortalNavGroups } from "@/lib/platformNavigation";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("role-directed SaaS command-center navigation", () => {
  it("provides dedicated pages for the requested operating functions", () => {
    for (const section of [
      "development",
      "marketing",
      "sales",
      "monitoring",
      "teams",
      "support",
      "agents",
      "integrations",
    ] as const) {
      expect(commandCenterSections[section]).toBeDefined();
      expect(isCommandCenterSection(section)).toBe(true);
    }
    expect(isCommandCenterSection("overview")).toBe(false);
    expect(isCommandCenterSection("unknown")).toBe(false);
  });

  it("groups every command-center section exactly once", () => {
    const groupedSections = commandCenterNavigationGroups.flatMap((group) => group.sections);
    expect(new Set(groupedSections).size).toBe(groupedSections.length);
    expect(new Set(groupedSections)).toEqual(new Set(Object.keys(commandCenterSections)));
  });

  it("gives clients, teams, and administrators different starting directions", () => {
    expect(commandCenterRoleDirections.map((item) => item.role)).toEqual([
      "Clients & organization owners",
      "Internal teams",
      "Admins & super admins",
    ]);
    expect(commandCenterRoleDirections.map((item) => item.startHref)).toEqual([
      "/app/workspace",
      "/app/command-center/teams",
      "/app/command-center",
    ]);
  });

  it("connects each new workspace to real existing platform destinations", () => {
    expect(commandCenterWorkspaces).toHaveLength(6);
    for (const workspace of commandCenterWorkspaces) {
      expect(workspace.destinations.length).toBeGreaterThanOrEqual(3);
      expect(workspace.destinations.every((item) => item.href.startsWith("/"))).toBe(true);
      expect(getCommandCenterWorkspace(workspace.section)).toEqual(workspace);
    }
  });

  it("uses a directory on overview and moves live monitoring to its dedicated page", () => {
    const overview = source("src/app/app/command-center/page.tsx");
    const view = source("src/components/command-center/CommandCenterView.tsx");
    const focused = source("src/components/command-center/FocusedOperationsWorkspace.tsx");
    expect(overview).not.toContain("LiveCommandCenterSnapshot");
    expect(view).toContain("<CommandCenterDirectory />");
    expect(view).toContain('id="command-center-page"');
    expect(focused).toContain('section === "monitoring"');
    expect(focused).toContain("<LiveCommandCenterSnapshot />");
  });

  it("keeps the global command-center menu compact", () => {
    const group = clientPortalNavGroups.find((item) => item.label === "Command Center");
    expect(group).toBeDefined();
    expect(group?.items).toHaveLength(6);
    expect(group?.items.map((item) => item.href)).toEqual([
      "/app/command-center",
      "/app/command-center/development",
      "/app/command-center/tokmetric",
      "/app/command-center/monitoring",
      "/app/command-center/agents",
      "/app/command-center/integrations",
    ]);
  });

  it("keeps command-center routes protected and navigation non-authoritative", () => {
    const proxy = source("src/proxy.ts");
    const focused = source("src/components/command-center/FocusedOperationsWorkspace.tsx");
    expect(proxy).toContain('"/app/command-center"');
    expect(focused).toContain("Pages guide users to existing controlled workflows");
    expect(focused).not.toMatch(/setRole|updateRole|grantEntitlement|createSession/);
  });
});
