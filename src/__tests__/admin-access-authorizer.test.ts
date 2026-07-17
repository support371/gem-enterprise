import { describe, expect, it } from "vitest";
import {
  ADMIN_ACCESS_EMAIL,
  buildAdminAccessSql,
  generateAdminAccessAuthorization,
  parseAdminAccessAuthorization,
  serializeAdminAccessAuthorization,
  type AdminAccessAuthorization,
} from "@/lib/admin-access-authorizer";

const tokenHash = "a".repeat(64);
const requestId = `aar_${"b".repeat(32)}`;
const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

describe("browser-local administrator authorization", () => {
  it("builds a constrained one-time insert without exposing a user ID", () => {
    const sql = buildAdminAccessSql({ tokenHash, requestId, expiresAt });

    expect(sql).toContain("insert into public.admin_access_tokens");
    expect(sql).toContain(`where email = '${ADMIN_ACCESS_EMAIL}'`);
    expect(sql).toContain("and role in ('admin', 'super_admin', 'internal')");
    expect(sql).toContain('and "isActive" = true');
    expect(sql).toContain('and "isEmailVerified" = true');
    expect(sql).toContain(tokenHash);
    expect(sql).toContain(requestId);
    expect(sql).toContain("returning id, expires_at");
    expect(sql).not.toContain("password");
    expect(sql).not.toContain("service_role");
    expect(sql).not.toMatch(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
  });

  it("generates a capability cryptographically bound to its request ID", async () => {
    const authorization = await generateAdminAccessAuthorization();

    expect(authorization.requestId).toMatch(/^aar_[a-f0-9]{32}$/);
    expect(authorization.token).toMatch(
      new RegExp(`^${authorization.requestId}\\.[A-Za-z0-9_-]{48,128}$`),
    );
    expect(authorization.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(authorization.sql).toContain(authorization.requestId);
    expect(authorization.sql).toContain(authorization.tokenHash);
    expect(authorization.sql).not.toContain(authorization.token);
  });

  it("does not place the usable capability in the SQL statement", () => {
    const token = `${requestId}.${"c".repeat(64)}`;
    const authorization: AdminAccessAuthorization = {
      token,
      tokenHash,
      requestId,
      expiresAt,
      sql: buildAdminAccessSql({ tokenHash, requestId, expiresAt }),
    };

    expect(authorization.sql).not.toContain(token);
    expect(
      parseAdminAccessAuthorization(
        serializeAdminAccessAuthorization(authorization),
      ),
    ).toEqual(authorization);
  });

  it("rejects expired, unbound, or token-leaking session records", () => {
    const expiredAt = new Date(Date.now() - 1_000).toISOString();
    expect(() =>
      buildAdminAccessSql({ tokenHash, requestId, expiresAt: expiredAt }),
    ).toThrow(/expiry/);

    const unbound: AdminAccessAuthorization = {
      token: `${`aar_${"d".repeat(32)}`}.${"x".repeat(64)}`,
      tokenHash,
      requestId,
      expiresAt,
      sql: buildAdminAccessSql({ tokenHash, requestId, expiresAt }),
    };
    expect(
      parseAdminAccessAuthorization(serializeAdminAccessAuthorization(unbound)),
    ).toBeNull();

    const token = `${requestId}.${"x".repeat(64)}`;
    const leaking: AdminAccessAuthorization = {
      token,
      tokenHash,
      requestId,
      expiresAt,
      sql: `select '${token}'`,
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
