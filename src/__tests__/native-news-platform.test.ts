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
  it("plays allowlisted publisher video inside cards and story pages", () => {
    const card = source("src/components/intel/NewsArticleCard.tsx");
    const story = source("src/app/intel/news/[slug]/page.tsx");
    const player = source("src/components/video/GemVideoPlayer.tsx");
    const gateway = source("supabase/functions/gem-news-gateway/index.ts");
    expect(card).toContain("<GemVideoPlayer");
    expect(story).toContain("<GemVideoPlayer");
    expect(player).toContain("allowFullScreen");
    expect(player).toContain("playsInline");
    expect(gateway).toContain("videoThumbnail,videoProvider");
  });
  it("coordinates scroll previews and refreshes visible feeds without manual action", () => {
    const feed = source("src/components/intel/CuratedNewsFeed.tsx");
    const player = source("src/components/video/GemVideoPlayer.tsx");
    expect(feed).toContain("VIDEO_AUTOPLAY_THRESHOLD");
    expect(feed).toContain("activeVideoId");
    expect(feed).toContain("FEED_REFRESH_INTERVAL_MS");
    expect(feed).toContain('document.visibilityState === "visible"');
    expect(player).toContain("prefers-reduced-motion: reduce");
    expect(player).toContain("saveData");
    expect(player).toContain("video.pause()");
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
    const cadence = source("supabase/migrations/20260829120000_news_refresh_cadence.sql");
    const gateway = source("supabase/functions/gem-news-gateway/index.ts");
    expect(migration).toContain("gem-news-ingest-every-two-hours");
    expect(cadence).toContain("gem-news-due-source-check");
    expect(cadence).toContain("*/15 * * * *");
    expect(cadence).toContain('"pollIntervalMinutes" = 30');
    expect(gateway).toContain("sourceIsDue");
    expect(gateway).toContain("pollIntervalMinutes,lastFetchedAt");
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("REVOKE ALL");
  });
});
