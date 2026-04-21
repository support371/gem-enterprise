// GEM Intel — scheduled news ingestion cron endpoint.
// Invoked by Vercel Cron (see vercel.json). Protected by CRON_SECRET so only
// Vercel's scheduler (or an authenticated admin override) can run it.

import { NextRequest, NextResponse } from "next/server";
import { runNewsIngestion } from "@/lib/news/ingest";

export const runtime = "nodejs";
export const maxDuration = 300; // up to 5 minutes for all feeds

function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Without a configured secret we only allow Vercel's internal header.
    // This is a soft default so deploys don't silently fail, but the deploy
    // checklist should set CRON_SECRET.
    return request.headers.get("x-vercel-cron") === "1";
  }
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runNewsIngestion({ triggeredBy: "cron" });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[cron/news-ingest]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
