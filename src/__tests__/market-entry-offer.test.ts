import { describe, expect, it } from "vitest";
import {
  foundingBusinessReviewOffer,
  marketLabelForStatus,
  marketPipeline,
} from "@/lib/market/launchOffer";

describe("market entry offer", () => {
  it("keeps the founding review commercially bounded", () => {
    expect(foundingBusinessReviewOffer.code).toBe("founding-business-review-199");
    expect(foundingBusinessReviewOffer.priceUsd).toBe(199);
    expect(foundingBusinessReviewOffer.includes).toContain(
      "Prioritized written findings and 30-day action plan",
    );
    expect(foundingBusinessReviewOffer.notIncluded).toContain("Unlimited remediation work");
  });

  it("maps governed intake states onto the sales pipeline", () => {
    expect(marketPipeline.map((stage) => stage.key)).toEqual([
      "RECEIVED",
      "TRIAGE",
      "NEEDS_INFORMATION",
      "QUALIFIED",
      "APPROVED",
      "CONVERTED",
      "DECLINED",
      "CLOSED",
    ]);
    expect(marketLabelForStatus("RECEIVED")).toBe("New Lead");
    expect(marketLabelForStatus("QUALIFIED")).toBe("Qualified");
    expect(marketLabelForStatus("CONVERTED")).toBe("Won / Onboarding");
  });
});
