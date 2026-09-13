import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  commercialCapabilities,
  commercialGapPriorities,
  commercialLifecycle,
  commercialOperatingPrinciples,
} from "@/lib/market/commercialOperatingModel";

describe("commercial operating model", () => {
  it("covers the commercial lifecycle beyond first conversion", () => {
    const keys = commercialLifecycle.map((stage) => stage.key);

    expect(keys).toContain("DISCOVER");
    expect(keys).toContain("QUALIFY");
    expect(keys).toContain("CONVERT");
    expect(keys).toContain("ONBOARD");
    expect(keys).toContain("DELIVER");
    expect(keys).toContain("SUPPORT");
    expect(keys).toContain("SUCCESS");
    expect(keys).toContain("EXPAND");
    expect(keys).toContain("RENEW");
    expect(keys).toContain("REFER");
    expect(keys).toContain("LEARN");
  });

  it("keeps canonical authority inside GEM", () => {
    expect(commercialOperatingPrinciples.join(" ")).toContain("GEM Enterprise remains the system of record");
    expect(commercialOperatingPrinciples.join(" ")).toContain("extended before any parallel SaaS system");

    for (const capability of commercialCapabilities) {
      expect(capability.systemOfRecord).not.toMatch(/HubSpot|Copper|Intercom|Gorgias/i);
    }
  });

  it("reports newly built post-conversion foundations as partial rather than missing", () => {
    const byName = new Map(commercialCapabilities.map((capability) => [capability.capability, capability]));

    expect(byName.get("Customer success / health")?.status).toBe("PARTIAL");
    expect(byName.get("Expansion / renewal")?.status).toBe("PARTIAL");
    expect(byName.get("Referral / testimonial")?.status).toBe("PARTIAL");
    expect(byName.get("Customer success / health")?.existingGemImplementation).toContain("Workspace-scoped customer-success profile");
    expect(commercialGapPriorities.map((priority) => priority.title)).toContain("Production schema activation & smoke test");
    expect(commercialGapPriorities.map((priority) => priority.title)).toContain("Sender identity & deliverability evidence");
  });

  it("exposes an admin control surface without creating automatic outreach", () => {
    const page = readFileSync("src/app/app/admin/market/operations/page.tsx", "utf8");

    expect(page).toContain("Market, Sales & Customer Operations");
    expect(page).toContain("No-duplication contract");
    expect(page).not.toContain("/send");
    expect(page).not.toContain("fetch(");
  });
});
