import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGatewaySessionToken } from "@/lib/auth";
import { requireAdmin, serverError } from "@/lib/api/auth-helpers";
import {
  adminReadGateway,
  GatewayRequestError,
} from "@/lib/supabase-gateway";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const gatewayToken = await getGatewaySessionToken();
  if (gatewayToken) {
    try {
      return NextResponse.json(await adminReadGateway("stats", gatewayToken), {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      if (error instanceof GatewayRequestError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode, headers: { "Cache-Control": "no-store" } },
        );
      }
      return serverError();
    }
  }

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

    return NextResponse.json(
      { totalUsers, pendingKyc, openApprovals, openTickets },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return serverError();
  }
}
