// GEM Intel — public curated news feed.
// GET /api/intel/news?category=crypto&limit=24&cursor=<publishedAt>
// Returns media-rich articles ordered by publishedAt desc, with cursor
// pagination for infinite-scroll.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { NewsCategory, Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const revalidate = 60; // re-cache list every minute

const VALID_CATEGORIES: ReadonlyArray<NewsCategory> = [
  "crypto",
  "cybersecurity",
  "markets",
  "geopolitics",
  "policy",
  "real_estate",
  "alternatives",
  "general",
];

// Map UI-friendly slugs (with dashes) to Prisma enum values (with underscores).
const CATEGORY_SLUG_MAP: Record<string, NewsCategory> = {
  crypto: "crypto",
  cybersecurity: "cybersecurity",
  markets: "markets",
  geopolitics: "geopolitics",
  policy: "policy",
  "real-estate": "real_estate",
  real_estate: "real_estate",
  alternatives: "alternatives",
  general: "general",
};

function parseLimit(raw: string | null, fallback = 24, max = 60): number {
  const n = raw ? Number.parseInt(raw, 10) : fallback;
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const limit = parseLimit(searchParams.get("limit"));
  const cursor = searchParams.get("cursor"); // ISO timestamp
  const featuredOnly = searchParams.get("featured") === "1";
  const editorsPickOnly = searchParams.get("editorsPick") === "1";
  const mediaOnly = searchParams.get("mediaOnly") === "1";
  const search = searchParams.get("q")?.trim();

  const where: Prisma.NewsArticleWhereInput = {
    status: "published",
    ...(featuredOnly && { isFeatured: true }),
    ...(editorsPickOnly && { isEditorsPick: true }),
    ...(mediaOnly && { NOT: { mediaType: "none" } }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { summary: { contains: search } },
      ],
    }),
  };

  if (categoryParam) {
    const mapped = CATEGORY_SLUG_MAP[categoryParam];
    if (!mapped || !VALID_CATEGORIES.includes(mapped)) {
      return NextResponse.json(
        { error: "Invalid category", allowed: Object.keys(CATEGORY_SLUG_MAP) },
        { status: 400 },
      );
    }
    where.category = mapped;
  }

  if (cursor) {
    const cursorDate = new Date(cursor);
    if (!Number.isNaN(cursorDate.getTime())) {
      where.publishedAt = { lt: cursorDate };
    }
  }

  const articles = await db.newsArticle.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      aiSummary: true,
      externalUrl: true,
      category: true,
      tags: true,
      author: true,
      mediaType: true,
      imageUrl: true,
      imageAlt: true,
      videoUrl: true,
      videoThumbnail: true,
      videoProvider: true,
      isFeatured: true,
      isEditorsPick: true,
      publishedAt: true,
      source: {
        select: { id: true, name: true, slug: true, siteUrl: true },
      },
    },
  });

  const hasMore = articles.length > limit;
  const items = hasMore ? articles.slice(0, limit) : articles;
  const nextCursor = hasMore
    ? items[items.length - 1]?.publishedAt.toISOString()
    : null;

  return NextResponse.json({
    items,
    nextCursor,
    count: items.length,
  });
}
