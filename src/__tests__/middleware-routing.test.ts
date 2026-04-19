/**
 * Middleware routing unit tests
 *
 * Covers: protected prefix matching, admin route detection, and the
 * access destination routing logic used by the middleware.
 *
 * The middleware itself (NextRequest/NextResponse) cannot be unit tested
 * without a full Next.js test runtime, so these tests cover the pure
 * helper functions extracted from middleware.ts and auth.ts.
 */

import { describe, it, expect } from "vitest";
import { resolveAccessDestination, resolveAuthState } from "@/lib/auth";
import type { SessionPayload } from "@/lib/auth";

// ─── Route protection helper (mirrors middleware.ts logic) ────────────────────

const PROTECTED_PREFIXES = ["/app", "/kyc", "/decision", "/portal", "/access"];
const ADMIN_PREFIXES = ["/app/admin"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

// ─── Protected prefix matching ────────────────────────────────────────────────

describe("isProtected", () => {
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

// ─── Admin route matching ─────────────────────────────────────────────────────

describe("isAdminRoute", () => {
  it.each([
    "/app/admin",
    "/app/admin/kyc",
    "/app/admin/users",
    "/app/admin/approvals",
    "/app/admin/allocations",
  ])("marks %s as admin route", (path) => {
    expect(isAdminRoute(path)).toBe(true);
  });

  it.each(["/app/dashboard", "/app/security", "/app/requests"])(
    "does not mark %s as admin route",
    (path) => {
      expect(isAdminRoute(path)).toBe(false);
    }
  );
});

// ─── KYC-state routing (critical for access control) ─────────────────────────

describe("resolveAccessDestination — KYC state gates", () => {
  const base: SessionPayload = {
    userId: "usr_001",
    email: "test@example.com",
    role: "client",
    kycStatus: "not_started",
    entitlements: [],
  };

  it("not_started → /kyc/start", () => {
    expect(resolveAccessDestination({ ...base, kycStatus: "not_started" })).toBe("/kyc/start");
  });

  it("started → /kyc/status", () => {
    expect(resolveAccessDestination({ ...base, kycStatus: "started" })).toBe("/kyc/status");
  });

  it("in_progress → /kyc/status", () => {
    expect(resolveAccessDestination({ ...base, kycStatus: "in_progress" })).toBe("/kyc/status");
  });

  it("documents_uploaded → /kyc/status", () => {
    expect(
      resolveAccessDestination({ ...base, kycStatus: "documents_uploaded" })
    ).toBe("/kyc/status");
  });

  it("under_review → /decision/pending", () => {
    expect(resolveAccessDestination({ ...base, kycStatus: "under_review" })).toBe(
      "/decision/pending"
    );
  });

  it("manual_review → /decision/manual-review", () => {
    expect(resolveAccessDestination({ ...base, kycStatus: "manual_review" })).toBe(
      "/decision/manual-review"
    );
  });

  it("rejected → /decision/rejected", () => {
    expect(resolveAccessDestination({ ...base, kycStatus: "rejected" })).toBe("/decision/rejected");
  });

  it("expired → /decision/rejected", () => {
    expect(resolveAccessDestination({ ...base, kycStatus: "expired" })).toBe("/decision/rejected");
  });
});

// ─── Entitlement routing after approval ───────────────────────────────────────

describe("resolveAccessDestination — entitlement routing (approved KYC)", () => {
  const approved: SessionPayload = {
    userId: "usr_001",
    email: "test@example.com",
    role: "client",
    kycStatus: "approved",
    entitlements: [],
  };

  it("portfolioId takes priority over entitlements", () => {
    expect(
      resolveAccessDestination({ ...approved, portfolioId: "pf_xyz", entitlements: ["cyber"] })
    ).toBe("/app/portfolios/pf_xyz");
  });

  it("cyber entitlement → /app/products/cyber", () => {
    expect(
      resolveAccessDestination({ ...approved, entitlements: ["cyber"] })
    ).toBe("/app/products/cyber");
  });

  it("financial entitlement → /app/products/financial", () => {
    expect(
      resolveAccessDestination({ ...approved, entitlements: ["financial"] })
    ).toBe("/app/products/financial");
  });

  it("real-estate entitlement → /app/products/real-estate", () => {
    expect(
      resolveAccessDestination({ ...approved, entitlements: ["real-estate"] })
    ).toBe("/app/products/real-estate");
  });

  it("no entitlements → /app/dashboard", () => {
    expect(resolveAccessDestination(approved)).toBe("/app/dashboard");
  });
});
