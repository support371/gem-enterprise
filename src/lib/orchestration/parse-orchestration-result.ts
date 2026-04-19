import type { OrchestrationResult } from "@/types/support";

// ─── Normalize / sanitize AI output before rendering ─────────────────────────

export function parseOrchestrationResult(raw: OrchestrationResult): OrchestrationResult {
  return {
    ...raw,
    reply: sanitizeReply(raw.reply),
  };
}

function sanitizeReply(text: string): string {
  return text
    .trim()
    // Remove any markdown that leaks through if AI adds it unexpectedly
    .replace(/#{1,6}\s/g, "")
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    // Limit length
    .slice(0, 1500);
}
