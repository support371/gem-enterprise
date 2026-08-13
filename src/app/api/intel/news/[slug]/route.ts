import { NextRequest, NextResponse } from "next/server";
import { newsGateway } from "@/lib/supabase-gateway";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try { const { slug } = await params; const story = await newsGateway("story", { slug }); return NextResponse.json(story, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } }); }
  catch { return NextResponse.json({ error: "Story not found" }, { status: 404 }); }
}
