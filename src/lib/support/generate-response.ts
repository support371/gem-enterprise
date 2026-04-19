import { randomUUID } from "crypto";
import { supportStore } from "./store-instance";
import { orchestrateSupportReply } from "@/lib/orchestration/orchestrate-support-reply";
import { parseOrchestrationResult } from "@/lib/orchestration/parse-orchestration-result";
import type { SupportSession, SupportMessage } from "@/types/support";

export interface GenerateResponseResult {
  userMessage: SupportMessage;
  assistantMessage: SupportMessage;
  orchestration: ReturnType<typeof parseOrchestrationResult>;
  session: SupportSession;
}

export async function generateSupportResponse(
  sessionId: string,
  userText: string
): Promise<GenerateResponseResult | null> {
  const session = await supportStore.getSession(sessionId);
  if (!session) return null;

  const now = new Date().toISOString();

  // Persist user message
  const userMessage: SupportMessage = {
    id: randomUUID(),
    role: "user",
    content: userText,
    timestamp: now,
  };
  await supportStore.appendMessage(sessionId, userMessage);

  // Re-fetch session with the new user message for history
  const updatedSession = (await supportStore.getSession(sessionId))!;

  // Run orchestration
  const raw = await orchestrateSupportReply(userText, updatedSession);
  const orchestration = parseOrchestrationResult(raw);

  // Persist assistant message
  const assistantMessage: SupportMessage = {
    id: randomUUID(),
    role: "assistant",
    content: orchestration.reply,
    timestamp: new Date().toISOString(),
    metadata: {
      action: orchestration.action,
      shouldEscalate: orchestration.shouldEscalate,
    },
  };
  await supportStore.appendMessage(sessionId, assistantMessage);

  // If policy triggered escalation, mark session
  if (orchestration.shouldEscalate) {
    await supportStore.updateSession(sessionId, {
      status: "escalated",
      escalationReason: orchestration.escalationReason,
      escalatedAt: new Date().toISOString(),
    });
  }

  const finalSession = (await supportStore.getSession(sessionId))!;
  return { userMessage, assistantMessage, orchestration, session: finalSession };
}
