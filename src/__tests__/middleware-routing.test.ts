/**
 * Middleware and access-routing unit tests.
 *
 * The Next.js proxy is integration-tested by previews. These tests keep the
 * critical route and destination policy explicit and deterministic.
 */

import { describe, expect, it } from "vitest";
import { resolveAccessDestination } from "@/lib/auth";
import type { SessionPayload } from "@/lib/auth";

const PROTECTED_PREFIXES = [
  "/app",
  "/kyc",
  "/decision",
  "/portal",
  "/access",
  "/review",
];
const ADMIN_PREFIXES = ["/app/admin"];
const REVIEW_PREFIXES = ["/review"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isProtected(pathname: string): boolean {
  return matchesPrefix(pathname, PROTECTED_PREFIXES);
}

function isAdminRoute(pathname: string): boolean {
  return matchesPrefix(pathname, ADMIN_PREFIXES);
}

function isReviewRoute(pathname: string): boolean {
  return matchesPrefix(pathname, REVIEW_PREFIXES);
}

describe("protected route matching", () => {
  it.each([
    "/app",
    "/app/dashboard",
    "/app/admin",
    "/app/admin/kyc",
    "/kyc",
    "/kyc/start",
    "/kyc/individual",
    "/decision",
    "/decision/pending",
    "/portal",
    "/access",
    "/access/restricted",
    "/review",
    "/review/verification",
  ])("marks %s as protected", (path) => {
    expect(isProtected(path)).toBe(true);
  });

  it.each([
    "/",
    "/intel",
    "/about",
    "/contact",
    "/resources",
    "/get-started",
    "/client-login",
    "/api/health",
    "/privacy",
    "/terms",
  ])("does not mark %s as protected", (path) => {
    expect(isProtected(path)).toBe(false);
  });
});

describe("role route matching", () => {
  it.each([
    "/app/admin",
    "/app/admin/kyc",
    "/app/admin/users",
    "/app/admin/approvals",
  ])("marks %s as admin route", (path) => {
    expect(isAdminRoute(path)).toBe(true);
  });

  it("keeps the verification queue separate from admin-only routes", () => {
    expect(isAdminRoute("/review/verification")).toBe(false);
    expect(isReviewRoute("/review/verification")).toBe(true);
    expect(isReviewRoute("/app/dashboard")).toBe(false);
  });
});

describe("resolveAccessDestination — verification state gates", () => {
  const base: SessionPayload = {
    userId: "usr_001",
    email: "test@example.com",
    role: "client",
    kycStatus: "not_started",
    entitlements: [],
  };

  it("not_started → /kyc/start", () => {
    expect(resolveAccessDestination({ ...base, kycStatus: "not_started" })).toBe(
      "/kyc/start",
    );
  });

  it.each(["started", "in_progress", "documents_uploaded"] as const)(
    "%s → /kyc/status",
    (kycStatus) => {
      expect(resolveAccessDestination({ ...base, kycStatus })).toBe("/kyc/status");
    },
  );

  it("under_review → /decision/pending", () => {
    expect(resolveAccessDestination({ ...base, kycStatus: "under_review" })).toBe(
      "/decision/pending",
    );
  });

  it.each(["manual_review", "rejected", "expired"] as const)(
    "%s → unified /kyc/status",
    (kycStatus) => {
      expect(resolveAccessDestination({ ...base, kycStatus })).toBe("/kyc/status");
    },
  );

  it("analyst → /review/verification regardless of applicant state", () => {
    expect(
      resolveAccessDestination({
        ...base,
        role: "analyst",
        kycStatus: "approved",
      }),
    ).toBe("/review/verification");
  });
});

describe("resolveAccessDestination — entitlement routing after approval", () => {
  const approved: SessionPayload = {
    userId: "usr_001",
    email: "test@example.com",
    role: "client",
    kycStatus: "approved",
    entitlements: [],
  };

  it("portfolioId takes priority over entitlements", () => {
    expect(
      resolveAccessDestination({
        ...approved,
        portfolioId: "pf_xyz",
        entitlements: ["cyber"],
      }),
    ).toBe("/app/portfolios/pf_xyz");
  });

  it.each([
    ["cyber", "/app/products/cyber"],
    ["financial", "/app/products/financial"],
    ["real-estate", "/app/products/real-estate"],
  ])("%s entitlement → %s", (entitlement, destination) => {
    expect(
      resolveAccessDestination({ ...approved, entitlements: [entitlement] }),
    ).toBe(destination);
  });

  it("no entitlements → /app/dashboard", () => {
    expect(resolveAccessDestination(approved)).toBe("/app/dashboard");
  });
});
