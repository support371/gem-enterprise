import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Facebook automation governance", () => {
  const routeFiles = [
    "src/app/api/facebook/analytics/route.ts",
    "src/app/api/facebook/approval/route.ts",
    "src/app/api/facebook/audit/route.ts",
    "src/app/api/facebook/content/route.ts",
    "src/app/api/facebook/emergency/route.ts",
    "src/app/api/facebook/verify/route.ts",
  ];

  it("does not construct Supabase clients during route module evaluation", () => {
    for (const path of routeFiles) {
      expect(source(path)).not.toContain("const supabase = createClient(");
    }
    const helper = source("src/lib/facebook/legacy-supabase.ts");
    expect(helper).toContain("LEGACY_FACEBOOK_STORE_NOT_CONFIGURED");
    expect(helper).toContain("export function getLegacyFacebookSupabase");
  });

  it("removes autonomous approval and unsupported content claims", () => {
    const approval = source("src/app/api/facebook/approval/route.ts");
    const generator = source(
      "src/app/api/facebook/agent/generate-content.ts",
    );
    const workflow = source(
      "src/app/api/facebook/agent/publish-workflow.ts",
    );
    const daily = source(
      "src/app/api/facebook/agent/daily-automation.ts",
    );
    expect(approval).toContain("LEGACY_FACEBOOK_APPROVAL_DISABLED");
    expect(approval).not.toContain("approved_by: 'system'");
    expect(generator).toContain(
      "LEGACY_AUTOMATED_CONTENT_GENERATION_DISABLED",
    );
    expect(generator).not.toContain("10,000 Happy Customers");
    expect(generator).not.toContain("FIDO2 certified");
    expect(generator).not.toContain("30% off");
    expect(workflow).toContain(
      "LEGACY_AUTONOMOUS_PUBLISH_WORKFLOW_DISABLED",
    );
    expect(daily).toContain("social-media/publishing/jobs/process/route");
    expect(daily).not.toContain("autoApproveLowRiskContent");
  });

  it("removes duplicate token decryption and URL token transport", () => {
    const verification = source("src/app/api/facebook/verify/route.ts");
    const analyticsWorker = source(
      "src/app/api/facebook/jobs/refresh-analytics.ts",
    );
    expect(verification).not.toContain("createDecipheriv");
    expect(verification).not.toContain("access_token");
    expect(analyticsWorker).not.toContain("createDecipheriv");
    expect(analyticsWorker).not.toContain("access_token");
    expect(analyticsWorker).toContain("CRON_AUTH_NOT_CONFIGURED");
  });

  it("uses the shared workspace emergency stop", () => {
    const emergency = source("src/app/api/facebook/emergency/route.ts");
    expect(emergency).toContain("publishingDisabled");
    expect(emergency).toContain("globalEmergencyLock");
    expect(emergency).toContain("requireWorkspaceAccess");
    expect(emergency).not.toContain("meta_connectors");
    expect(emergency).not.toContain("emergency_locked_by: 'system'");
  });

  it("keeps every live publishing gate explicitly disabled", () => {
    const config = JSON.parse(source("vercel.json")) as {
      env?: Record<string, string>;
    };
    expect(config.env?.SOCIAL_MEDIA_LIVE_PUBLISHING_ENABLED).toBe("false");
    expect(config.env?.META_SOCIAL_PUBLISHING_ENABLED).toBe("false");
    expect(config.env?.X_SOCIAL_PUBLISHING_ENABLED).toBe("false");
    expect(config.env?.LINKEDIN_SOCIAL_PUBLISHING_ENABLED).toBe("false");
    expect(config.env?.YOUTUBE_PUBLISHING_ENABLED).toBe("false");
    expect(config.env?.NEXTDOOR_PUBLISHING_ENABLED).toBe("false");
  });
});
