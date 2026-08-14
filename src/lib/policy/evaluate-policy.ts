import type { PolicyEvaluationResult } from "@/types/support";

// ─── Policy Keywords ──────────────────────────────────────────────────────────

const ESCALATION_HUMAN = [
  "human",
  "live agent",
  "live support",
  "representative",
  "customer service",
  "speak to someone",
  "talk to someone",
  "real person",
  "human advisor",
];

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

const RESTRICTED_CLASSES: ReadonlyArray<{
  restrictedClass: NonNullable<PolicyEvaluationResult["restrictedClass"]>;
  patterns: readonly RegExp[];
}> = [
  {
    restrictedClass: "LEGAL_ADVICE",
    patterns: [
      /\b(legal advice|you should sue|file a lawsuit|consult an attorney)\b/i,
      /\b(legal conclusion|legally required|legally liable)\b/i,
      /\b(give|need|want|provide)\s+(me\s+)?legal advice\b/i,
      /\bshould i (sue|sign|accept|reject)\b/i,
      /\bwhat are my legal rights\b/i,
    ],
  },
  {
    restrictedClass: "FINANCIAL_ADVICE",
    patterns: [
      /\b(invest in|buy (this|that|the) (stock|fund|asset)|portfolio recommendation)\b/i,
      /\b(you should (sell|buy|hold)|market timing|guaranteed return)\b/i,
      /\b(give|need|want|provide)\s+(me\s+)?(financial|investment|tax) advice\b/i,
      /\bwhat should i (buy|sell|invest in|trade)\b/i,
      /\bguarantee(d)? (profit|return|yield)\b/i,
    ],
  },
  {
    restrictedClass: "SECURITY_CLOSURE",
    patterns: [
      /\b(breach (is|has been) contained|incident (is |has been )?closed|all clear|no (longer a )?threat)\b/i,
      /\b(confirm|declare|certify)\b.{0,40}\b(incident|breach|attack)\b.{0,30}\b(resolved|closed|safe|contained)\b/i,
      /\bis (the|my|our) (system|account|network) (now )?(safe|secure)\b/i,
    ],
  },
  {
    restrictedClass: "IDENTITY_DETERMINATION",
    patterns: [
      /\b(identity (is |has been )?confirmed|verified identity|no fraud detected|identity mismatch)\b/i,
      /\b(confirm|decide|determine|prove)\b.{0,40}\b(identity|fraud|impostor|forgery)\b/i,
      /\bis (this|that|the) (person|identity|document) (fake|fraudulent|real|valid)\b/i,
    ],
  },
];

// ─── Policy Evaluator ─────────────────────────────────────────────────────────

export function evaluatePolicy(message: string): PolicyEvaluationResult {
  const normalized = message.toLowerCase();

  // Specific governed determination requests take priority over broad words
  // such as "incident" or "breach".
  const restrictedMatch = RESTRICTED_CLASSES.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(message)),
  );
  if (restrictedMatch) {
    return {
      shouldEscalate: true,
      escalationReason: "restricted_class",
      restrictedClass: restrictedMatch.restrictedClass,
      path: "escalate",
    };
  }

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
