import type { SessionPayload } from "@/lib/auth";
import { getGatewaySessionToken } from "@/lib/auth";
import { workspaceGateway } from "@/lib/supabase-gateway";
import type { SupportSession, SupportTicket } from "@/types/support";
import { supportStore } from "./store-instance";

export interface SupportSessionStore {
  createSession(session: SupportSession): Promise<SupportSession>;
  getSession(sessionId: string): Promise<SupportSession | null>;
  getSessionByUserId(userId: string): Promise<SupportSession | null>;
  updateSession(sessionId: string, update: Partial<SupportSession>): Promise<SupportSession | null>;
  appendMessage(sessionId: string, message: SupportSession["messages"][number]): Promise<SupportSession | null>;
  closeSession(sessionId: string): Promise<void>;
  createTicket(ticket: SupportTicket): Promise<SupportTicket>;
}

class GatewaySupportSessionStore implements SupportSessionStore {
  constructor(private readonly token: string) {}

  createSession(session: SupportSession) {
    return workspaceGateway<SupportSession>("support_session", this.token, { operation: "create", session });
  }

  getSession(sessionId: string) {
    return workspaceGateway<{ session: SupportSession | null }>("support_session", this.token, { operation: "get", sessionId }).then((result) => result.session);
  }

  getSessionByUserId(_userId: string) {
    return workspaceGateway<{ session: SupportSession | null }>("support_session", this.token, { operation: "get_active" }).then((result) => result.session);
  }

  updateSession(sessionId: string, update: Partial<SupportSession>) {
    return workspaceGateway<{ session: SupportSession | null }>("support_session", this.token, { operation: "update", sessionId, update }).then((result) => result.session);
  }

  appendMessage(sessionId: string, message: SupportSession["messages"][number]) {
    return workspaceGateway<{ session: SupportSession | null }>("support_session", this.token, { operation: "append", sessionId, message }).then((result) => result.session);
  }

  async closeSession(sessionId: string) {
    await workspaceGateway("support_session", this.token, { operation: "close", sessionId });
  }

  createTicket(ticket: SupportTicket) {
    return workspaceGateway<{ ticket: SupportTicket }>("support_session", this.token, {
      operation: "create_ticket",
      sessionId: ticket.sessionId,
      ticket,
    }).then((result) => result.ticket);
  }
}

export async function supportSessionStoreFor(auth: SessionPayload): Promise<SupportSessionStore> {
  if (auth.authSource !== "supabase_gateway") return supportStore;
  const token = await getGatewaySessionToken();
  if (!token) throw new Error("Gateway session required");
  return new GatewaySupportSessionStore(token);
}
