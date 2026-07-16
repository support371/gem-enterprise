import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const schema = readFileSync(
  "openapi/tokmetric-custom-gpt-production.openapi.yaml",
  "utf8",
);
const smoke = readFileSync(
  "scripts/tokmetric-custom-gpt-production-smoke.mjs",
  "utf8",
);

const redirectingApexServer = /^\s*- url: https:\/\/gemcybersecurityassist\.com\s*$/m;

describe("TokMetric Custom GPT canonical production contract", () => {
  it("uses the non-redirecting www production origin", () => {
    expect(schema).toContain(
      "- url: https://www.gemcybersecurityassist.com",
    );
    expect(schema).not.toMatch(redirectingApexServer);
    expect(smoke).toContain(
      '"https://www.gemcybersecurityassist.com"',
    );
    expect(smoke).toContain('redirect: "error"');
  });

  it("exposes reads and controlled planning but no GPT mutation path", () => {
    expect(schema).toContain("/functions/gptSystemReadiness:");
    expect(schema).toContain("/functions/gptGetAuditHistory:");
    expect(schema).toContain("/functions/tokmetric/agent-plan:");
    expect(schema).not.toContain("/functions/gptCreateCampaignDraft:");
    expect(schema).not.toContain("/functions/gptCreateContentDraft:");
    expect(schema).not.toContain("/functions/gptRunComplianceReview:");
    expect(schema).not.toContain("/functions/gptRequestApproval:");
    expect(schema).not.toContain("/functions/gptCreatePublishJob:");
  });

  it("preserves the controlled-launch safety assertions", () => {
    expect(schema).toContain("externalActionTaken=false");
    expect(schema).toContain("authenticated GEM Command Center");
    expect(smoke).toContain(
      'readinessData.production_activation !== "BLOCKED"',
    );
    expect(smoke).toContain(
      'readinessData.controlled_write_mode !== "COMMAND_CENTER_ONLY"',
    );
    expect(smoke).toContain(
      "planner.payload?.data?.externalActionTaken !== false",
    );
  });
});