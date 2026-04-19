import { db as prisma } from "@/lib/db";
import type { SupportSession, SupportTicket, SupportBooking } from "@/types/support";

// ─── Prisma-Backed Support Session Store ──────────────────────────────────────
// Implements the same async interface as InMemorySupportSessionStore
// so callers need no changes.

class PrismaSupportSessionStore {
  // ── Sessions ────────────────────────────────────────────────────────────────

  async createSession(session: SupportSession): Promise<SupportSession> {
    await prisma.supportSession.create({
      data: {
        id: session.id,
        userId: session.userId || null,
        userTier: session.userTier ?? "standard",
        status: this._mapStatus(session.status),
        consentGiven: session.consentAccepted,
        consentAt: session.consentAcceptedAt ? new Date(session.consentAcceptedAt) : null,
        messages: JSON.parse(JSON.stringify(session.messages ?? [])),
        createdAt: new Date(session.createdAt),
      },
    });
    return session;
  }

  async getSession(sessionId: string): Promise<SupportSession | null> {
    const row = await prisma.supportSession.findUnique({
      where: { id: sessionId },
    });
    return row ? this._toSession(row) : null;
  }

  async getSessionByUserId(userId: string): Promise<SupportSession | null> {
    const row = await prisma.supportSession.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
    });
    return row ? this._toSession(row) : null;
  }

  async updateSession(
    sessionId: string,
    update: Partial<SupportSession>
  ): Promise<SupportSession | null> {
    try {
      const row = await prisma.supportSession.update({
        where: { id: sessionId },
        data: {
          ...(update.status !== undefined && { status: this._mapStatus(update.status) }),
          ...(update.consentAccepted !== undefined && { consentGiven: update.consentAccepted }),
          ...(update.consentAcceptedAt !== undefined && {
            consentAt: new Date(update.consentAcceptedAt),
          }),
          ...(update.messages !== undefined && {
            messages: JSON.parse(JSON.stringify(update.messages)),
          }),
        },
      });
      return this._toSession(row);
    } catch {
      return null;
    }
  }

  async appendMessage(
    sessionId: string,
    message: SupportSession["messages"][number]
  ): Promise<SupportSession | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;
    return this.updateSession(sessionId, {
      messages: [...session.messages, message],
    });
  }

  async closeSession(sessionId: string): Promise<void> {
    await prisma.supportSession.updateMany({
      where: { id: sessionId },
      data: { status: "closed" },
    });
  }

  // ── Tickets ─────────────────────────────────────────────────────────────────

  async createTicket(ticket: SupportTicket): Promise<SupportTicket> {
    await prisma.supportTicket.create({
      data: {
        id: ticket.id,
        userId: ticket.userId,
        subject: ticket.subject,
        description: ticket.description,
        status: "open",
        priority: "medium",
      },
    });
    return ticket;
  }

  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    const row = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      subject: row.subject,
      description: row.description,
      status: row.status as SupportTicket["status"],
      createdAt: row.createdAt.toISOString(),
    } as SupportTicket;
  }

  // ── Bookings ─────────────────────────────────────────────────────────────────

  async createBooking(booking: SupportBooking): Promise<SupportBooking> {
    await prisma.supportBooking.create({
      data: {
        id: booking.id,
        sessionId: booking.sessionId ?? null,
        userId: booking.userId ?? null,
        // SupportBooking type uses 'notes' and 'type' — store what we have
        name: "client",
        email: "",
        subject: booking.type ?? "consultation",
        notes: booking.notes ?? null,
        status: booking.status === "requested" ? "pending" : booking.status,
      },
    });
    return booking;
  }

  async getBooking(bookingId: string): Promise<SupportBooking | null> {
    const row = await prisma.supportBooking.findUnique({ where: { id: bookingId } });
    if (!row) return null;
    return {
      id: row.id,
      sessionId: row.sessionId ?? "",
      userId: row.userId ?? "",
      type: (row.subject as SupportBooking["type"]) ?? "consultation",
      notes: row.notes ?? "",
      status: row.status === "pending" ? "requested" : (row.status as SupportBooking["status"]),
      createdAt: row.createdAt.toISOString(),
    };
  }

  // ── Diagnostics ──────────────────────────────────────────────────────────────

  async countSessions(): Promise<number> {
    return prisma.supportSession.count();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private _mapStatus(status: SupportSession["status"] | undefined): "active" | "escalated" | "closed" {
    if (!status) return "active";
    if (status === "escalated") return "escalated";
    if (status === "closed") return "closed";
    return "active";
  }

  private _toSession(row: {
    id: string;
    userId: string | null;
    userTier: string;
    status: string;
    consentGiven: boolean;
    consentAt: Date | null;
    messages: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): SupportSession {
    return {
      id: row.id,
      userId: row.userId ?? "",
      userEmail: "",
      userTier: (row.userTier as SupportSession["userTier"]) ?? "standard",
      status: row.status as SupportSession["status"],
      consentAccepted: row.consentGiven,
      consentAcceptedAt: row.consentAt?.toISOString(),
      queue: "General Member Support",
      messages: Array.isArray(row.messages) ? (row.messages as SupportSession["messages"]) : [],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

export { PrismaSupportSessionStore };
