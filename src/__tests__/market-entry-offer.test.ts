import { describe, expect, it } from "vitest";
import { enterpriseApplicationSchema } from "@/lib/intake/schemas";
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

  it("keeps the founding review request compatible with the governed enterprise intake contract", () => {
    const parsed = enterpriseApplicationSchema.safeParse({
      name: "Sample Owner",
      email: "owner@example.com",
      organization: "Sample Business LLC",
      title: "Owner",
      jurisdiction: "United States / New Jersey",
      organizationType: "company",
      employeeRange: "1-10",
      serviceAreas: ["cybersecurity", "advisory"],
      subject: "[Founding Business Review] Account access and identity",
      message: [
        `Offer: ${foundingBusinessReviewOffer.name}`,
        `Offer code: ${foundingBusinessReviewOffer.code}`,
        `Founding price: $${foundingBusinessReviewOffer.priceUsd}`,
        "Primary concern: Account access and identity",
        "Urgency: This month",
        "",
        "We want a structured review of our current access controls and operating risks before expanding the team.",
      ].join("\n"),
      consentGiven: true,
      privacyAccepted: true,
      honeypot: "",
      startedAt: Date.now() - 5_000,
    });

    expect(parsed.success).toBe(true);
  });
});
