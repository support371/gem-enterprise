// GEM Intel — admin management of RSS sources.
// GET   → list sources with last-fetch telemetry
// PATCH → toggle isActive / update pollIntervalMinutes

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

function isAdmin(role: string) {
  return role === "admin" || role === "internal";
}

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sources = await db.newsSource.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      feedUrl: true,
      siteUrl: true,
      category: true,
      description: true,
      isActive: true,
      pollIntervalMinutes: true,
      lastFetchedAt: true,
      lastSuccessAt: true,
      lastErrorAt: true,
      lastError: true,
      consecutiveFailures: true,
      _count: { select: { articles: true } },
    },
  });

  return NextResponse.json({ sources });
}

const patchSchema = z.object({
  sourceId: z.string().min(1),
  isActive: z.boolean().optional(),
  pollIntervalMinutes: z.number().int().min(15).max(24 * 60).optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { sourceId, isActive, pollIntervalMinutes } = parsed.data;
  if (isActive === undefined && pollIntervalMinutes === undefined) {
    return NextResponse.json(
      { error: "Provide isActive or pollIntervalMinutes" },
      { status: 400 },
    );
  }

  const updated = await db.newsSource.update({
    where: { id: sourceId },
    data: {
      ...(isActive !== undefined && { isActive }),
      ...(pollIntervalMinutes !== undefined && { pollIntervalMinutes }),
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.userId,
      action: "admin_action",
      resource: "news_source",
      resourceId: sourceId,
      metadata: {
        ...(isActive !== undefined && { isActive }),
        ...(pollIntervalMinutes !== undefined && { pollIntervalMinutes }),
      },
    },
  });

  return NextResponse.json({ ok: true, source: updated });
}
