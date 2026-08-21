import { randomUUID } from "crypto";
import type { SupportSession, SupportQueue } from "@/types/support";
import type { SessionPayload } from "@/lib/auth";
import type { SupportSessionStore } from "./support-session-store";
import { supportStore } from "./store-instance";

export interface StartSessionResult {
  session: SupportSession;
  isExisting: boolean;
}

export async function startSupportSession(
  user: SessionPayload,
  store: SupportSessionStore = supportStore,
): Promise<StartSessionResult> {
  // Resume active session if one exists for this user
  const existing = await store.getSessionByUserId(user.userId);
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

  await store.createSession(session);
  return { session, isExisting: false };
}

function resolveUserTier(user: SessionPayload): "vip" | "premium" | "standard" {
  if (["admin", "super_admin", "internal"].includes(user.role)) return "vip";
  if (user.entitlements.length > 1) return "premium";
  return "standard";
}

function resolveDefaultQueue(tier: "vip" | "premium" | "standard"): SupportQueue {
  if (tier === "vip") return "VIP Concierge";
  if (tier === "premium") return "Premium Member Support";
  return "General Member Support";
}
