import type { PolicyEvaluationResult } from "@/types/support";

// ─── Policy Keywords ──────────────────────────────────────────────────────────

const ESCALATION_HUMAN = ["human", "agent", "speak to someone", "talk to someone", "real person"];

const ESCALATION_SECURITY = [
  "incident",
  "breach",
  "hacked",
  "compromised",
  "attack",
  "ransomware",
  "malware",
  "unauthorized access",
  "data leak",
];

const BOOKING_KEYWORDS = [
  "book",
  "schedule",
  "consultation",
  "appointment",
  "meeting",
  "call me",
];

const BILLING_KEYWORDS = [
  "bill",
  "payment",
  "charge",
  "invoice",
  "fee",
  "subscription",
  "refund",
  "pricing",
];

// ─── Policy Evaluator ─────────────────────────────────────────────────────────

export function evaluatePolicy(message: string): PolicyEvaluationResult {
  const normalized = message.toLowerCase();

  // Security / incident — highest priority
  const securityMatch = ESCALATION_SECURITY.find((kw) => normalized.includes(kw));
  if (securityMatch) {
    return {
      shouldEscalate: true,
      escalationReason: "incident_detected",
      queue: "Cybersecurity / Incident",
      path: "escalate",
      triggerKeyword: securityMatch,
    };
  }

  // Human / agent request
  const humanMatch = ESCALATION_HUMAN.find((kw) => normalized.includes(kw));
  if (humanMatch) {
    return {
      shouldEscalate: true,
      escalationReason: "user_requested",
      path: "escalate",
      triggerKeyword: humanMatch,
    };
  }

  // Booking / consultation
  const bookingMatch = BOOKING_KEYWORDS.find((kw) => normalized.includes(kw));
  if (bookingMatch) {
    return {
      shouldEscalate: false,
      path: "booking",
      queue: "Consultation Scheduling",
      triggerKeyword: bookingMatch,
    };
  }

  // Billing
  const billingMatch = BILLING_KEYWORDS.find((kw) => normalized.includes(kw));
  if (billingMatch) {
    return {
      shouldEscalate: false,
      path: "billing",
      queue: "Billing / Accounts",
      triggerKeyword: billingMatch,
    };
  }

  return { shouldEscalate: false, path: "continue" };
}
