/**
 * Support session persistence tests
 *
 * These tests verify the PrismaSupportSessionStore interface contract using
 * a Prisma mock. They do not require a live database.
 *
 * The mock replaces prisma.supportSession.* calls so the store's
 * mapping/transform logic is exercised independently of the DB.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock prisma before importing the store ───────────────────────────────────

vi.mock("@/lib/db", () => {
  const rows: Record<string, unknown> = {};

  return {
    db: {
      supportSession: {
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
          rows[data.id as string] = { ...data, updatedAt: new Date() };
          return rows[data.id as string];
        }),
        findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
          return rows[where.id] ?? null;
        }),
        findFirst: vi.fn(async () => null),
        update: vi.fn(
          async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
            if (!rows[where.id]) return null;
            rows[where.id] = { ...(rows[where.id] as object), ...data, updatedAt: new Date() };
            return rows[where.id];
          }
        ),
        updateMany: vi.fn(async () => ({ count: 1 })),
        count: vi.fn(async () => Object.keys(rows).length),
      },
      supportTicket: {
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => data),
        findUnique: vi.fn(async () => null),
      },
      supportBooking: {
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => data),
        findUnique: vi.fn(async () => null),
      },
    },
  };
});

import { PrismaSupportSessionStore } from "@/lib/support/stores/prisma-support-session-store";
import type { SupportSession } from "@/types/support";

// ─── Fixture ──────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<SupportSession> = {}): SupportSession {
  return {
    id: "sess_test_001",
    userId: "usr_test_001",
    userEmail: "test@example.com",
    userTier: "standard",
    status: "active",
    consentAccepted: false,
    queue: "General Member Support",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PrismaSupportSessionStore", () => {
  let store: PrismaSupportSessionStore;

  beforeEach(() => {
    store = new PrismaSupportSessionStore();
    vi.clearAllMocks();
  });

  it("creates and retrieves a session", async () => {
    const session = makeSession();
    await store.createSession(session);

    const retrieved = await store.getSession(session.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(session.id);
  });

  it("returns null for unknown session", async () => {
    const result = await store.getSession("unknown_id");
    expect(result).toBeNull();
  });

  it("updates session status", async () => {
    const session = makeSession();
    await store.createSession(session);

    const updated = await store.updateSession(session.id, { status: "escalated" });
    expect(updated).not.toBeNull();
  });

  it("appends a message to session", async () => {
    const session = makeSession();
    await store.createSession(session);

    const msg = {
      id: "msg_001",
      role: "user" as const,
      content: "Hello, I need help",
      timestamp: new Date().toISOString(),
    };

    const updated = await store.appendMessage(session.id, msg);
    expect(updated).not.toBeNull();
  });

  it("appending to non-existent session returns null", async () => {
    const msg = {
      id: "msg_002",
      role: "user" as const,
      content: "test",
      timestamp: new Date().toISOString(),
    };
    const result = await store.appendMessage("nonexistent", msg);
    expect(result).toBeNull();
  });

  it("closeSession does not throw", async () => {
    const session = makeSession();
    await store.createSession(session);
    await expect(store.closeSession(session.id)).resolves.not.toThrow();
  });

  it("consent fields are persisted correctly", async () => {
    const session = makeSession({
      consentAccepted: true,
      consentAcceptedAt: new Date().toISOString(),
    });
    const created = await store.createSession(session);
    expect(created.consentAccepted).toBe(true);
  });
});
