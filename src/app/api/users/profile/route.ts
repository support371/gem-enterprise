import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      createdAt: true,
      profile: true,
      kycApplications: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    email: user.email,
    createdAt: user.createdAt,
    profile: user.profile,
    kycStatus: user.kycApplications[0]?.status ?? null,
  });
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
