import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [entitlements, openRequests, unreadNotifications, kycApp] = await Promise.all([
    db.entitlement.count({ where: { userId: session.userId, isActive: true } }),
    db.serviceRequest.count({ where: { userId: session.userId, status: { in: ["open", "in_progress"] } } }),
    db.notification.count({ where: { userId: session.userId, isRead: false } }),
    db.kYCApplication.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    }),
  ]);

  const documents = await db.kycDocument.count({
    where: {
      application: { userId: session.userId },
    },
  });

  return NextResponse.json({
    activeProducts: entitlements,
    documents,
    openRequests,
    unreadNotifications,
    kycStatus: kycApp?.status ?? "not_started",
  });
}
