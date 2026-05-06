import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, serverError } from "@/lib/api/auth-helpers";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const [totalUsers, pendingKyc, openApprovals, openTickets] = await Promise.all([
      db.user.count({ where: { isActive: true } }),
      db.kYCApplication.count({
        where: {
          status: {
            in: ["in_progress", "under_review", "manual_review"] as const,
          },
        },
      }),
      db.kYCApplication.count({ where: { status: "manual_review" as const } }),
      db.supportTicket.count({ where: { status: { in: ["open", "in_progress"] } } }),
    ]);

    return NextResponse.json({ totalUsers, pendingKyc, openApprovals, openTickets });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return serverError();
  }
}
