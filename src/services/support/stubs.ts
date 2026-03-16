import { QueueName, SupportSession } from "./types";
import { makeId } from "./store";

export function createAtlassianHandoffStub(session: SupportSession, queue: QueueName) {
  return {
    handoffReference: `SUP-HANDOFF-${Math.floor(Math.random() * 100000)}`,
    provider: "Atlassian",
    queue,
    issueKey: `GEM-${Math.floor(Math.random() * 900 + 100)}`,
    sessionId: session.id,
    createdAt: new Date().toISOString(),
  };
}

export function createTicketStub(sessionId: string, userId: string, summary?: string) {
  return {
    ticketReference: `SUP-${Math.floor(Math.random() * 100000)}`,
    id: makeId("ticket"),
    sessionId,
    userId,
    summary: summary ?? "Portal concierge support request",
    createdAt: new Date().toISOString(),
  };
}

export function createBookingStub(sessionId: string, userId: string) {
  return {
    bookingReference: `BK-${Math.floor(Math.random() * 100000)}`,
    id: makeId("booking"),
    sessionId,
    userId,
    createdAt: new Date().toISOString(),
  };
}
