import type { SupportSession } from "@/types/support";

// ─── Transcript Summary Generator ────────────────────────────────────────────
// Formats the session transcript into a plain-text string for Atlassian / tickets.

export function generateSessionSummary(session: SupportSession): string {
  const lines: string[] = [
    `Support Session Summary`,
    `=======================`,
    `Session ID: ${session.id}`,
    `User: ${session.userEmail} (${session.userId})`,
    `Started: ${session.createdAt}`,
    `Status: ${session.status}`,
    `Queue: ${session.queue}`,
    ``,
    `Transcript:`,
    `-----------`,
  ];

  for (const msg of session.messages) {
    if (msg.role === "system") continue;
    const label = msg.role === "user" ? "CLIENT" : "GEM CONCIERGE";
    const time = new Date(msg.timestamp).toLocaleTimeString("en-US", { hour12: false });
    lines.push(`[${time}] ${label}: ${msg.content}`);
  }

  if (session.escalationReason) {
    lines.push(``, `Escalation Reason: ${session.escalationReason}`);
  }

  return lines.join("\n");
}
