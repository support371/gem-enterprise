import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { platformOrigins } from "@/lib/platform-origins";

describe("official enterprise solutions access", () => {
  it("uses a fixed, reviewed solutions origin", () => {
    expect(platformOrigins.enterpriseSolutions).toBe(
      "https://gem-assist-enterprise.vercel.app",
    );
  });

  it("publishes the canonical sales gateway while preserving explicit trust boundaries", () => {
    const page = fs.readFileSync(
      "src/app/enterprise-solutions/page.tsx",
      "utf8",
    );

    expect(page).toContain('canonical: "/enterprise-solutions"');
    expect(page).toContain("GEM services and sales");
    expect(page).toContain("does not create accounts, approve access");
    expect(page).toContain("/business-review?utm_source=enterprise-solutions");
    expect(page).toContain('href="/get-started"');
    expect(page).toContain('href: "/client-login"');
    expect(page).toContain('href: "/trust-center"');
    expect(page).toContain("still move through qualification, approved scope, contracting, and protected access");
    expect(page).toContain('rel="noopener noreferrer"');
  });

  it("exposes the gateway through primary discovery surfaces", () => {
    const navigation = fs.readFileSync("src/components/Navigation.tsx", "utf8");
    const footer = fs.readFileSync("src/components/Footer.tsx", "utf8");
    const homepage = fs.readFileSync("src/app/page.tsx", "utf8");
    const sitemap = fs.readFileSync("src/app/sitemap.xml/route.ts", "utf8");
    const routes = fs.readFileSync("src/lib/siteRoutes.ts", "utf8");

    for (const source of [navigation, footer, homepage, sitemap, routes]) {
      expect(source).toContain("/enterprise-solutions");
    }
  });
});
