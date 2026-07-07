import { NextResponse } from "next/server";
import { getAgentStoreSummary } from "@/lib/agentBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const channel = url.searchParams.get("channel")?.trim().toLowerCase();
  const stores = getAgentStoreSummary();

  const response =
    channel === "tiktok"
      ? { ok: true, channel: "tiktok", store: stores.tiktok }
      : channel === "google"
        ? { ok: true, channel: "google", store: stores.google }
        : { ok: true, channels: stores };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
