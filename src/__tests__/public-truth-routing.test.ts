import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const nextConfig = require("../../next.config.js") as {
  redirects: () => Promise<
    Array<{ source: string; destination: string; permanent: boolean }>
  >;
};

describe("public truth routing", () => {
  it("temporarily routes the legacy community page to the disclosed preview", async () => {
    const redirects = await nextConfig.redirects();

    expect(redirects).toContainEqual({
      source: "/community",
      destination: "/community-hub",
      permanent: false,
    });
  });

  it("permanently routes open registration to controlled onboarding", async () => {
    const redirects = await nextConfig.redirects();

    expect(redirects).toContainEqual({
      source: "/register",
      destination: "/get-started",
      permanent: true,
    });
  });

  it("keeps the Community Hub explicitly fictional and non-indexed", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/community-hub/page.tsx"),
      "utf8",
    );

    expect(source).toContain("Fictional interface preview");
    expect(source).toContain(
      "No live members, opportunities, events, secure messaging, or verified network are represented.",
    );
    expect(source).toContain("Production access remains unavailable");
    expect(source).toContain("index: false");
    expect(source).toContain("follow: false");
    expect(source).toContain("nocache: true");
  });
});
