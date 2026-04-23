// GEM Intel — manual ingestion trigger for admins + run history.
// GET  /api/admin/news/ingest → latest ingestion runs
// POST /api/admin/news/ingest → trigger a fresh run (optionally scoped to sourceIds)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { runNewsIngestion } from "@/lib/news/ingest";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAdmin(role: string) {
  return role === "admin" || role === "internal";
}

const triggerSchema = z.object({
  sourceIds: z.array(z.string().min(1)).optional(),
  perSourceLimit: z.number().int().min(1).max(100).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const runs = await db.newsIngestionRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ runs });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown = {};
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      body = await request.json();
    }
  } catch {
    body = {};
  }

  const parsed = triggerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await runNewsIngestion({
      triggeredBy: `admin:${session.userId}`,
      sourceIds: parsed.data.sourceIds,
      perSourceLimit: parsed.data.perSourceLimit,
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "admin_action",
        resource: "news_ingestion",
        resourceId: result.runId,
        metadata: {
          trigger: "news_ingest",
          status: result.status,
          sourcesAttempted: result.sourcesAttempted,
          sourcesSucceeded: result.sourcesSucceeded,
          sourcesFailed: result.sourcesFailed,
          articlesCreated: result.articlesCreated,
          articlesUpdated: result.articlesUpdated,
        },
      },
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[POST /api/admin/news/ingest]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
