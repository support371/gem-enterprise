import { NextResponse } from "next/server";
import { RequestStatus, TicketStatus } from "@prisma/client";
import { requireStaff } from "@/lib/api/auth-helpers";
import { db } from "@/lib/db";
import { getCommandCenterOperatingLayerSnapshot } from "@/lib/commandCenterOperatingLayer";
import type { CommandCenterSnapshot } from "@/lib/commandCenterSnapshot";

export const dynamic = "force-dynamic";

function json(snapshot: CommandCenterSnapshot, status = 200) {
  return NextResponse.json(snapshot, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function GET() {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  const generatedAt = new Date().toISOString();
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const operatingLayerPromise = getCommandCenterOperatingLayerSnapshot();

  try {
    const [
      activeUsers,
      organizationRows,
      activeProducts,
      activeEntitlements,
      openSupportTickets,
      openServiceRequests,
      auditEventsLast24Hours,
      operatingLayer,
    ] = await Promise.all([
      db.user.count({ where: { isActive: true, status: "active" } }),
      db.user.findMany({
        where: { organizationId: { not: null } },
        distinct: ["organizationId"],
        select: { organizationId: true },
      }),
      db.product.count({ where: { isActive: true } }),
      db.entitlement.count({ where: { isActive: true } }),
      db.supportTicket.count({
        where: {
          status: {
            in: [TicketStatus.open, TicketStatus.in_progress, TicketStatus.waiting_on_client],
          },
        },
      }),
      db.serviceRequest.count({
        where: {
          status: {
            in: [RequestStatus.open, RequestStatus.in_progress, RequestStatus.pending_info],
          },
        },
      }),
      db.auditLog.count({ where: { createdAt: { gte: last24Hours } } }),
      operatingLayerPromise,
    ]);

    return json({
      source: "database",
      generatedAt,
      metrics: {
        activeUsers,
        organizations: organizationRows.length,
        activeProducts,
        activeEntitlements,
        openSupportTickets,
        openServiceRequests,
        auditEventsLast24Hours,
      },
      operatingLayer,
    });
  } catch (error) {
    console.error("[command-center] live snapshot unavailable", error);
    const operatingLayer = await operatingLayerPromise;

    return json({
      source: "unavailable",
      generatedAt,
      metrics: null,
      operatingLayer,
      message: "Live database aggregates are unavailable. The interface remains in disclosed demo mode.",
    });
  }
}
