import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const navigationSource = readFileSync("src/lib/platformNavigation.ts", "utf8");
const commandCenterSource = readFileSync(
  "src/app/app/command-center/tokmetric/page.tsx",
  "utf8",
);
const gatewaySource = readFileSync("src/app/tokmetric/app/page.tsx", "utf8");
const workspaceLayoutSource = readFileSync(
  "src/app/tokmetric/workspace/layout.tsx",
  "utf8",
);
const gptActionSchema = readFileSync(
  "openapi/tokmetric-actions.openapi.yaml",
  "utf8",
);

describe("TokMetric Command Center consolidation", () => {
  it("registers TikTok Operations in the authenticated Command Center navigation", () => {
    expect(navigationSource).toContain('href: "/app/command-center/tokmetric"');
    expect(navigationSource).toContain('label: "TikTok Operations"');
  });

  it("provides one controlled entry point for the existing native modules", () => {
    expect(commandCenterSource).toContain('href: "/tokmetric/accounts"');
    expect(commandCenterSource).toContain('href: "/tokmetric/content-studio"');
    expect(commandCenterSource).toContain('href: "/tokmetric/compliance"');
    expect(commandCenterSource).toContain('href: "/tokmetric/approvals"');
    expect(commandCenterSource).toContain('href: "/tokmetric/publishing"');
    expect(commandCenterSource).toContain('href: "/tokmetric/analytics"');
    expect(commandCenterSource).toContain('href: "/tokmetric/developer"');
    expect(commandCenterSource).toContain('href: "/tokmetric/agents"');
  });

  it("makes the Command Center the canonical app gateway", () => {
    expect(gatewaySource).toContain(
      "https://gemcybersecurityassist.com/app/command-center/tokmetric",
    );
    expect(gatewaySource).toContain('href="/app/command-center/tokmetric"');
    expect(workspaceLayoutSource).toContain('href="/app/command-center/tokmetric"');
    expect(workspaceLayoutSource).not.toContain("base44.app");
    expect(workspaceLayoutSource).not.toContain("replit.dev");
  });

  it("preserves the Custom GPT production action contract and publishing lock", () => {
    expect(gptActionSchema).toContain("url: https://gemcybersecurityassist.com");
    expect(gptActionSchema).toContain("operationId: getTokMetricSystemReadiness");
    expect(commandCenterSource).toContain("Live publishing remains disabled");
    expect(commandCenterSource).toContain("Custom GPT Action");
  });
});
