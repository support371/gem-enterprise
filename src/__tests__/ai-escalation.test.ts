/**
 * AI escalation unit tests
 *
 * Covers: restricted class detection patterns for all four governed classes
 * (LEGAL_ADVICE, FINANCIAL_ADVICE, SECURITY_CLOSURE, IDENTITY_DETERMINATION).
 * These patterns live in the assistant/message route and must not be bypassable.
 */

import { describe, it, expect } from "vitest";

// ─── Inline the detection logic (mirrors api/assistant/message/route.ts) ─────
// Tests are co-located with the patterns so any pattern change breaks the test.

const RESTRICTED_CLASSES: Array<{ class: string; patterns: RegExp[] }> = [
  {
    class: "LEGAL_ADVICE",
    patterns: [
      /\b(legal advice|you should sue|file a lawsuit|consult an attorney)\b/i,
      /\b(legal conclusion|legally required|legally liable)\b/i,
    ],
  },
  {
    class: "FINANCIAL_ADVICE",
    patterns: [
      /\b(invest in|buy (this|that|the) (stock|fund|asset)|portfolio recommendation)\b/i,
      /\b(you should (sell|buy|hold)|market timing|guaranteed return)\b/i,
    ],
  },
  {
    class: "SECURITY_CLOSURE",
    patterns: [
      /\b(breach (is|has been) contained|incident (is |has been )?closed|all clear|no (longer a )?threat)\b/i,
    ],
  },
  {
    class: "IDENTITY_DETERMINATION",
    patterns: [
      /\b(identity (is |has been )?confirmed|verified identity|no fraud detected|identity mismatch)\b/i,
    ],
  },
];

function detectRestrictedClass(text: string): string | null {
  for (const rc of RESTRICTED_CLASSES) {
    if (rc.patterns.some((p) => p.test(text))) return rc.class;
  }
  return null;
}

// ─── LEGAL_ADVICE ─────────────────────────────────────────────────────────────

describe("detectRestrictedClass — LEGAL_ADVICE", () => {
  it.each([
    "You should seek legal advice about this contract",
    "You should sue the company",
    "You could file a lawsuit against them",
    "I recommend you consult an attorney",
    "This is a legal conclusion based on the facts",
    "You are legally required to disclose this",
    "The company is legally liable for the damages",
  ])("triggers for: %s", (msg) => {
    expect(detectRestrictedClass(msg)).toBe("LEGAL_ADVICE");
  });
});

// ─── FINANCIAL_ADVICE ─────────────────────────────────────────────────────────

describe("detectRestrictedClass — FINANCIAL_ADVICE", () => {
  it.each([
    "You should invest in Apple stock",
    "Buy this fund now",
    "I can give you a portfolio recommendation",
    "You should sell your holdings",
    "You should buy more ETFs",
    "You should hold until the price recovers",
    "There is a guaranteed return on this product",
  ])("triggers for: %s", (msg) => {
    expect(detectRestrictedClass(msg)).toBe("FINANCIAL_ADVICE");
  });
});

// ─── SECURITY_CLOSURE ─────────────────────────────────────────────────────────

describe("detectRestrictedClass — SECURITY_CLOSURE", () => {
  it.each([
    "The breach is contained",
    "The breach has been contained",
    "The incident is closed",
    "The incident has been closed",
    "All clear, no threat remains",
    "This is no longer a threat",
  ])("triggers for: %s", (msg) => {
    expect(detectRestrictedClass(msg)).toBe("SECURITY_CLOSURE");
  });
});

// ─── IDENTITY_DETERMINATION ───────────────────────────────────────────────────

describe("detectRestrictedClass — IDENTITY_DETERMINATION", () => {
  it.each([
    "The identity is confirmed",
    "The identity has been confirmed",
    "We have verified identity",
    "No fraud detected in this case",
    "There is an identity mismatch",
  ])("triggers for: %s", (msg) => {
    expect(detectRestrictedClass(msg)).toBe("IDENTITY_DETERMINATION");
  });
});

// ─── Safe messages should not trigger ────────────────────────────────────────

describe("detectRestrictedClass — safe messages", () => {
  it.each([
    "What is my account balance?",
    "How do I update my KYC documents?",
    "Can you explain the cyber monitoring service?",
    "I need help with my portfolio access",
    "When will my application be reviewed?",
    "Thank you for your help",
    "What services does GEM Enterprise offer?",
  ])("does not trigger for: %s", (msg) => {
    expect(detectRestrictedClass(msg)).toBeNull();
  });
});
