import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!['admin', 'super_admin', 'internal'].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    pendingKyc,
    openApprovals,
    openTickets,
  ] = await Promise.all([
    db.user.count({ where: { isActive: true } }),
    db.kYCApplication.count({ where: { status: { in: ['in_progress', 'under_review', 'manual_review'] as const } } }),
    db.kYCApplication.count({ where: { status: 'manual_review' as const } }),
    db.supportTicket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
  ]);

  return NextResponse.json({ totalUsers, pendingKyc, openApprovals, openTickets });
}
