import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("market launch discovery", () => {
  it("publishes the founding review in the public sitemap", () => {
    const sitemap = readFileSync("src/app/sitemap.xml/route.ts", "utf8");
    expect(sitemap).toContain('"/business-review"');
  });

  it("uses a canonical public URL and service structured data", () => {
    const page = readFileSync("src/app/business-review/page.tsx", "utf8");
    expect(page).toContain('canonical: canonicalPath');
    expect(page).toContain('type="application/ld+json"');
    expect(page).toContain('"@type": "Service"');
    expect(page).toContain('foundingBusinessReviewOffer.priceUsd.toString()');
    expect(page).toContain('https://www.gemcybersecurityassist.com');
  });

  it("keeps discovery separate from payment and workspace activation", () => {
    const page = readFileSync("src/app/business-review/page.tsx", "utf8");
    expect(page).toContain("BusinessReviewIntakeForm");
    expect(page).not.toContain("workspace-invitations");
    expect(page).not.toContain("/api/market/checkout");
  });

  it("provides a controlled first-20 outreach workbench without automatic sending", () => {
    const outreach = readFileSync("src/app/app/admin/market/outreach/page.tsx", "utf8");
    expect(outreach).toContain("founding-first-20");
    expect(outreach).toContain("one-to-one");
    expect(outreach).toContain("never sends outreach automatically");
    expect(outreach).toContain("never creates an intake record");
    expect(outreach).not.toContain("/api/admin/campaigns/");
    expect(outreach).not.toContain("/send");
  });
});
