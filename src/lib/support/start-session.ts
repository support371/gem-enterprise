import { randomUUID } from "crypto";
import { supportStore } from "./store-instance";
import type { SupportSession, SupportQueue } from "@/types/support";
import type { SessionPayload } from "@/lib/auth";

export interface StartSessionResult {
  session: SupportSession;
  isExisting: boolean;
}

export async function startSupportSession(
  user: SessionPayload
): Promise<StartSessionResult> {
  // Resume active session if one exists for this user
  const existing = await supportStore.getSessionByUserId(user.userId);
  if (existing && existing.status !== "closed") {
    return { session: existing, isExisting: true };
  }

  // Resolve user tier from entitlements
  const userTier = resolveUserTier(user);

  const defaultQueue: SupportQueue = resolveDefaultQueue(userTier);

  const session: SupportSession = {
    id: randomUUID(),
    userId: user.userId,
    userEmail: user.email,
    status: "pending_consent",
    consentAccepted: false,
    queue: defaultQueue,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userTier,
  };

  await supportStore.createSession(session);
  return { session, isExisting: false };
}

function resolveUserTier(user: SessionPayload): "vip" | "premium" | "standard" {
  if (user.role === "admin" || user.role === "internal") return "vip";
  if (user.entitlements.length > 1) return "premium";
  return "standard";
}

function resolveDefaultQueue(tier: "vip" | "premium" | "standard"): SupportQueue {
  if (tier === "vip") return "VIP Concierge";
  if (tier === "premium") return "Premium Member Support";
  return "General Member Support";
}
