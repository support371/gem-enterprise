import { randomUUID } from "crypto";
import { supportStore } from "./store-instance";
import { generateSessionSummary } from "./generate-summary";
import type { SupportTicket } from "@/types/support";

export interface CreateTicketInput {
  sessionId: string;
  userId: string;
  subject: string;
  description: string;
  priority?: SupportTicket["priority"];
}

export async function createSupportTicket(
  input: CreateTicketInput
): Promise<SupportTicket | null> {
  const session = await supportStore.getSession(input.sessionId);
  if (!session) return null;

  const transcript = generateSessionSummary(session);

  const ticket: SupportTicket = {
    id: `TKT-${randomUUID().slice(0, 8).toUpperCase()}`,
    sessionId: input.sessionId,
    userId: input.userId,
    subject: input.subject,
    description: `${input.description}\n\n---\n${transcript}`,
    priority: input.priority ?? "medium",
    status: "open",
    createdAt: new Date().toISOString(),
  };

  await supportStore.createTicket(ticket);
  await supportStore.updateSession(input.sessionId, {
    status: "ticket_created",
    ticketId: ticket.id,
  });

  return ticket;
}
