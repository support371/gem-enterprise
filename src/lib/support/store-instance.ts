import { PrismaSupportSessionStore } from "./stores/prisma-support-session-store";

// ─── Store Instance ───────────────────────────────────────────────────────────
// Uses the Prisma-backed store in all environments.
// Survives hot-reload in dev via globalThis.

const globalForStore = globalThis as unknown as {
  supportStore: PrismaSupportSessionStore | undefined;
};

export const supportStore =
  globalForStore.supportStore ?? new PrismaSupportSessionStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.supportStore = supportStore;
}
