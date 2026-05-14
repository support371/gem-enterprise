import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized", auditLogs: [] }, { status: 401 });
  }

  if (session.role !== "admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden", auditLogs: [] }, { status: 403 });
  }

  const auditLogs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      userId: true,
      action: true,
      resource: true,
      resourceId: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ auditLogs });
}
