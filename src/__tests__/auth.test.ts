import { afterEach, describe, expect, it } from "vitest";
import { resolveAccessDestination, signSession, verifySession } from "@/lib/auth";
import type { IssuedSessionPayload } from "@/lib/auth";

const clientSession: IssuedSessionPayload = {
  userId: "usr_test",
  email: "client@example.com",
  role: "client",
  kycStatus: "approved",
  entitlements: ["cyber"],
  sessionVersion: 0,
};

const originalSecret = process.env.JWT_SECRET;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
});

describe("session JWT", () => {
  it("signs and verifies a versioned session", async () => {
    process.env.JWT_SECRET = "test-secret-that-is-longer-than-32-characters";
    const token = await signSession(clientSession);
    const verified = await verifySession(token);
    expect(verified).toMatchObject({
      userId: clientSession.userId,
      role: "client",
      sessionVersion: 0,
      authSource: "local",
    });
  });

  it("rejects a tampered token", async () => {
    process.env.JWT_SECRET = "test-secret-that-is-longer-than-32-characters";
    const token = await signSession(clientSession);
    await expect(verifySession(`${token.slice(0, -1)}x`)).resolves.toBeNull();
  });

  it("requires a production JWT secret", async () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = "production";
    await expect(signSession(clientSession)).rejects.toThrow(/JWT_SECRET/);
  });
});

describe("access destination", () => {
  it("routes administrator accounts to the admin center", () => {
    expect(resolveAccessDestination({ ...clientSession, role: "admin" })).toBe("/app/admin");
  });

  it("routes analysts to the verification queue", () => {
    expect(resolveAccessDestination({ ...clientSession, role: "analyst" })).toBe(
      "/review/verification",
    );
  });

  it("routes unverified clients into KYC", () => {
    expect(
      resolveAccessDestination({ ...clientSession, kycStatus: "not_started" }),
    ).toBe("/kyc/start");
  });

  it("routes approved clients by entitlement", () => {
    expect(resolveAccessDestination(clientSession)).toBe("/app/products/cyber");
  });
});
