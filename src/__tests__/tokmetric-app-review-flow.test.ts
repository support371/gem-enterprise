import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(
  join(process.cwd(), "src/app/tokmetric/app-review/page.tsx"),
  "utf8",
);

describe("TokMetric real app-review flow", () => {
  it("uses the authorized workspace and real Content Posting OAuth route", () => {
    expect(page).toContain("ws_60488340ded94dcfab3b875ef9ae591c");
    expect(page).toContain("/api/tokmetric/oauth/start");
    expect(page).toContain("provider=TIKTOK_CONTENT_POSTING_API");
  });

  it("navigates the reviewer through the real operating surfaces", () => {
    for (const route of [
      "/client-login",
      "/tokmetric/accounts",
      "/tokmetric/content-studio",
      "/tokmetric/compliance",
      "/tokmetric/approvals",
      "/tokmetric/publishing",
      "/tokmetric/analytics",
      "/tokmetric/privacy-policy",
      "/tokmetric/terms-of-service",
    ]) {
      expect(page).toContain(route);
    }
  });

  it("requires truthful platform confirmation instead of simulated publication", () => {
    expect(page).toContain("does not simulate a connected account or successful publication");
    expect(page).toContain("Shown only after TikTok returns a confirmed result");
    expect(page).toContain("SELF_ONLY");
    expect(page).not.toContain('status: "PUBLISHED"');
    expect(page).not.toContain("Published to TikTok");
  });

  it("keeps the reviewer route out of public indexing", () => {
    expect(page).toContain("index: false");
    expect(page).toContain("follow: false");
    expect(page).toContain("nocache: true");
  });
});
