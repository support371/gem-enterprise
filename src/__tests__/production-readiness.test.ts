import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("production route hygiene", () => {
  it("includes public compliance and recovery pages", () => {
    for (const path of [
      "src/app/cookie-policy/page.tsx",
      "src/app/trust-center/page.tsx",
      "src/app/forgot-password/page.tsx",
      "src/app/reset-password/page.tsx",
      "src/app/robots.txt/route.ts",
      "src/app/sitemap.xml/route.ts",
    ]) {
      expect(fs.existsSync(path), path).toBe(true);
    }
  });

  it("protects private community and administrative routes", () => {
    const proxy = fs.readFileSync("src/proxy.ts", "utf8");
    for (const route of [
      "/community-hub/members",
      "/community-hub/messages",
      "/community-hub/requests",
      "/community-hub/profile",
      "/community-hub/settings",
      "/community-hub/opportunities",
      "/admin",
      "/review",
    ]) {
      expect(proxy).toContain(route);
    }
  });

  it("links the dedicated cookie policy from the footer", () => {
    expect(fs.readFileSync("src/components/Footer.tsx", "utf8")).toContain(
      'path: "/cookie-policy"',
    );
  });
});
