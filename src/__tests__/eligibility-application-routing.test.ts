import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  eligibilityApplicationHref,
  normalizeEligibilityTrack,
} from "@/lib/eligibilityTracks";
import { enterpriseApplicationSchema } from "@/lib/intake/schemas";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("public eligibility application routing", () => {
  it("routes every supported applicant track to the public enterprise application", () => {
    expect(eligibilityApplicationHref("individual")).toBe(
      "/enterprise/apply?track=individual",
    );
    expect(eligibilityApplicationHref("company")).toBe(
      "/enterprise/apply?track=company",
    );
    expect(eligibilityApplicationHref("trust")).toBe(
      "/enterprise/apply?track=trust",
    );
    expect(eligibilityApplicationHref("family_office")).toBe(
      "/enterprise/apply?track=family_office",
    );
  });

  it("allows only a fixed applicant-track value", () => {
    expect(normalizeEligibilityTrack("individual")).toBe("individual");
    expect(normalizeEligibilityTrack(["trust", "company"])).toBe("trust");
    expect(normalizeEligibilityTrack("administrator")).toBeNull();
    expect(normalizeEligibilityTrack("https://example.com")).toBeNull();
    expect(normalizeEligibilityTrack(undefined)).toBeNull();
  });

  it("removes client-login from the new-applicant eligibility page", () => {
    const eligibilityPage = source("src/app/eligibility/page.tsx");
    expect(eligibilityPage).not.toContain('href="/client-login"');
    expect(eligibilityPage).not.toContain('href: "/client-login"');
    expect(eligibilityPage).toContain("eligibilityApplicationHref");
    expect(eligibilityPage).toContain('href="/enterprise/apply"');
  });

  it("preselects only a normalized track on the application form", () => {
    const applicationPage = source("src/app/enterprise/apply/page.tsx");
    const form = source("src/components/intake/PublicIntakeForm.tsx");
    expect(applicationPage).toContain("normalizeEligibilityTrack(params.track)");
    expect(applicationPage).toContain("defaultOrganizationType={eligibilityTrack ?? undefined}");
    expect(form).toContain('defaultValue={props.defaultOrganizationType ?? ""}');
  });

  it.each(["individual", "trust"] as const)(
    "accepts the %s applicant type in durable enterprise intake",
    (organizationType) => {
      const result = enterpriseApplicationSchema.safeParse({
        name: "Morgan Avery",
        email: "morgan@example.com",
        organization: "Morgan Avery",
        title: "Principal",
        jurisdiction: "United States, New York",
        subject: "Enterprise qualification request",
        message:
          "I am requesting a documented human review of the relevant security and compliance service scope.",
        consentGiven: true,
        privacyAccepted: true,
        honeypot: "",
        startedAt: Date.now() - 5_000,
        organizationType,
        serviceAreas: ["cybersecurity"],
      });

      expect(result.success).toBe(true);
    },
  );
});
