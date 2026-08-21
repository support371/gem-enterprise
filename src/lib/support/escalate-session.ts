import { randomUUID } from "crypto";
import { supportStore } from "./store-instance";
import { generateSessionSummary } from "./generate-summary";
import { mapQueueToAtlassian } from "@/lib/atlassian/map-queue-to-atlassian";
import { createEscalationIssue } from "@/lib/atlassian/create-escalation-issue";
import { resolveQueue } from "@/lib/policy/resolve-queue";
import type { EscalationReason, AtlassianHandoffPayload } from "@/types/support";
import { db } from "@/lib/db";
import type { SupportSessionStore } from "./support-session-store";

export interface EscalateSessionResult {
  success: boolean;
  queue: string;
  handoffChannel: "atlassian" | "gem_ticket";
  atlassianIssueKey?: string;
  ticketId?: string;
  providerConfigured: boolean;
  payload: AtlassianHandoffPayload;
  error?: string;
}

export async function escalateSession(
  sessionId: string,
  reason: EscalationReason = "user_requested",
  store: SupportSessionStore = supportStore,
  authenticatedEmail?: string,
): Promise<EscalateSessionResult | null> {
  const session = await store.getSession(sessionId);
  if (!session) return null;

  const queue = resolveQueue({
    policyResult: { shouldEscalate: true, escalationReason: reason },
    userTier: session.userTier,
  });

  const transcript = generateSessionSummary(session);
  const resolvedEmail = session.userEmail || authenticatedEmail || (await db.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    }))?.email || "unavailable";
  const payload = mapQueueToAtlassian(
    queue,
    sessionId,
    session.userId,
    resolvedEmail,
    transcript,
    reason
  );

  const atlassianResult = await createEscalationIssue(payload);

  let ticketId: string | undefined;
  if (!atlassianResult.success) {
    ticketId = `TKT-${randomUUID().slice(0, 8).toUpperCase()}`;
    await store.createTicket({
      id: ticketId,
      sessionId,
      userId: session.userId,
      subject: `Human support handoff — ${queue}`,
      description: transcript,
      priority: queue === "Cybersecurity / Incident" ? "critical" : "medium",
      status: "open",
      createdAt: new Date().toISOString(),
    });
  }

  // Update session
  await store.updateSession(sessionId, {
    status: "escalated",
    escalationReason: reason,
    escalatedAt: new Date().toISOString(),
    escalationPayload: payload,
    queue,
    ticketId,
  });

  return {
    success: atlassianResult.success || Boolean(ticketId),
    queue,
    handoffChannel: atlassianResult.success ? "atlassian" : "gem_ticket",
    atlassianIssueKey: atlassianResult.issueKey,
    ticketId,
    providerConfigured: atlassianResult.configured,
    payload,
    error: atlassianResult.success || ticketId ? undefined : atlassianResult.error,
  };
}
