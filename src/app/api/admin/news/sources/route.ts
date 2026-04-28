import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({}, { status: 401 });

  const { id, isActive } = await req.json();
  const updated = await db.newsSource.update({
    where: { id },
    data: { isActive }
  });

  return NextResponse.json({ ok: true, updated });
}
