import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const worker = readFileSync(
  "src/lib/social-media/publishing/worker.ts",
  "utf8",
);
const store = readFileSync(
  "src/lib/social-media/publishing/store.ts",
  "utf8",
);
const cancelRoute = readFileSync(
  "src/app/api/social-media/autopilot/cancel/route.ts",
  "utf8",
);

describe("social autopilot rollback controls", () => {
  it("blocks queued autonomous jobs if autopilot is later disabled", () => {
    expect(worker).toContain("socialAutopilotAutoApprovalEnabled()");
    expect(worker).toContain("SOCIAL_AUTOPILOT_DISABLED");
  });

  it("blocks queued autonomous jobs created under a stale policy version", () => {
    expect(worker).toContain("SOCIAL_AUTOPILOT_POLICY_VERSION_STALE");
    expect(worker).toContain("autopilotPolicyVersion");
  });

  it("provides an authenticated cancellation path for pending autonomous jobs", () => {
    expect(store).toContain("cancelPendingSocialAutopilotJobs");
    expect(store).toContain("state IN ('PENDING', 'RETRYING')");
    expect(cancelRoute).toContain("requireTokMetricSession");
    expect(cancelRoute).toContain('requirePermission(membership, "publish", "content")');
    expect(cancelRoute).toContain("SOCIAL_AUTOPILOT_CANCELLED");
  });
});
