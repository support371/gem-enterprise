import { describe, expect, it } from "vitest";
import type { SessionPayload } from "@/lib/auth";
import { reconcileSessionAuthority } from "@/lib/auth-authority";

const claims: SessionPayload = {
  userId: "user-1",
  email: "old@example.com",
  role: "client",
  kycStatus: "approved",
  entitlements: [],
  organizationId: "org-old",
  sessionVersion: 3,
};

const account = {
  id: "user-1",
  email: "current@example.com",
  role: "admin",
  status: "active" as const,
  isActive: true,
  organizationId: "org-current",
  sessionVersion: 3,
};

describe("session authority reconciliation", () => {
  it("refreshes mutable claims from the account record", () => {
    const result = reconcileSessionAuthority(claims, account);
    expect(result).toMatchObject({
      ok: true,
      claimsChanged: true,
      accountStatus: "active",
      session: {
        email: "current@example.com",
        role: "admin",
        organizationId: "org-current",
        sessionVersion: 3,
      },
    });
  });

  it("rejects suspended accounts", () => {
    expect(
      reconcileSessionAuthority(claims, {
        ...account,
        status: "suspended",
      }),
    ).toMatchObject({
      ok: false,
      statusCode: 403,
      code: "SESSION_ACCOUNT_DISABLED",
    });
  });

  it("rejects deleted accounts", () => {
    expect(reconcileSessionAuthority(claims, null)).toMatchObject({
      ok: false,
      statusCode: 401,
      code: "SESSION_ACCOUNT_NOT_FOUND",
    });
  });

  it("rejects every token issued before a password-version increment", () => {
    expect(
      reconcileSessionAuthority(claims, {
        ...account,
        sessionVersion: 4,
      }),
    ).toMatchObject({
      ok: false,
      statusCode: 401,
      code: "SESSION_REVOKED",
    });
  });

  it("rejects legacy unversioned sessions", () => {
    expect(
      reconcileSessionAuthority({ ...claims, sessionVersion: undefined }, account),
    ).toMatchObject({
      ok: false,
      statusCode: 401,
      code: "SESSION_REVOKED",
    });
  });
});
