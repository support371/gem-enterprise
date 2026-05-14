import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized", logs: [] }, { status: 401 });
  }

  if (session.role !== "admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden", logs: [] }, { status: 403 });
  }

  try {
    const logs = await db.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("[ADMIN_AUDIT_GET]", error);

    return NextResponse.json(
      {
        logs: [],
        error: "Unable to load audit logs",
      },
      { status: 500 },
    );
  }
}
