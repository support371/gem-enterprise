import { PlatformUser } from "@/lib/platform";
import { appendMessage, createSupportSession, loadSessionFromStorage, persistSession } from "./store";
import { orchestrateSupportReply, resolveQueue } from "./policy";
import { createAtlassianHandoffStub, createBookingStub, createTicketStub } from "./stubs";
import { SupportSession } from "./types";

function requireSession(user: PlatformUser, sessionId: string): SupportSession {
  const session = loadSessionFromStorage(user.id);
  if (!session || session.id !== sessionId) {
    throw new Error("Support session not found");
  }
  return session;
}

export async function postSupportSessionStart(user: PlatformUser) {
  return { session: createSupportSession(user.id) };
}

export async function postSupportSessionConsent(user: PlatformUser, sessionId: string) {
  const session = requireSession(user, sessionId);
  const next = {
    ...session,
    consented: true,
    status: "active" as const,
  };
  persistSession(next);
  return {
    session: appendMessage(next, {
      actor: "system",
      content: "Consent accepted. You can now describe what you need help with.",
    }),
  };
}

export async function postSupportMessage(user: PlatformUser, sessionId: string, content: string) {
  const session = requireSession(user, sessionId);
  const withUser = appendMessage(session, { actor: "user", content });
  const orchestration = orchestrateSupportReply(content);
  let next = appendMessage(withUser, { actor: "ai", content: orchestration.assistantText });
  next = { ...next, queue: orchestration.queue, status: orchestration.escalated ? "escalating" : "active" };

  let handoff = null;
  if (orchestration.escalated) {
    handoff = createAtlassianHandoffStub(next, orchestration.queue);
    next = appendMessage(
      { ...next, handoffReference: handoff.handoffReference },
      { actor: "system", content: `Escalated to ${orchestration.queue}. Reference: ${handoff.handoffReference}` }
    );
  } else {
    persistSession(next);
  }

  return { session: next, handoff };
}

export async function postSupportEscalate(user: PlatformUser, sessionId: string, queueHint?: string) {
  const session = requireSession(user, sessionId);
  const queue = queueHint ? resolveQueue(queueHint) : session.queue ?? "General Member Support";
  const handoff = createAtlassianHandoffStub(session, queue);
  const next = appendMessage(
    { ...session, status: "escalating", queue, handoffReference: handoff.handoffReference },
    { actor: "system", content: `This session has been escalated to ${queue}. Reference: ${handoff.handoffReference}` }
  );
  return { session: next, handoff };
}

export async function postTicketCreate(user: PlatformUser, sessionId: string) {
  const session = requireSession(user, sessionId);
  const ticket = createTicketStub(sessionId, user.id, session.messages.at(-1)?.content);
  const next = appendMessage(
    { ...session, status: "resolved" },
    { actor: "system", content: `A support ticket has been created. Reference: ${ticket.ticketReference}` }
  );
  return { session: next, ticket };
}

export async function postBookingCreate(user: PlatformUser, sessionId: string) {
  const session = requireSession(user, sessionId);
  const booking = createBookingStub(sessionId, user.id);
  const next = appendMessage(
    { ...session, status: "resolved", queue: "Consultation Scheduling" },
    { actor: "system", content: `A booking request has been created. Reference: ${booking.bookingReference}` }
  );
  return { session: next, booking };
}
