import type { SupportQueue, PolicyEvaluationResult } from "@/types/support";

export interface QueueResolutionInput {
  policyResult: PolicyEvaluationResult;
  userTier?: "vip" | "premium" | "standard";
}

// ─── Queue Resolver ───────────────────────────────────────────────────────────
// Deterministic — no randomness. Maps policy + user tier → queue.

export function resolveQueue(input: QueueResolutionInput): SupportQueue {
  const { policyResult, userTier } = input;

  // Policy-driven queue always wins for escalations
  if (policyResult.queue) {
    return policyResult.queue;
  }

  // Tier-based default routing
  if (userTier === "vip") return "VIP Concierge";
  if (userTier === "premium") return "Premium Member Support";

  return "General Member Support";
}
