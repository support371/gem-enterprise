import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const component = readFileSync(
  join(process.cwd(), "src/components/tokmetric/TokMetricSetupStatus.tsx"),
  "utf8",
);
const setupPage = readFileSync(
  join(process.cwd(), "src/app/tokmetric/setup-status/page.tsx"),
  "utf8",
);
const aliasPage = readFileSync(
  join(process.cwd(), "src/app/tokmetric/tiktok-setup/page.tsx"),
  "utf8",
);
const readinessPage = readFileSync(
  join(process.cwd(), "src/app/tokmetric/readiness/page.tsx"),
  "utf8",
);
const connectorPanel = readFileSync(
  join(process.cwd(), "src/components/tokmetric/TokMetricConnectorPanel.tsx"),
  "utf8",
);

describe("TokMetric setup status", () => {
  it("uses the canonical production callback, review route, products, and scopes", () => {
    expect(component).toContain("https://gemcybersecurityassist.com/api/tokmetric/oauth/callback");
    expect(component).toContain("https://gemcybersecurityassist.com/tokmetric/app-review");
    expect(component).toContain("Login Kit");
    expect(component).toContain("Content Posting API — Direct Post");
    expect(component).toContain("user.info.basic");
    expect(component).toContain("video.publish");
    expect(component).toContain("SELF_ONLY");
  });

  it("separates manual portal progress from verified backend state", () => {
    expect(component).toContain("Operator-confirmed portal checklist");
    expect(component).toContain("These checkboxes do not claim TikTok verification");
    expect(component).toContain("Verified backend state");
    expect(component).toContain("Manual checklist progress is operator-confirmed");
  });

  it("loads real connector, readiness, health, and OAuth routes", () => {
    expect(component).toContain("/api/tokmetric/connectors?workspaceId=");
    expect(component).toContain("/api/tokmetric/connectors/health?workspaceId=");
    expect(component).toContain("/api/tokmetric/readiness");
    expect(component).toContain("/api/tokmetric/oauth/start");
    expect(component).toContain("provider=TIKTOK_CONTENT_POSTING_API");
    expect(component).toContain("ws_60488340ded94dcfab3b875ef9ae591c");
  });

  it("keeps activation fail-closed and avoids simulated success", () => {
    expect(component).toContain("BLOCKED — TIKTOK CONNECTION NOT FULLY ACTIVATED");
    expect(component).toContain("Production publishing remains disabled until separate authorization");
    expect(component).toContain("No connected or published state is simulated");
    expect(component).not.toContain('status: "PUBLISHED"');
  });

  it("publishes canonical and familiar setup routes without indexing them", () => {
    expect(setupPage).toContain("TokMetricSetupStatus");
    expect(setupPage).toContain("index: false");
    expect(aliasPage).toContain("TokMetricSetupStatus");
    expect(readinessPage).toContain('initialTab="connection"');
    expect(connectorPanel).toContain("/tokmetric/setup-status");
  });
});
