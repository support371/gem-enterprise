import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const navigation = readFileSync("src/components/workspace/WorkspaceOSNavigation.tsx", "utf8");

describe("Workspace OS grouped navigation", () => {
  it("groups existing environments without changing their route objects", () => {
    expect(navigation).toContain('const navigationGroupOrder = ["Workspace", "Platform", "Governance"] as const');
    expect(navigation).toContain('"overview"');
    expect(navigation).toContain('"production"');
    expect(navigation).toContain('"services"');
    expect(navigation).toContain('"monitoring"');
    expect(navigation).toContain('return "Governance"');
    expect(navigation).toContain('href={item.href}');
  });

  it("keeps authorization and accessibility behavior intact", () => {
    expect(navigation).toContain('aria-current={active ? "page" : undefined}');
    expect(navigation).toContain('role="dialog"');
    expect(navigation).toContain('aria-modal="true"');
    expect(navigation).toContain('event.key === "Escape"');
    expect(navigation).toContain('pendingFocusKey');
    expect(navigation).toContain('Membership and permissions remain authoritative. Hidden environments are not available to this account.');
  });

  it("searches labels, descriptions, and group names", () => {
    expect(navigation).toContain('`${item.label} ${item.description} ${navigationGroupFor(item)}`');
    expect(navigation).toContain('No environment matches “{query}”.');
  });
});
