import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public Resources and Privacy claims reconciliation", () => {
  it("removes unsupported Resources staffing, tool, telemetry, and press-release claims", () => {
    const resources = readFileSync("src/app/resources/page.tsx", "utf8");

    expect(resources).toContain("Controlled public resources");
    expect(resources).toContain("/resources/business-readiness-checklist");
    expect(resources).not.toContain("GEM research team");
    expect(resources).not.toContain("GEM ThreatWatch");
    expect(resources).not.toContain("GEM ComplianceTracker");
    expect(resources).not.toContain("GEM VulnScan Orchestrator");
    expect(resources).not.toContain("proprietary SOC telemetry");
    expect(resources).not.toContain("regional IR units");
    expect(resources).not.toContain("GEM Enterprise Press Release");
  });

  it("preserves compatibility anchors for the existing Resources navigation without reviving unsupported claims", () => {
    const resources = readFileSync("src/app/resources/page.tsx", "utf8");

    for (const id of ["insights", "templates", "bots", "news", "faq"]) {
      expect(resources).toContain(`id: \"${id}\"`);
    }
    expect(resources).toContain("Public bot availability is not assumed");
    expect(resources).toContain("verified public starting artifact");
  });

  it("keeps Privacy wording conditional instead of publishing unsupported universal controls", () => {
    const privacy = readFileSync("src/app/privacy/page.tsx", "utf8");

    expect(privacy).toContain("Last updated: September 13, 2026");
    expect(privacy).toContain("controls differ by system");
    expect(privacy).toContain("does not represent that every user is subject to KYC/AML");
    expect(privacy).toContain("Response timing follows applicable law");
    expect(privacy).not.toContain("All data in transit is protected using TLS 1.3 or higher");
    expect(privacy).not.toContain("Data at rest is encrypted");
    expect(privacy).not.toContain("multi-factor authentication for all administrative access");
    expect(privacy).not.toContain("continuous security monitoring through a Security Operations Center");
    expect(privacy).not.toContain("regular third-party penetration testing");
    expect(privacy).not.toContain("minimum of seven (7) years");
    expect(privacy).not.toContain("accredited third-party identity verification");
  });

  it("versions new public-intake receipts to the September privacy notice", () => {
    const submit = readFileSync("src/lib/intake/submit.ts", "utf8");

    expect(submit).toContain('const PRIVACY_VERSION = "privacy-policy-2026-09-13"');
    expect(submit).not.toContain('const PRIVACY_VERSION = "privacy-policy-2026-07-13"');
  });
});
