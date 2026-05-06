import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import {
  requireSession,
  isAdminRole,
  getRequestContext,
  badRequest,
  serverError,
} from "@/lib/api/auth-helpers";

// ─── GET /api/support ─────────────────────────────────────────────────────────
//
// Clients see only their own tickets. Admins see all open + in-progress
// tickets across the platform (the admin console can deep-link from here).

export async function GET() {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;
  const session = gate.session;

  try {
    const tickets = await db.supportTicket.findMany({
      where: isAdminRole(session.role) ? {} : { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        subject: true,
        description: true,
        status: true,
        priority: true,
        assignedTo: true,
        resolvedAt: true,
        closedAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: isAdminRole(session.role)
          ? { select: { email: true, profile: { select: { firstName: true, lastName: true } } } }
          : undefined,
      },
    });
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("[GET /api/support]", error);
    return serverError();
  }
}

// ─── POST /api/support ────────────────────────────────────────────────────────

const createSchema = z.object({
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(10_000),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export async function POST(req: NextRequest) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  try {
    const ticket = await db.supportTicket.create({
      data: {
        userId: session.userId,
        subject: parsed.data.subject,
        description: parsed.data.description,
        priority: parsed.data.priority ?? "medium",
        status: "open",
      },
      select: { id: true, subject: true, status: true, priority: true, createdAt: true },
    });

    await emitAuditLog({
      userId: session.userId,
      action: "case_created",
      resource: "support_ticket",
      resourceId: ticket.id,
      metadata: { subject: parsed.data.subject, priority: ticket.priority },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ ok: true, ticket }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/support]", error);
    return serverError();
  }
}
