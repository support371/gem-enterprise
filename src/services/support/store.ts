import { SupportMessage, SupportSession } from "./types";

const sessions = new Map<string, SupportSession>();
const STORAGE_PREFIX = "gem_support_session_";

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function loadSessionFromStorage(userId: string): SupportSession | null {
  const raw = window.localStorage.getItem(getStorageKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SupportSession;
    sessions.set(parsed.id, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function persistSession(session: SupportSession) {
  sessions.set(session.id, session);
  window.localStorage.setItem(getStorageKey(session.userId), JSON.stringify(session));
}

export function clearSession(userId: string) {
  const existing = loadSessionFromStorage(userId);
  if (existing) sessions.delete(existing.id);
  window.localStorage.removeItem(getStorageKey(userId));
}

export function createSupportSession(userId: string): SupportSession {
  const session: SupportSession = {
    id: makeId("sess"),
    userId,
    consented: false,
    status: "idle",
    queue: null,
    handoffReference: null,
    messages: [],
  };
  persistSession(session);
  return session;
}

export function appendMessage(session: SupportSession, message: Omit<SupportMessage, "id" | "createdAt">): SupportSession {
  const next: SupportSession = {
    ...session,
    messages: [...session.messages, { ...message, id: makeId("msg"), createdAt: new Date().toISOString() }],
  };
  persistSession(next);
  return next;
}
