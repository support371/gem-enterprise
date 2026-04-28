import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = [
    { category: "crypto", _count: 0 },
    { category: "cybersecurity", _count: 0 },
    { category: "markets", _count: 0 },
    { category: "geopolitics", _count: 0 },
    { category: "policy", _count: 0 },
    { category: "real_estate", _count: 0 },
    { category: "alternatives", _count: 0 },
    { category: "general", _count: 0 },
  ];
  return NextResponse.json({ categories });
}
