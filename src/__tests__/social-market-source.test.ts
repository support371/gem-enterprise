import { describe, expect, it } from "vitest";
import { getGemApprovedSourceMaterial } from "@/lib/social-media/orchestration/gem-sources";

const approvedAt = new Date("2026-09-11T00:00:00.000Z");

describe("GEM social marketing sources", () => {
  it("includes the governed founding Business Review in full-catalog campaigns", () => {
    const sources = getGemApprovedSourceMaterial({ approvedAt });
    const review = sources.find((source) => source.id === "gem-market:founding-business-review-199");

    expect(review).toBeDefined();
    expect(review?.title).toBe("GEM Business Security & Operations Review");
    expect(review?.sourceReference).toBe("https://www.gemcybersecurityassist.com/business-review");
    expect(review?.callToAction).toContain("utm_source=social");
    expect(review?.callToAction).toContain("utm_campaign=founding-review");
    expect(review?.approved).toBe(true);
  });

  it("keeps explicitly scoped product campaigns product-only", () => {
    const sources = getGemApprovedSourceMaterial({
      approvedAt,
      productSlugs: ["24-7-threat-monitoring"],
    });

    expect(sources).toHaveLength(1);
    expect(sources[0]?.id).toBe("gem-catalog:24-7-threat-monitoring");
  });
});
