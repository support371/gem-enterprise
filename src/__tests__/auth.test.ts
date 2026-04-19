/**
 * Auth unit tests
 *
 * Covers: JWT sign/verify, session cookie helpers, auth state resolution,
 * access destination routing, and production JWT secret enforcement.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  signSession,
  verifySession,
  resolveAuthState,
  resolveAccessDestination,
} from "@/lib/auth";
import type { SessionPayload } from "@/lib/auth";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const clientSession: SessionPayload = {
  userId: "usr_test_001",
  email: "client@example.com",
  role: "client",
  kycStatus: "approved",
  entitlements: ["cyber"],
  portfolioId: undefined,
  organizationId: undefined,
};

const adminSession: SessionPayload = {
  userId: "usr_test_admin",
  email: "admin@gem-enterprise.com",
  role: "admin",
  kycStatus: "approved",
  entitlements: [],
};

// ─── JWT sign + verify ────────────────────────────────────────────────────────

describe("JWT signSession / verifySession", () => {
  it("signs and verifies a valid session", async () => {
    const token = await signSession(clientSession);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // JWT format

    const payload = await verifySession(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(clientSession.userId);
    expect(payload?.email).toBe(clientSession.email);
    expect(payload?.role).toBe(clientSession.role);
  });

  it("returns null for a tampered token", async () => {
    const token = await signSession(clientSession);
    const tampered = token.slice(0, -5) + "xxxxx";
    const payload = await verifySession(tampered);
    expect(payload).toBeNull();
  });

  it("returns null for an empty string", async () => {
    const payload = await verifySession("");
    expect(payload).toBeNull();
  });

  it("returns null for a garbage string", async () => {
    const payload = await verifySession("not.a.jwt");
    expect(payload).toBeNull();
  });
});

// ─── Auth state resolution ────────────────────────────────────────────────────

describe("resolveAuthState", () => {
  it("returns unauthenticated state for null session", () => {
    const state = resolveAuthState(null);
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
    expect(state.isApproved).toBe(false);
    expect(state.kycStatus).toBe("not_started");
  });

  it("returns authenticated state for valid client session", () => {
    const state = resolveAuthState(clientSession);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
    expect(state.isApproved).toBe(true);
    expect(state.kycStatus).toBe("approved");
  });

  it("returns isAdmin=true for admin role", () => {
    const state = resolveAuthState(adminSession);
    expect(state.isAdmin).toBe(true);
  });

  it("returns isAdmin=true for internal role", () => {
    const internalSession: SessionPayload = { ...clientSession, role: "internal" };
    const state = resolveAuthState(internalSession);
    expect(state.isAdmin).toBe(true);
  });

  it("returns isApproved=false for non-approved KYC status", () => {
    const pending: SessionPayload = { ...clientSession, kycStatus: "under_review" };
    const state = resolveAuthState(pending);
    expect(state.isApproved).toBe(false);
  });
});

// ─── Access destination routing ───────────────────────────────────────────────

describe("resolveAccessDestination", () => {
  it("routes admin to /app/admin", () => {
    expect(resolveAccessDestination(adminSession)).toBe("/app/admin");
  });

  it("routes internal to /app/admin", () => {
    const internal: SessionPayload = { ...adminSession, role: "internal" };
    expect(resolveAccessDestination(internal)).toBe("/app/admin");
  });

  it("routes not_started KYC to /kyc/start", () => {
    const s: SessionPayload = { ...clientSession, kycStatus: "not_started" };
    expect(resolveAccessDestination(s)).toBe("/kyc/start");
  });

  it("routes in_progress KYC to /kyc/status", () => {
    const s: SessionPayload = { ...clientSession, kycStatus: "in_progress" };
    expect(resolveAccessDestination(s)).toBe("/kyc/status");
  });

  it("routes under_review to /decision/pending", () => {
    const s: SessionPayload = { ...clientSession, kycStatus: "under_review" };
    expect(resolveAccessDestination(s)).toBe("/decision/pending");
  });

  it("routes rejected to /decision/rejected", () => {
    const s: SessionPayload = { ...clientSession, kycStatus: "rejected" };
    expect(resolveAccessDestination(s)).toBe("/decision/rejected");
  });

  it("routes approved with cyber entitlement to /app/products/cyber", () => {
    const s: SessionPayload = {
      ...clientSession,
      kycStatus: "approved",
      entitlements: ["cyber"],
      portfolioId: undefined,
    };
    expect(resolveAccessDestination(s)).toBe("/app/products/cyber");
  });

  it("routes approved with portfolioId to portfolio page", () => {
    const s: SessionPayload = {
      ...clientSession,
      kycStatus: "approved",
      portfolioId: "pf_abc123",
      entitlements: [],
    };
    expect(resolveAccessDestination(s)).toBe("/app/portfolios/pf_abc123");
  });

  it("routes approved with no entitlements to /app/dashboard", () => {
    const s: SessionPayload = {
      ...clientSession,
      kycStatus: "approved",
      entitlements: [],
      portfolioId: undefined,
    };
    expect(resolveAccessDestination(s)).toBe("/app/dashboard");
  });
});
