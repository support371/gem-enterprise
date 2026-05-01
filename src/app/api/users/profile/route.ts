import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.profile.findUnique({
    where: { userId: session.userId }
  });

  return NextResponse.json({ ok: true, profile });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const profile = await db.profile.upsert({
    where: { userId: session.userId },
    update: data,
    create: { ...data, userId: session.userId }
  });

  return NextResponse.json({ ok: true, profile });
}
