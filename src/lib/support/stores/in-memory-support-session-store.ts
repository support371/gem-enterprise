import type { SupportSession, SupportTicket, SupportBooking } from "@/types/support";

// ─── In-Memory Support Session Store ─────────────────────────────────────────
// Swap for a DB-backed implementation without changing callers.

class InMemorySupportSessionStore {
  private sessions = new Map<string, SupportSession>();
  private tickets = new Map<string, SupportTicket>();
  private bookings = new Map<string, SupportBooking>();

  // Sessions
  async createSession(session: SupportSession): Promise<SupportSession> {
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<SupportSession | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async getSessionByUserId(userId: string): Promise<SupportSession | null> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.status === "active") {
        return session;
      }
    }
    return null;
  }

  async updateSession(
    sessionId: string,
    update: Partial<SupportSession>
  ): Promise<SupportSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    const updated: SupportSession = {
      ...session,
      ...update,
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  async appendMessage(
    sessionId: string,
    message: SupportSession["messages"][number]
  ): Promise<SupportSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    const updated: SupportSession = {
      ...session,
      messages: [...session.messages, message],
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.set(sessionId, {
        ...session,
        status: "closed",
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Tickets
  async createTicket(ticket: SupportTicket): Promise<SupportTicket> {
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    return this.tickets.get(ticketId) ?? null;
  }

  // Bookings
  async createBooking(booking: SupportBooking): Promise<SupportBooking> {
    this.bookings.set(booking.id, booking);
    return booking;
  }

  async getBooking(bookingId: string): Promise<SupportBooking | null> {
    return this.bookings.get(bookingId) ?? null;
  }

  // Diagnostics
  async countSessions(): Promise<number> {
    return this.sessions.size;
  }
}

export { InMemorySupportSessionStore };
