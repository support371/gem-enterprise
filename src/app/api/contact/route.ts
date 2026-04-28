import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Simple stub for contact
  return NextResponse.json({ ok: true });
}
