// GEM Intel — News ingestion library
// Fetches configured RSS sources, dedupes on externalGuid, writes into
// news_articles, and tracks a NewsIngestionRun for observability.

import Parser from "rss-parser";
import { db } from "@/lib/db";
import type { NewsSource, NewsCategory } from "@prisma/client";
import { extractMedia, stripHtml } from "./media";
import { buildArticleSlug, fallbackGuidFromUrl, slugify } from "./slugify";

export type IngestOptions = {
  triggeredBy: string; // "cron" | "admin:<userId>" | "manual"
  sourceIds?: string[]; // restrict to a subset; default = all active
  perSourceLimit?: number; // cap items per feed (default 25)
  timeoutMs?: number; // per-feed timeout (default 15_000)
};

export type IngestResult = {
  runId: string;
  status: "success" | "partial" | "failed";
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  articlesFound: number;
  articlesCreated: number;
  articlesUpdated: number;
  articlesSkipped: number;
  durationMs: number;
  errors: Array<{ sourceSlug: string; error: string }>;
};

const parser = new Parser({
  timeout: 15_000,
  headers: {
    "User-Agent":
      "GEM-Intel-Bot/1.0 (+https://gem-enterprise.example/news; contact=intel@gem-enterprise.example)",
  },
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: true }],
      ["media:thumbnail", "media:thumbnail", { keepArray: true }],
      ["content:encoded", "content:encoded"],
      ["dc:creator", "creator"],
    ],
  },
});

