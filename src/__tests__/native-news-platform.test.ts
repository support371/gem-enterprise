import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const source = (path: string) => readFileSync(path, "utf8");

describe("native GEM News platform", () => {
  it("renders internally without an external host or frame", () => {
    const page = source("src/app/intel/news/page.tsx");
    expect(page).toContain("<CuratedNewsFeed");
    expect(page).not.toMatch(/redirect\(|<iframe|NEXT_PUBLIC_NEWS/i);
  });
  it("opens native story routes while retaining publisher attribution", () => {
    const card = source("src/components/intel/NewsArticleCard.tsx");
    expect(card).toContain("`/intel/news/${article.slug}`");
    expect(card).toContain("noopener noreferrer");
  });
  it("provides saved, preference, and video surfaces", () => {
    const page = source("src/app/intel/news/page.tsx");
    expect(page).toContain('/intel/news/saved');
    expect(page).toContain('/intel/news/preferences');
    expect(page).toContain('/intel/news/videos');
  });
  it("keeps ingestion protected by a server-side authorization hash", () => {
    const gateway = source("supabase/functions/gem-news-gateway/index.ts");
    expect(gateway).toContain('token_hash');
    expect(gateway).toContain('eq("is_active", true)');
    expect(gateway).not.toMatch(/token\s*=\s*["'][A-Za-z0-9_-]{32,}/);
  });
  it("deduplicates canonical URLs and never stores full publisher bodies", () => {
    const gateway = source("supabase/functions/gem-news-gateway/index.ts");
    expect(gateway).toContain('onConflict: "externalGuid"');
    expect(gateway).toContain("body: null");
  });
  it("schedules autonomous refreshes and denies direct table access", () => {
    const migration = source("scripts/news-003-native-production.sql");
    expect(migration).toContain("gem-news-ingest-every-two-hours");
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("REVOKE ALL");
  });
});
