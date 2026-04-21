// GEM Intel — returns per-category article counts for navigation badges.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 120;

export async function GET() {
  const groups = await db.newsArticle.groupBy({
    by: ["category"],
    where: { status: "published" },
    _count: { _all: true },
  });

  const counts = groups.map((g) => ({
    category: g.category,
    count: g._count._all,
  }));

  return NextResponse.json({ counts });
}
