import { describe, expect, it } from "vitest";
import type { SessionPayload } from "@/lib/auth";
import { reconcileSessionAuthority } from "@/lib/auth-authority";

const claims: SessionPayload = {
  userId: "user-1",
  email: "old@example.com",
  role: "admin",
  kycStatus: "approved",
  entitlements: [],
};

describe("authoritative session reconciliation", () => {
  it("replaces stale role and email claims with the current account values", () => {
    const result = reconcileSessionAuthority(claims, {
      id: "user-1",
      email: "current@example.com",
      role: "client",
      status: "active",
      isActive: true,
      organizationId: null,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.session.role).toBe("client");
    expect(result.session.email).toBe("current@example.com");
    expect(result.claimsChanged).toBe(true);
  });

  it("rejects a session whose account was removed", () => {
    const result = reconcileSessionAuthority(claims, null);
    expect(result).toMatchObject({
      ok: false,
      statusCode: 401,
      code: "SESSION_ACCOUNT_NOT_FOUND",
    });
  });

  it("rejects a suspended account even with an older admin claim", () => {
    const result = reconcileSessionAuthority(claims, {
      id: "user-1",
      email: "old@example.com",
      role: "admin",
      status: "suspended",
      isActive: true,
      organizationId: null,
    });
    expect(result).toMatchObject({
      ok: false,
      statusCode: 403,
      code: "SESSION_ACCOUNT_DISABLED",
    });
  });

  it("rejects an inactive account", () => {
    const result = reconcileSessionAuthority(claims, {
      id: "user-1",
      email: "old@example.com",
      role: "admin",
      status: "active",
      isActive: false,
      organizationId: null,
    });
    expect(result.ok).toBe(false);
  });
});
