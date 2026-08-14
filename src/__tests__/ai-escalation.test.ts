import { describe, expect, it } from "vitest";
import { evaluatePolicy } from "@/lib/policy/evaluate-policy";

describe("AI support policy", () => {
  it.each([
    ["You should seek legal advice about this contract", "LEGAL_ADVICE"],
    ["You should invest in Apple stock", "FINANCIAL_ADVICE"],
    ["The breach has been contained", "SECURITY_CLOSURE"],
    ["The identity is confirmed", "IDENTITY_DETERMINATION"],
  ])("escalates restricted request: %s", (message, restrictedClass) => {
    expect(evaluatePolicy(message)).toMatchObject({
      shouldEscalate: true,
      escalationReason: "restricted_class",
      restrictedClass,
      path: "escalate",
    });
  });

  it.each([
    "I need a live agent support",
    "Let me speak to a representative",
    "I want a real person",
  ])("honors an explicit human-support request: %s", (message) => {
    expect(evaluatePolicy(message)).toMatchObject({
      shouldEscalate: true,
      escalationReason: "user_requested",
      path: "escalate",
    });
  });

  it.each([
    "How do I update my KYC documents?",
    "Where is my organization workspace?",
    "Show me the GEM News page",
    "What products does my account show?",
  ])("keeps ordinary navigation questions in AI support: %s", (message) => {
    expect(evaluatePolicy(message).shouldEscalate).toBe(false);
  });
});
