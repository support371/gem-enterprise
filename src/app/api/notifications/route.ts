import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const NOTIFICATIONS_LIMIT = 20;

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: NOTIFICATIONS_LIMIT,
        select: {
          id: true,
          title: true,
          body: true,
          channel: true,
          isRead: true,
          readAt: true,
          data: true,
          createdAt: true,
        },
      }),
      db.notification.count({
        where: { userId: session.userId, isRead: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
