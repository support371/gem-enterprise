import Parser from "rss-parser";
import { db } from "@/lib/db";
import type { NewsCategory } from "@prisma/client";

// ── Configuration ─────────────────────────────────────────────────────────────

const FEED_TIMEOUT_MS = 15_000;
const MAX_ITEMS_PER_FEED = 25;
const SUMMARY_MAX_CHARS = 600;

const parser = new Parser({
  timeout: FEED_TIMEOUT_MS,
  headers: {
    "User-Agent": "GEM-Enterprise-NewsAggregator/1.0 (+https://gemcybersecurityassist.com)",
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RunOptions {
  /** Free-form actor string for audit. */
  triggeredBy: string;
  /** When provided, only ingest these source ids. Otherwise all active sources. */
  sourceIds?: string[];
}

export type RunStatus = "success" | "partial" | "failed";

export interface IngestionResult {
  runId: string;
  status: RunStatus;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  articlesFound: number;
  articlesCreated: number;
  articlesUpdated: number;
  articlesSkipped: number;
  durationMs: number;
  errors: Array<{ sourceId: string; sourceName: string; message: string }>;
}

interface SourceTelemetry {
  found: number;
  created: number;
  updated: number;
  skipped: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trimTo(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

function pickPublishedAt(item: Parser.Item): Date {
  const candidates = [item.isoDate, item.pubDate];
  for (const c of candidates) {
    if (!c) continue;
    const d = new Date(c);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function pickGuid(item: Parser.Item, fallbackUrl: string): string {
  return item.guid?.trim() || fallbackUrl;
}

async function uniqueSlug(baseSlug: string, fallback: string): Promise<string> {
  const candidate = baseSlug || slugify(fallback) || `article-${Date.now()}`;
  const existing = await db.newsArticle.findUnique({ where: { slug: candidate }, select: { id: true } });
  if (!existing) return candidate;
  // Append short suffix until unique. Capped at a few attempts to avoid loops.
  for (let i = 0; i < 5; i++) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const next = `${candidate}-${suffix}`;
    const taken = await db.newsArticle.findUnique({ where: { slug: next }, select: { id: true } });
    if (!taken) return next;
  }
  return `${candidate}-${Date.now()}`;
}

// ── Ingestion ────────────────────────────────────────────────────────────────

interface SourceShape {
  id: string;
  name: string;
  feedUrl: string;
  category: NewsCategory;
  isActive: boolean;
}

async function ingestSource(source: SourceShape): Promise<SourceTelemetry> {
  const tel: SourceTelemetry = { found: 0, created: 0, updated: 0, skipped: 0 };
  const feed = await parser.parseURL(source.feedUrl);
  const items = (feed.items ?? []).slice(0, MAX_ITEMS_PER_FEED);
  tel.found = items.length;

  for (const item of items) {
    const externalUrl = item.link?.trim();
    if (!externalUrl) {
      tel.skipped += 1;
      continue;
    }
    const externalGuid = pickGuid(item, externalUrl);
    const title = (item.title ?? "Untitled").trim();
    const summarySource = item.contentSnippet ?? stripHtml(item.content ?? item.summary ?? "");
    const summary = trimTo(summarySource, SUMMARY_MAX_CHARS) || null;
    const body = stripHtml(item.content ?? item["content:encoded"] ?? "") || null;
    const author = (item.creator ?? item.author ?? null) as string | null;
    const publishedAt = pickPublishedAt(item);

    try {
      const existing = await db.newsArticle.findUnique({
        where: { externalGuid },
        select: { id: true, title: true, summary: true, body: true, publishedAt: true },
      });

      if (existing) {
        // Update only when content actually changed; keeps `updatedAt` honest.
        const changed =
          existing.title !== title ||
          existing.summary !== summary ||
          existing.body !== body ||
          existing.publishedAt.getTime() !== publishedAt.getTime();

        if (!changed) {
          tel.skipped += 1;
          continue;
        }

        await db.newsArticle.update({
          where: { externalGuid },
          data: { title, summary, body, publishedAt, author: author ?? undefined },
        });
        tel.updated += 1;
        continue;
      }

      const slug = await uniqueSlug(slugify(title), externalGuid);
      await db.newsArticle.create({
        data: {
          sourceId: source.id,
          externalGuid,
          externalUrl,
          slug,
          title,
          summary,
          body,
          category: source.category,
          author: author ?? undefined,
          publishedAt,
        },
      });
      tel.created += 1;
    } catch (err) {
      console.error(`[news/ingest] item failed for ${source.name}:`, err);
      tel.skipped += 1;
    }
  }

  return tel;
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function runNewsIngestion(options: RunOptions): Promise<IngestionResult> {
  const startedAt = Date.now();

  const sources = await db.newsSource.findMany({
    where: {
      isActive: true,
      ...(options.sourceIds?.length ? { id: { in: options.sourceIds } } : {}),
    },
    select: { id: true, name: true, feedUrl: true, category: true, isActive: true },
  });

  const run = await db.newsIngestionRun.create({
    data: {
      triggeredBy: options.triggeredBy,
      status: "running",
      sourcesAttempted: sources.length,
    },
  });

  let articlesFound = 0;
  let articlesCreated = 0;
  let articlesUpdated = 0;
  let articlesSkipped = 0;
  let sourcesSucceeded = 0;
  let sourcesFailed = 0;
  const errors: IngestionResult["errors"] = [];

  for (const source of sources) {
    try {
      const tel = await ingestSource(source);
      articlesFound += tel.found;
      articlesCreated += tel.created;
      articlesUpdated += tel.updated;
      articlesSkipped += tel.skipped;
      sourcesSucceeded += 1;
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
      sourcesFailed += 1;
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ sourceId: source.id, sourceName: source.name, message });
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

  const durationMs = Date.now() - startedAt;
  const status: RunStatus =
    sources.length === 0
      ? "success"
      : sourcesFailed === 0
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
        ? errors.map((e) => `${e.sourceName}: ${e.message}`).join(" | ").slice(0, 1_000)
        : null,
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
