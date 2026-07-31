import { describe, expect, it } from "vitest";
import { governedCampaignTitle } from "@/lib/social-media/orchestration/campaign-identity";
import {
  buildSecurityPostureCampaignRequest,
  securityPostureCampaignProviders,
} from "@/lib/social-media/orchestration/security-posture-campaign";

describe("security posture governed campaign", () => {
  it("targets the approved cross-platform set and excludes Indeed", () => {
    const request = buildSecurityPostureCampaignRequest({
      workspaceId: "workspace-1",
      planDate: "2026-07-31",
      localContext: "Approved local service area context.",
    });

    expect(request.enabledProviders).toEqual([
      "TIKTOK",
      "FACEBOOK_PAGE",
      "INSTAGRAM_PROFESSIONAL",
      "X",
      "NEXTDOOR",
    ]);
    expect(request.enabledProviders).not.toContain("INDEED_EMPLOYER");
    expect(request.approvedSources[0].providers).toEqual([
      ...securityPostureCampaignProviders,
    ]);
  });

  it("keeps the campaign governed, approval-bound, and non-publishing", () => {
    const request = buildSecurityPostureCampaignRequest({
      workspaceId: " workspace-1 ",
      planDate: "2026-07-31",
    });

    expect(request.workspaceId).toBe("workspace-1");
    expect(request.campaignKey).toBe("security-posture");
    expect(request.requestApprovals).toBe(true);
    expect(request.forceRegenerate).toBe(false);
    expect(request.minimumTikTokItems).toBe(20);
    expect(request.maxItemsPerOtherProvider).toBe(1);
    expect(request).not.toHaveProperty("localContext");
    expect(request.approvedSources[0].summary).not.toMatch(
      /100% secure|unhackable|guaranteed protection|fully compliant/i,
    );
  });

  it("uses a distinct campaign identity without changing the daily plan title", () => {
    expect(governedCampaignTitle("2026-07-31", "security-posture")).toBe(
      "GEM Governed Campaign security-posture 2026-07-31",
    );
    expect(governedCampaignTitle(new Date("2026-07-31T12:00:00.000Z"))).toBe(
      "GEM Adaptive Content Plan 2026-07-31",
    );
  });
});
