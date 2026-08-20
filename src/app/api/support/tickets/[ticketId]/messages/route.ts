import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api/auth-helpers";
import { emitAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import {
  canAccessSupportTicket,
  isSupportStaff,
  parseSupportThreadMessage,
  supportMessageNotificationData,
} from "@/lib/support/live-support";
import {
  assertSafeSupportInput,
  requireSameOriginSupportRequest,
  SupportSecurityError,
} from "@/lib/support/security";

type RouteContext = { params: Promise<{ ticketId: string }> };

const messageSchema = z.object({ message: z.string().trim().min(1).max(4000) });
const updateSchema = z.object({
  claim: z.boolean().optional(),
  status: z.enum(["open", "in_progress", "waiting_on_client", "resolved", "closed"]).optional(),
}).refine((value) => value.claim !== undefined || value.status !== undefined, {
  message: "A claim or status update is required.",
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

async function findTicket(ticketId: string) {
  return db.supportTicket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      userId: true,
      subject: true,
      description: true,
      status: true,
      priority: true,
      assignedTo: true,
      createdAt: true,
      updatedAt: true,
      resolvedAt: true,
      closedAt: true,
    },
  });
}

function mutationSecurity(request: NextRequest) {
  try {
    requireSameOriginSupportRequest(request);
    return null;
  } catch (error) {
    if (error instanceof SupportSecurityError) {
      return json({ error: error.message, code: error.code }, error.statusCode);
    }
    throw error;
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;
  const { ticketId } = await context.params;
  const ticket = await findTicket(ticketId);
  if (!ticket || !canAccessSupportTicket(gate.session.role, gate.session.userId, ticket.userId)) {
    return json({ error: "Support case not found" }, 404);
  }

  const records = await db.notification.findMany({
    where: { data: { path: ["supportTicketId"], equals: ticketId } },
    orderBy: { createdAt: "asc" },
    take: 250,
    select: { id: true, body: true, data: true, createdAt: true },
  });

  return json({
    ok: true,
    ticket,
    messages: records.map(parseSupportThreadMessage).filter((entry) => entry !== null),
    viewer: {
      id: gate.session.userId,
      role: gate.session.role,
      staff: isSupportStaff(gate.session.role),
    },
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const securityFailure = mutationSecurity(request);
  if (securityFailure) return securityFailure;
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const body = await request.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return json({ error: "A message between 1 and 4,000 characters is required." }, 400);
  try {
    assertSafeSupportInput(parsed.data.message);
  } catch (error) {
    if (error instanceof SupportSecurityError) {
      return json({ error: error.message, code: error.code }, error.statusCode);
    }
    throw error;
  }

  const { ticketId } = await context.params;
  const ticket = await findTicket(ticketId);
  if (!ticket || !canAccessSupportTicket(gate.session.role, gate.session.userId, ticket.userId)) {
    return json({ error: "Support case not found" }, 404);
  }
  if (ticket.status === "resolved" || ticket.status === "closed") {
    return json({ error: "This support case is closed. Open a new case if more help is required." }, 409);
  }

  const staff = isSupportStaff(gate.session.role);
  const notification = await db.$transaction(async (transaction) => {
    const created = await transaction.notification.create({
      data: {
        userId: staff ? ticket.userId : ticket.assignedTo ?? ticket.userId,
        title: staff ? `Support reply — ${ticket.subject}` : `Client reply — ${ticket.subject}`,
        body: parsed.data.message,
        channel: "in_app",
        data: supportMessageNotificationData({
          ticketId,
          actorType: staff ? "staff" : "client",
          actorId: gate.session.userId,
          actorRole: gate.session.role,
        }),
      },
      select: { id: true, body: true, data: true, createdAt: true },
    });

    await transaction.supportTicket.update({
      where: { id: ticketId },
      data: staff
        ? { assignedTo: ticket.assignedTo ?? gate.session.userId, status: "waiting_on_client" }
        : { status: "in_progress" },
    });
    return created;
  });

  await emitAuditLog({
    userId: gate.session.userId,
    action: "admin_action",
    resource: "support_ticket",
    resourceId: ticketId,
    metadata: { event: "support_message", actorType: staff ? "staff" : "client", messageLength: parsed.data.message.length },
  });

  return json({ ok: true, message: parseSupportThreadMessage(notification) }, 201);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const securityFailure = mutationSecurity(request);
  if (securityFailure) return securityFailure;
  const gate = await requireSession();
  if (!gate.ok) return gate.response;
  if (!isSupportStaff(gate.session.role)) return json({ error: "Staff access required" }, 403);

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid case update" }, 400);
  const { ticketId } = await context.params;
  const ticket = await findTicket(ticketId);
  if (!ticket) return json({ error: "Support case not found" }, 404);

  const now = new Date();
  const updated = await db.supportTicket.update({
    where: { id: ticketId },
    data: {
      ...(parsed.data.claim === true ? { assignedTo: gate.session.userId } : {}),
      ...(parsed.data.claim === false && ticket.assignedTo === gate.session.userId ? { assignedTo: null } : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.status === "resolved" ? { resolvedAt: now } : {}),
      ...(parsed.data.status === "closed" ? { closedAt: now } : {}),
    },
    select: { id: true, status: true, assignedTo: true, updatedAt: true },
  });

  await db.notification.create({
    data: {
      userId: ticket.userId,
      title: `Support case updated — ${ticket.subject}`,
      body: parsed.data.status
        ? `Your support case is now ${parsed.data.status.replace(/_/g, " ")}.`
        : parsed.data.claim
          ? "A GEM support operator has claimed your case."
          : "The case assignment was updated.",
      channel: "in_app",
      data: supportMessageNotificationData({
        ticketId,
        actorType: "system",
        actorId: gate.session.userId,
        actorRole: gate.session.role,
      }),
    },
  });

  await emitAuditLog({
    userId: gate.session.userId,
    action: "admin_action",
    resource: "support_ticket",
    resourceId: ticketId,
    metadata: { event: "support_case_updated", status: updated.status, assignedTo: updated.assignedTo },
  });

  return json({ ok: true, ticket: updated });
}
