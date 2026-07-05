import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createPasswordResetToken,
  fingerprintPasswordHash,
  passwordFingerprintsMatch,
  verifyPasswordResetToken,
} from "@/lib/passwordReset";

describe("production compliance and account recovery", () => {
  it("includes the required public compliance and recovery pages", () => {
    for (const path of [
      "src/app/cookie-policy/page.tsx",
      "src/app/trust-center/page.tsx",
      "src/app/forgot-password/page.tsx",
      "src/app/reset-password/page.tsx",
      "src/app/robots.txt/route.ts",
      "src/app/sitemap.xml/route.ts",
    ]) {
      expect(fs.existsSync(path), path).toBe(true);
    }
  });

  it("keeps sensitive community and administrative routes behind the proxy", () => {
    const proxy = fs.readFileSync("src/proxy.ts", "utf8");
    for (const route of [
      "/community-hub/members",
      "/community-hub/messages",
      "/community-hub/requests",
      "/community-hub/profile",
      "/community-hub/settings",
      "/community-hub/opportunities",
      "/admin",
      "/review",
      "/compliance/admin",
    ]) {
      expect(proxy).toContain(route);
    }
    expect(proxy).toContain('"/reset-password"');
  });

  it("links the dedicated cookie policy and trust center from the footer", () => {
    const footer = fs.readFileSync("src/components/Footer.tsx", "utf8");
    expect(footer).toContain('path: "/cookie-policy"');
    expect(footer).toContain('path: "/trust-center"');
  });

  it("creates a verifiable, purpose-bound password reset token", async () => {
    const passwordHash = "$2a$12$example-current-password-hash";
    const token = await createPasswordResetToken({
      userId: "user_test_1",
      email: "client@example.com",
      passwordHash,
    });
    const claims = await verifyPasswordResetToken(token);

    expect(claims).toEqual({
      userId: "user_test_1",
      email: "client@example.com",
      passwordFingerprint: fingerprintPasswordHash(passwordHash),
    });
  });

  it("invalidates a reset token fingerprint after the stored password changes", () => {
    const before = fingerprintPasswordHash("stored-password-hash-before");
    const after = fingerprintPasswordHash("stored-password-hash-after");

    expect(passwordFingerprintsMatch(before, before)).toBe(true);
    expect(passwordFingerprintsMatch(after, before)).toBe(false);
  });
});
