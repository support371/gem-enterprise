import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("governed content orchestrator", () => {
  const orchestrator = source(
    "src/lib/social-media/orchestration/orchestrator.ts",
  );
  const packageGenerator = source(
    "src/lib/social-media/orchestration/content-package.ts",
  );
  const dailyRoute = source(
    "src/app/api/social-media/orchestrator/daily/route.ts",
  );
  const scheduledRoute = source(
    "src/app/api/social-media/orchestrator/daily/process/route.ts",
  );
  const workflow = source("src/lib/tokmetric/workflow.ts");

  it("materializes through existing campaign, content, compliance, and approval controls", () => {
    expect(orchestrator).toContain("createContentDraft");
    expect(orchestrator).toContain("runComplianceReview");
    expect(orchestrator).toContain("requestContentApproval");
    expect(orchestrator).toContain("createDailyCampaign");
    expect(orchestrator).toContain("applyEngagementLearning");
  });

  it("does not bypass the existing publishing queue or invoke provider adapters", () => {
    expect(orchestrator).not.toContain("createSocialPublishingJob");
    expect(orchestrator).not.toContain("processSocialPublishingBatch");
    expect(orchestrator).not.toContain("getSocialPublishingAdapter");
    expect(orchestrator).toContain("externalActionTaken: false");
  });

  it("requires authenticated same-origin, permissioned, idempotent manual runs", () => {
    expect(dailyRoute).toContain("requireSameOrigin(request)");
    expect(dailyRoute).toContain("requireTokMetricSession(request)");
    expect(dailyRoute).toContain("requireWorkspaceAccess");
    expect(dailyRoute).toContain('requirePermission(membership, "create", "content")');
    expect(dailyRoute).toContain('requirePermission(membership, "review", "content")');
    expect(dailyRoute).toContain("IDEMPOTENCY_KEY_REQUIRED");
    expect(dailyRoute).toContain("withIdempotency");
  });

  it("keeps scheduled runs fail-closed with constant-time secret comparison", () => {
    expect(scheduledRoute).toContain("CONTENT_ORCHESTRATOR_CRON_SECRET");
    expect(scheduledRoute).toContain("CONTENT_ORCHESTRATOR_WORKSPACE_ID");
    expect(scheduledRoute).toContain("CONTENT_ORCHESTRATOR_ACTOR_ID");
    expect(scheduledRoute).toContain("timingSafeEqual");
    expect(scheduledRoute).toContain("CONTENT_ORCHESTRATOR_NOT_CONFIGURED");
  });

  it("stores renderer-independent recipes and flags sensitive claims", () => {
    expect(packageGenerator).toContain("rendererInput");
    expect(packageGenerator).toContain("humanReviewRequired: true");
    expect(packageGenerator).toContain("UNSUPPORTED_CLAIM");
    expect(packageGenerator).toContain("SECURITY_SENSITIVE_DETAIL");
    expect(packageGenerator).toContain("REGULATORY_CLAIM");
    expect(packageGenerator).toContain("NEXTDOOR_LOCAL_CONTEXT_REQUIRED");
  });

  it("requires a passing review and a different human approver", () => {
    expect(workflow).toContain("COMPLIANCE_APPROVAL_NOT_READY");
    expect(workflow).toContain("SEPARATE_APPROVER_REQUIRED");
    expect(workflow).toContain("orchestratorRiskFindings");
    expect(workflow).toContain('action: input.action?.trim() || "publish_content"');
  });
});
