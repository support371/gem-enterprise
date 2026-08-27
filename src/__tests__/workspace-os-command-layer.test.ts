import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(path, "utf8");

describe("Workspace OS command layer", () => {
  it("adds keyboard-accessible command discovery without replacing project navigation", () => {
    const commandLayer = source("src/components/workspace/WorkspaceOSCommandLayer.tsx");
    const shell = source("src/components/workspace/ProjectWorkspaceShell.tsx");

    expect(shell).toContain("WorkspaceOSNavigation");
    expect(shell).toContain("WorkspaceOSCommandLayer");
    expect(shell).toContain("const available = projectEnvironments.filter");
    expect(shell).toContain("const navItems = available.map");
    expect(commandLayer).toContain('event.key === "/"');
    expect(commandLayer).toContain('event.key.toLowerCase() === "k"');
    expect(commandLayer).toContain('aria-haspopup="dialog"');
    expect(commandLayer).toContain('placeholder="Search environments, integrations, video, news, support…"');
  });

  it("keeps command results inside existing governed GEM routes", () => {
    const commandLayer = source("src/components/workspace/WorkspaceOSCommandLayer.tsx");

    expect(commandLayer).toContain('/app/command-center/integrations');
    expect(commandLayer).toContain('/app/social-media/video');
    expect(commandLayer).toContain('/app/command-center/integrations/news');
    expect(commandLayer).toContain('/app/support');
    expect(commandLayer).not.toContain('appendScope("/intel/news"');
    expect(commandLayer).toContain('This search does not grant new permissions.');
  });

  it("preserves workspace and project context on governed platform shortcuts", () => {
    const commandLayer = source("src/components/workspace/WorkspaceOSCommandLayer.tsx");

    expect(commandLayer).toContain('workspace=${encodeURIComponent(workspaceId)}');
    expect(commandLayer).toContain('project=${encodeURIComponent(projectId)}');
    expect(commandLayer).toContain('role="status" aria-live="polite"');
  });

  it("adds the existing theme control with pressed-state semantics", () => {
    const commandLayer = source("src/components/workspace/WorkspaceOSCommandLayer.tsx");
    const themeToggle = source("src/components/ThemeToggle.tsx");

    expect(commandLayer).toContain("ThemeToggle");
    expect(themeToggle).toContain("aria-pressed={dark}");
    expect(themeToggle).toContain("Dark theme active");
    expect(themeToggle).toContain("Light theme active");
  });
});
