import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(path, "utf8");

describe("Workspace OS command layer", () => {
  it("adds keyboard-accessible command discovery without replacing project navigation", () => {
    const commandLayer = source("src/components/workspace/WorkspaceOSCommandLayer.tsx");
    const shell = source("src/components/workspace/ProjectWorkspaceShell.tsx");

    expect(shell).toContain("WorkspaceOSNavigation");
    expect(shell).toContain("WorkspaceOSCommandLayer");
    expect(commandLayer).toContain('event.key === "/"');
    expect(commandLayer).toContain('event.key.toLowerCase() === "k"');
    expect(commandLayer).toContain('aria-haspopup="dialog"');
    expect(commandLayer).toContain('placeholder="Search environments, integrations, video, news, support…"');
  });

  it("keeps command results inside existing governed GEM routes", () => {
    const commandLayer = source("src/components/workspace/WorkspaceOSCommandLayer.tsx");

    expect(commandLayer).toContain('/app/command-center/integrations');
    expect(commandLayer).toContain('/app/social-media/video');
    expect(commandLayer).toContain('/intel/news');
    expect(commandLayer).toContain('/app/support');
    expect(commandLayer).toContain('This search does not grant new permissions.');
  });

  it("preserves workspace and project context on governed platform shortcuts", () => {
    const commandLayer = source("src/components/workspace/WorkspaceOSCommandLayer.tsx");

    expect(commandLayer).toContain('workspace=${encodeURIComponent(workspaceId)}');
    expect(commandLayer).toContain('project=${encodeURIComponent(projectId)}');
    expect(commandLayer).toContain('role="status" aria-live="polite"');
  });
});
