import type { SupportQueue, AtlassianHandoffPayload } from "@/types/support";

interface AtlassianMapping {
  projectKey: string;
  issueType: string;
  priority: "Highest" | "High" | "Medium" | "Low";
  labels: string[];
}

// ─── Queue → Atlassian Project Mapping ───────────────────────────────────────

const QUEUE_MAP: Record<SupportQueue, AtlassianMapping> = {
  "Cybersecurity / Incident": {
    projectKey: process.env.ATLASSIAN_CYBER_PROJECT_KEY ?? "CYBERINC",
    issueType: "Incident",
    priority: "Highest",
    labels: ["gem-enterprise", "cybersecurity", "incident", "auto-escalated"],
  },
  "Consultation Scheduling": {
    projectKey: process.env.ATLASSIAN_CONSULT_PROJECT_KEY ?? "GEMCONSULT",
    issueType: "Task",
    priority: "Medium",
    labels: ["gem-enterprise", "consultation", "scheduling", "auto-escalated"],
  },
  "Billing / Accounts": {
    projectKey: process.env.ATLASSIAN_BILLING_PROJECT_KEY ?? "GEMACCTS",
    issueType: "Support",
    priority: "Medium",
    labels: ["gem-enterprise", "billing", "accounts", "auto-escalated"],
  },
  "VIP Concierge": {
    projectKey: process.env.ATLASSIAN_VIP_PROJECT_KEY ?? "GEMVIP",
    issueType: "Support",
    priority: "High",
    labels: ["gem-enterprise", "vip", "concierge", "auto-escalated"],
  },
  "Premium Member Support": {
    projectKey: process.env.ATLASSIAN_SUPPORT_PROJECT_KEY ?? "GEMSUPPORT",
    issueType: "Support",
    priority: "High",
    labels: ["gem-enterprise", "premium", "member-support", "auto-escalated"],
  },
  "General Member Support": {
    projectKey: process.env.ATLASSIAN_SUPPORT_PROJECT_KEY ?? "GEMSUPPORT",
    issueType: "Support",
    priority: "Medium",
    labels: ["gem-enterprise", "general", "member-support", "auto-escalated"],
  },
};

export function mapQueueToAtlassian(
  queue: SupportQueue,
  sessionId: string,
  userId: string,
  userEmail: string,
  transcript: string,
  escalationReason?: string
): AtlassianHandoffPayload {
  const mapping = QUEUE_MAP[queue];
  const timestamp = new Date().toISOString();

  const summary = `[GEM Concierge Auto-Escalation] ${queue} — ${userEmail}`;
  const description = [
    `*Session ID:* ${sessionId}`,
    `*User:* ${userEmail} (${userId})`,
    `*Queue:* ${queue}`,
    `*Escalation Reason:* ${escalationReason ?? "user_requested"}`,
    `*Timestamp:* ${timestamp}`,
    ``,
    `*Conversation Transcript:*`,
    `{code}`,
    transcript,
    `{code}`,
  ].join("\n");

  return {
    projectKey: mapping.projectKey,
    issueType: mapping.issueType,
    summary,
    description,
    priority: mapping.priority,
    labels: mapping.labels,
    customFields: {
      sessionId,
      userId,
      userEmail,
      queue,
    },
    transcript,
    sessionId,
    userId,
    userEmail,
    queue,
    createdAt: timestamp,
  };
}
