/**
 * Auth unit tests
 *
 * Covers: JWT sign/verify, session cookie helpers, auth state resolution,
 * access destination routing, and production JWT secret enforcement.
 */

import { describe, it, expect } from "vitest";
import {
  signSession,
  verifySession,
  resolveAuthState,
  resolveAccessDestination,
} from "@/lib/auth";
import type { SessionPayload } from "@/lib/auth";

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

describe("JWT signSession / verifySession", () => {
  it("signs and verifies a valid session", async () => {
    const token = await signSession(clientSession);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const payload = await verifySession(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(clientSession.userId);
    expect(payload?.email).toBe(clientSession.email);
    expect(payload?.role).toBe(clientSession.role);
  });

  it("returns null for a tampered token", async () => {
    const token = await signSession(clientSession);
    const tampered = token.slice(0, -5) + "xxxxx";
    expect(await verifySession(tampered)).toBeNull();
  });

  it("returns null for an empty string", async () => {
    expect(await verifySession("")).toBeNull();
  });

  it("returns null for a garbage string", async () => {
    expect(await verifySession("not.a.jwt")).toBeNull();
  });
});

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
    expect(resolveAuthState(adminSession).isAdmin).toBe(true);
  });

  it("returns isAdmin=true for internal role", () => {
    const internalSession: SessionPayload = { ...clientSession, role: "internal" };
    expect(resolveAuthState(internalSession).isAdmin).toBe(true);
  });

  it("returns isApproved=false for non-approved KYC status", () => {
    const pending: SessionPayload = { ...clientSession, kycStatus: "under_review" };
    expect(resolveAuthState(pending).isApproved).toBe(false);
  });
});

describe("resolveAccessDestination", () => {
  it("routes admin to /app/admin", () => {
    expect(resolveAccessDestination(adminSession)).toBe("/app/admin");
  });

  it("routes internal to /app/admin", () => {
    const internal: SessionPayload = { ...adminSession, role: "internal" };
    expect(resolveAccessDestination(internal)).toBe("/app/admin");
  });

  it("routes analysts to the manual review queue", () => {
    const analyst: SessionPayload = { ...adminSession, role: "analyst" };
    expect(resolveAccessDestination(analyst)).toBe("/review/verification");
  });

  it("routes not_started KYC to /kyc/start", () => {
    const session: SessionPayload = { ...clientSession, kycStatus: "not_started" };
    expect(resolveAccessDestination(session)).toBe("/kyc/start");
  });

  it("routes in_progress KYC to /kyc/status", () => {
    const session: SessionPayload = { ...clientSession, kycStatus: "in_progress" };
    expect(resolveAccessDestination(session)).toBe("/kyc/status");
  });

  it("routes under_review to the authenticated case status page", () => {
    const session: SessionPayload = { ...clientSession, kycStatus: "under_review" };
    expect(resolveAccessDestination(session)).toBe("/decision/pending");
  });

  it("routes manual review, rejection, and closure to unified case status", () => {
    expect(
      resolveAccessDestination({ ...clientSession, kycStatus: "manual_review" }),
    ).toBe("/kyc/status");
    expect(
      resolveAccessDestination({ ...clientSession, kycStatus: "rejected" }),
    ).toBe("/kyc/status");
    expect(
      resolveAccessDestination({ ...clientSession, kycStatus: "expired" }),
    ).toBe("/kyc/status");
  });

  it("routes approved with cyber entitlement to /app/products/cyber", () => {
    const session: SessionPayload = {
      ...clientSession,
      kycStatus: "approved",
      entitlements: ["cyber"],
      portfolioId: undefined,
    };
    expect(resolveAccessDestination(session)).toBe("/app/products/cyber");
  });

  it("routes approved with portfolioId to portfolio page", () => {
    const session: SessionPayload = {
      ...clientSession,
      kycStatus: "approved",
      portfolioId: "pf_abc123",
      entitlements: [],
    };
    expect(resolveAccessDestination(session)).toBe("/app/portfolios/pf_abc123");
  });

  it("routes approved with no entitlements to /app/dashboard", () => {
    const session: SessionPayload = {
      ...clientSession,
      kycStatus: "approved",
      entitlements: [],
      portfolioId: undefined,
    };
    expect(resolveAccessDestination(session)).toBe("/app/dashboard");
  });
});
