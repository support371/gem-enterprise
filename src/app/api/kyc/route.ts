import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const application = await db.kYCApplication.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ ok: true, application });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entityType, formData } = await req.json();

  const application = await db.kYCApplication.create({
    data: {
      userId: session.userId,
      entityType,
      status: "started",
      formData: formData || {}
    }
  });

  return NextResponse.json({ ok: true, application });
}
