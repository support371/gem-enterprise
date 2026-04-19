import { supportStore } from "./store-instance";
import { generateSessionSummary } from "./generate-summary";
import { mapQueueToAtlassian } from "@/lib/atlassian/map-queue-to-atlassian";
import { createEscalationIssue } from "@/lib/atlassian/create-escalation-issue";
import { resolveQueue } from "@/lib/policy/resolve-queue";
import type { EscalationReason, AtlassianHandoffPayload } from "@/types/support";

export interface EscalateSessionResult {
  success: boolean;
  queue: string;
  atlassianIssueKey?: string;
  payload: AtlassianHandoffPayload;
  error?: string;
}

export async function escalateSession(
  sessionId: string,
  reason: EscalationReason = "user_requested"
): Promise<EscalateSessionResult | null> {
  const session = await supportStore.getSession(sessionId);
  if (!session) return null;

  const queue = resolveQueue({
    policyResult: { shouldEscalate: true, escalationReason: reason },
    userTier: session.userTier,
  });

  const transcript = generateSessionSummary(session);
  const payload = mapQueueToAtlassian(
    queue,
    sessionId,
    session.userId,
    session.userEmail,
    transcript,
    reason
  );

  const atlassianResult = await createEscalationIssue(payload);

  // Update session
  await supportStore.updateSession(sessionId, {
    status: "escalated",
    escalationReason: reason,
    escalatedAt: new Date().toISOString(),
    escalationPayload: payload,
    queue,
  });

  return {
    success: atlassianResult.success,
    queue,
    atlassianIssueKey: atlassianResult.issueKey,
    payload,
    error: atlassianResult.error,
  };
}
