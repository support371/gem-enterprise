import { InMemorySupportSessionStore } from "./stores/in-memory-support-session-store";

// ─── Singleton Store Instance ─────────────────────────────────────────────────
// Survives hot-reload in dev via globalThis.
// Replace with a DB-backed store in production without changing callers.

const globalForStore = globalThis as unknown as {
  supportStore: InMemorySupportSessionStore | undefined;
};

export const supportStore =
  globalForStore.supportStore ?? new InMemorySupportSessionStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.supportStore = supportStore;
}
