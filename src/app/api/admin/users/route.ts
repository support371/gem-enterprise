import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({}, { status: 401 });

  const users = await db.user.findMany({
    include: { profile: true }
  });
  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({}, { status: 401 });

  const { id, role, isActive } = await req.json();
  const updated = await db.user.update({
    where: { id },
    data: { role, isActive }
  });
  return NextResponse.json({ ok: true, updated });
}
