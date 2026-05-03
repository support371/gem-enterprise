import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const key = await db.apiKey.findFirst({
    where: { id, userId: session.userId },
  });

  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (key.revokedAt) return NextResponse.json({ error: "Already revoked" }, { status: 409 });

  await db.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
