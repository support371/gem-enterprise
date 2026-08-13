import { NextRequest, NextResponse } from "next/server";
import { GatewayRequestError, newsGateway } from "@/lib/supabase-gateway";

export const runtime = "nodejs";
const CATEGORIES = new Set(["crypto", "cybersecurity", "markets", "geopolitics", "policy", "real_estate", "alternatives", "general"]);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const category = query.get("category")?.replace("real-estate", "real_estate");
  if (category && !CATEGORIES.has(category)) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  const parsedLimit = Number.parseInt(query.get("limit") || "24", 10);
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 60) : 24;
  try {
    const result = await newsGateway<Record<string, unknown>>("feed", {
      category,
      limit,
      cursor: query.get("cursor") || undefined,
      search: query.get("q")?.trim() || undefined,
      mediaOnly: query.get("mediaOnly") === "1",
      videoOnly: query.get("videoOnly") === "1",
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    return NextResponse.json({ error: "News feed is temporarily unavailable." }, { status: error instanceof GatewayRequestError ? error.statusCode : 503 });
  }
}
