import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized", tickets: [] }, { status: 401 });
  }

  const where = session.role === "admin" || session.role === "super_admin"
    ? {}
    : { userId: session.userId };

  const tickets = await db.supportTicket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    subject?: string;
    description?: string;
    priority?: string;
  } | null;

  if (!body?.subject || !body?.description) {
    return NextResponse.json({ error: "subject and description are required" }, { status: 400 });
  }

  const ticket = await db.supportTicket.create({
    data: {
      userId: session.userId,
      subject: body.subject,
      description: body.description,
      priority: (body.priority === "low" || body.priority === "high" || body.priority === "critical") ? body.priority : "medium",
      status: "open",
    },
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
