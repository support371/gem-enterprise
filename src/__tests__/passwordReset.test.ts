import { afterEach, describe, expect, it } from "vitest";
import {
  createPasswordResetToken,
  fingerprintPasswordHash,
  passwordFingerprintsMatch,
  verifyPasswordResetToken,
} from "@/lib/passwordReset";

const previousSecret = process.env.PASSWORD_RESET_SECRET;

afterEach(() => {
  if (previousSecret === undefined) delete process.env.PASSWORD_RESET_SECRET;
  else process.env.PASSWORD_RESET_SECRET = previousSecret;
});

describe("password reset tokens", () => {
  it("round-trips signed claims without exposing the password hash", async () => {
    process.env.PASSWORD_RESET_SECRET = "test-password-reset-secret-at-least-32-characters";
    const passwordHash = "$2a$12$example-current-password-hash";
    const token = await createPasswordResetToken({
      userId: "user_123",
      email: "member@example.com",
      passwordHash,
    });

    expect(token).not.toContain(passwordHash);
    await expect(verifyPasswordResetToken(token)).resolves.toEqual({
      userId: "user_123",
      email: "member@example.com",
      passwordFingerprint: fingerprintPasswordHash(passwordHash),
    });
  });

  it("rejects a token signed with a different secret", async () => {
    process.env.PASSWORD_RESET_SECRET = "first-password-reset-secret-at-least-32-characters";
    const token = await createPasswordResetToken({
      userId: "user_123",
      email: "member@example.com",
      passwordHash: "hash-a",
    });
    process.env.PASSWORD_RESET_SECRET = "second-password-reset-secret-at-least-32-characters";

    await expect(verifyPasswordResetToken(token)).resolves.toBeNull();
  });

  it("invalidates reset claims after the stored password hash changes", () => {
    const original = fingerprintPasswordHash("hash-a");
    const changed = fingerprintPasswordHash("hash-b");
    expect(passwordFingerprintsMatch(original, original)).toBe(true);
    expect(passwordFingerprintsMatch(original, changed)).toBe(false);
  });
});
