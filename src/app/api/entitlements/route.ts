import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entitlements = await db.entitlement.findMany({
    where: { userId: session.userId, isActive: true },
    select: { id: true, slug: true, grantedAt: true, notes: true },
    orderBy: { grantedAt: "desc" },
  });

  return NextResponse.json({ entitlements });
}