async function fetchWithTimeout(feedUrl: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "GEM-Intel-Bot/1.0 (+https://gem-enterprise.example/news)",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Feed responded ${res.status} ${res.statusText}`);
    }
    const xml = await res.text();
    return parser.parseString(xml);
  } finally {
    clearTimeout(timer);
  }
}

function clampLen(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

async function ingestSource(
  source: NewsSource,
  perSourceLimit: number,
  timeoutMs: number,
): Promise<{
  found: number;
  created: number;
  updated: number;
  skipped: number;
}> {
  const feed = await fetchWithTimeout(source.feedUrl, timeoutMs);
  const items = (feed.items ?? []).slice(0, perSourceLimit);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const rawItem of items) {
    // rss-parser typings are loose; normalize here.
    const item = rawItem as unknown as Parser.Item & Record<string, unknown>;

    const externalUrl =
      (item.link as string | undefined) ??
      (item.guid as string | undefined) ??
      null;
    if (!externalUrl) {
      skipped++;
      continue;
    }

    const guid =
      (item.guid as string | undefined) ?? fallbackGuidFromUrl(externalUrl);
    const title = clampLen(
      ((item.title as string | undefined) ?? "Untitled").trim(),
      500,
    );

    const publishedAtSrc = (item.isoDate as string | undefined) ?? (item.pubDate as string | undefined);
    const publishedAt = publishedAtSrc ? new Date(publishedAtSrc) : new Date();
    if (Number.isNaN(publishedAt.getTime())) {
      skipped++;
      continue;
    }

    const media = extractMedia(item, title);
    const summary = stripHtml(
      (item.contentSnippet as string | undefined) ??
        (item.summary as string | undefined) ??
        (item.content as string | undefined),
      600,
    );
    const body = stripHtml(
      (item["content:encoded"] as string | undefined) ?? (item.content as string | undefined),
      4000,
    );
    const author =
      (item.creator as string | undefined) ??
      (item.author as string | undefined) ??
      null;

    // Build slug with collision-safe suffix using guid hash fragment.
    const baseSlug = buildArticleSlug(title, publishedAt);
    const guidSuffix = slugify(guid).slice(-8) || "x";
    const slug = `${baseSlug}-${guidSuffix}`.slice(0, 140);

    const existing = await db.newsArticle.findUnique({
      where: { externalGuid: guid },
      select: { id: true, updatedAt: true },
    });

    if (existing) {
      await db.newsArticle.update({
        where: { externalGuid: guid },
        data: {
          title,
          summary,
          body,
          author,
          externalUrl,
          imageUrl: media.imageUrl,
          imageAlt: media.imageAlt,
          videoUrl: media.videoUrl,
          videoThumbnail: media.videoThumbnail,
          videoProvider: media.videoProvider,
          mediaType: media.mediaType,
          publishedAt,
        },
      });
      updated++;
    } else {
      await db.newsArticle.create({
        data: {
          sourceId: source.id,
          externalGuid: guid,
          externalUrl,
          slug,
          title,
          summary,
          body,
          author,
          category: source.category as NewsCategory,
          tags: [],
          mediaType: media.mediaType,
          imageUrl: media.imageUrl,
          imageAlt: media.imageAlt,
          videoUrl: media.videoUrl,
          videoThumbnail: media.videoThumbnail,
          videoProvider: media.videoProvider,
          status: "published",
          publishedAt,
        },
      });
      created++;
    }
  }

  return { found: items.length, created, updated, skipped };
}

export async function runNewsIngestion(
  options: IngestOptions,
): Promise<IngestResult> {
  const start = Date.now();
  const perSourceLimit = options.perSourceLimit ?? 25;
  const timeoutMs = options.timeoutMs ?? 15_000;

  const sources = await db.newsSource.findMany({
    where: {
      isActive: true,
      ...(options.sourceIds?.length ? { id: { in: options.sourceIds } } : {}),
    },
    orderBy: { name: "asc" },
  });

  const run = await db.newsIngestionRun.create({
    data: {
      status: "running",
      triggeredBy: options.triggeredBy,
      sourcesAttempted: sources.length,
    },
  });

  let sourcesSucceeded = 0;
  let sourcesFailed = 0;
  let articlesFound = 0;
  let articlesCreated = 0;
  let articlesUpdated = 0;
  let articlesSkipped = 0;
  const errors: Array<{ sourceSlug: string; error: string }> = [];

  for (const source of sources) {
    try {
      const result = await ingestSource(source, perSourceLimit, timeoutMs);
      sourcesSucceeded++;
      articlesFound += result.found;
      articlesCreated += result.created;
      articlesUpdated += result.updated;
      articlesSkipped += result.skipped;

      await db.newsSource.update({
        where: { id: source.id },
        data: {
          lastFetchedAt: new Date(),
          lastSuccessAt: new Date(),
          lastError: null,
          consecutiveFailures: 0,
        },
      });
    } catch (err) {
      sourcesFailed++;
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ sourceSlug: source.slug, error: message });

      await db.newsSource.update({
        where: { id: source.id },
        data: {
          lastFetchedAt: new Date(),
          lastErrorAt: new Date(),
          lastError: message.slice(0, 500),
          consecutiveFailures: { increment: 1 },
        },
      });
    }
  }

  const durationMs = Date.now() - start;
  const status: IngestResult["status"] =
    sourcesFailed === 0
      ? "success"
      : sourcesSucceeded === 0
        ? "failed"
        : "partial";

  await db.newsIngestionRun.update({
    where: { id: run.id },
    data: {
      status,
      sourcesSucceeded,
      sourcesFailed,
      articlesFound,
      articlesCreated,
      articlesUpdated,
      articlesSkipped,
      durationMs,
      errorSummary: errors.length
        ? errors.map((e) => `${e.sourceSlug}: ${e.error}`).join(" | ").slice(0, 2000)
        : null,
      metadata: {
        errors,
        perSourceLimit,
        timeoutMs,
      },
      completedAt: new Date(),
    },
  });

  return {
    runId: run.id,
    status,
    sourcesAttempted: sources.length,
    sourcesSucceeded,
    sourcesFailed,
    articlesFound,
    articlesCreated,
    articlesUpdated,
    articlesSkipped,
    durationMs,
    errors,
  };
}
