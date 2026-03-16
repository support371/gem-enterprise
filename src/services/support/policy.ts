import { QueueName, SupportReply } from "./types";

const humanTerms = ["human", "agent"];
const incidentTerms = ["incident", "breach", "hacked", "compromised"];
const bookingTerms = ["book", "schedule", "consultation"];
const billingTerms = ["bill", "payment", "charge"];

export function resolveQueue(message: string): QueueName {
  const lower = message.toLowerCase();

  if (incidentTerms.some((term) => lower.includes(term))) return "Cybersecurity / Incident";
  if (bookingTerms.some((term) => lower.includes(term))) return "Consultation Scheduling";
  if (billingTerms.some((term) => lower.includes(term))) return "Billing / Accounts";
  if (lower.includes("vip")) return "VIP Concierge";
  if (lower.includes("paid") || lower.includes("premium")) return "Premium Member Support";
  if (lower.includes("security")) return "Cybersecurity / Incident";
  return "General Member Support";
}

export function orchestrateSupportReply(content: string): SupportReply {
  const lower = content.toLowerCase();
  const queue = resolveQueue(content);

  if (humanTerms.some((term) => lower.includes(term))) {
    return {
      assistantText: "Understood. I am routing your session to a human concierge specialist now.",
      escalated: true,
      queue,
    };
  }

  if (incidentTerms.some((term) => lower.includes(term))) {
    return {
      assistantText: "This appears security-sensitive. Escalating to Cybersecurity / Incident now.",
      escalated: true,
      queue: "Cybersecurity / Incident",
    };
  }

  if (bookingTerms.some((term) => lower.includes(term))) {
    return {
      assistantText: "I can help prepare consultation scheduling. Use Book Help to create a booking request.",
      escalated: false,
      queue,
      bookingSuggested: true,
    };
  }

  if (billingTerms.some((term) => lower.includes(term))) {
    return {
      assistantText: "I can route this to Billing / Accounts or create a ticket for your records.",
      escalated: false,
      queue,
    };
  }

  return {
    assistantText: "I captured your request. Continue here, escalate to human support, create a ticket, or book help.",
    escalated: false,
    queue,
  };
}
