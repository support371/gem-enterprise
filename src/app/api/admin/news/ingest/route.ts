import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { runNewsIngestion } from "@/lib/news/ingest";

function isAdmin(role: string) {
  return role === "admin" || role === "internal";
}

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

  try {
    const result = await runNewsIngestion({
      triggeredBy: `admin:${session.userId}`,
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "admin_action",
        resource: "news_ingestion",
        resourceId: result.runId,
        metadata: JSON.stringify({
          trigger: "news_ingest",
          status: result.status,
        }),
      },
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
