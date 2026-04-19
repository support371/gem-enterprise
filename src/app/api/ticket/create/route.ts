import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supportStore } from "@/lib/support/store-instance";
import { createSupportTicket } from "@/lib/support/create-ticket";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().min(1),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await getSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const session = await supportStore.getSession(parsed.data.sessionId);
  if (!session || session.userId !== auth.userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const ticket = await createSupportTicket({
      sessionId: parsed.data.sessionId,
      userId: auth.userId,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority,
    });

    if (!ticket) {
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      message: `Ticket ${ticket.id} has been created. Our support team will respond within one business day.`,
    });
  } catch (err) {
    console.error("[ticket/create]", err);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
