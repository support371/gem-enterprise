import { describe, expect, it } from "vitest";
import {
  ADMIN_ACCESS_USER_ID,
  buildAdminAccessSql,
  parseAdminAccessAuthorization,
  serializeAdminAccessAuthorization,
  type AdminAccessAuthorization,
} from "@/lib/admin-access-authorizer";

const tokenHash = "a".repeat(64);
const requestId = `aar_${"b".repeat(32)}`;
const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

describe("browser-local administrator authorization", () => {
  it("builds a narrowly scoped one-time insert statement", () => {
    const sql = buildAdminAccessSql({ tokenHash, requestId, expiresAt });

    expect(sql).toContain("insert into public.admin_access_tokens");
    expect(sql).toContain(ADMIN_ACCESS_USER_ID);
    expect(sql).toContain(tokenHash);
    expect(sql).toContain(requestId);
    expect(sql).toContain(new Date(expiresAt).toISOString());
    expect(sql).toContain("returning id, expires_at");
    expect(sql).not.toContain("password");
    expect(sql).not.toContain("service_role");
  });

  it("does not place the usable capability in the SQL statement", () => {
    const token = "local-only-capability-that-must-not-appear-in-sql";
    const authorization: AdminAccessAuthorization = {
      token,
      tokenHash,
      requestId,
      expiresAt,
      sql: buildAdminAccessSql({ tokenHash, requestId, expiresAt }),
    };

    expect(authorization.sql).not.toContain(token);
    expect(parseAdminAccessAuthorization(
      serializeAdminAccessAuthorization(authorization),
    )).toEqual(authorization);
  });

  it("rejects expired or token-leaking session records", () => {
    const expired: AdminAccessAuthorization = {
      token: "x".repeat(48),
      tokenHash,
      requestId,
      expiresAt: new Date(Date.now() - 1_000).toISOString(),
      sql: buildAdminAccessSql({
        tokenHash,
        requestId,
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
      }),
    };
    expect(
      parseAdminAccessAuthorization(serializeAdminAccessAuthorization(expired)),
    ).toBeNull();

    const leaking: AdminAccessAuthorization = {
      ...expired,
      expiresAt,
      sql: `select '${expired.token}'`,
    };
    expect(
      parseAdminAccessAuthorization(serializeAdminAccessAuthorization(leaking)),
    ).toBeNull();
  });

  it("rejects malformed hashes and request identifiers", () => {
    expect(() =>
      buildAdminAccessSql({
        tokenHash: "not-a-hash",
        requestId,
        expiresAt,
      }),
    ).toThrow(/SHA-256/);

    expect(() =>
      buildAdminAccessSql({
        tokenHash,
        requestId: "invalid-request",
        expiresAt,
      }),
    ).toThrow(/request ID/);
  });
});
