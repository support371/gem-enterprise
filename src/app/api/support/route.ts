import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(255),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { subject, description, priority } = parsed.data;

    const ticket = await db.supportTicket.create({
      data: {
        userId: session.userId,
        subject,
        description,
        priority,
        status: "open",
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "support_ticket_created",
        resource: "support_ticket",
        resourceId: ticket.id,
        metadata: { subject, priority },
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      status: ticket.status,
      createdAt: ticket.createdAt,
    });
  } catch (error) {
    console.error("[POST /api/support]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await db.supportTicket.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        assignedTo: true,
        resolvedAt: true,
        closedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ tickets, total: tickets.length });
  } catch (error) {
    console.error("[GET /api/support]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
