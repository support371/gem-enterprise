import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("production route hygiene", () => {
  it("has cookie policy and trust center pages", () => {
    expect(fs.existsSync("src/app/cookie-policy/page.tsx")).toBe(true);
    expect(fs.existsSync("src/app/trust-center/page.tsx")).toBe(true);
  });
  it("protects private community hub routes", () => {
    const proxy = fs.readFileSync("src/proxy.ts", "utf8");
    for (const route of ["/community-hub/members","/community-hub/messages","/community-hub/requests","/community-hub/profile","/community-hub/settings","/community-hub/opportunities"]) expect(proxy).toContain(route);
  });
  it("footer links to dedicated cookie policy", () => {
    expect(fs.readFileSync("src/components/Footer.tsx", "utf8")).toContain('path: "/cookie-policy"');
  });
});
