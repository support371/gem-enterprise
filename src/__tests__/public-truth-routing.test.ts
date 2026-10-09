import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const nextConfig = require("../../next.config.js") as {
  redirects: () => Promise<
    Array<{ source: string; destination: string; permanent: boolean }>
  >;
};

describe("public truth routing", () => {
  it("routes public demo and preview entry points to controlled production pages", async () => {
    const redirects = await nextConfig.redirects();
    expect(existsSync(join(process.cwd(), "src/app/community/page.tsx"))).toBe(true);
    expect(existsSync(join(process.cwd(), "src/app/hub/page.tsx"))).toBe(true);

    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/enterprise-demo",
          destination: "/enterprise-solutions",
          permanent: false,
        },
        {
          source: "/enterprise-demo/watch",
          destination: "/enterprise-solutions",
          permanent: false,
        },
        {
          source: "/preview",
          destination: "/company",
          permanent: false,
        },
        {
          source: "/tokmetric/review-demo",
          destination: "/tokmetric/app-review",
          permanent: false,
        },
      ]),
    );
  });

  it("permanently routes open registration to controlled onboarding", async () => {
    const redirects = await nextConfig.redirects();

    expect(redirects).toContainEqual({
      source: "/register",
      destination: "/get-started",
      permanent: true,
    });
  });
});
