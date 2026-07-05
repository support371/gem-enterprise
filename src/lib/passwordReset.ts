import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

const RESET_ISSUER = "gem-enterprise";
const RESET_AUDIENCE = "gem-password-reset";
const RESET_PURPOSE = "password_reset";
const RESET_TTL_SECONDS = 15 * 60;

type PasswordResetClaims = {
  userId: string;
  email: string;
  passwordFingerprint: string;
};

function getPasswordResetSecret(): Uint8Array {
  const secret = process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("PASSWORD_RESET_SECRET or JWT_SECRET is required in production.");
    }
    return new TextEncoder().encode("gem-password-reset-dev-secret-change-me");
  }
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("Password reset signing secret must be at least 32 characters in production.");
  }
  return new TextEncoder().encode(secret);
}

export function fingerprintPasswordHash(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex");
}

export function passwordFingerprintsMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function createPasswordResetToken(input: {
  userId: string;
  email: string;
  passwordHash: string;
}): Promise<string> {
  return new SignJWT({
    purpose: RESET_PURPOSE,
    email: input.email,
    passwordFingerprint: fingerprintPasswordHash(input.passwordHash),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(RESET_ISSUER)
    .setAudience(RESET_AUDIENCE)
    .setSubject(input.userId)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${RESET_TTL_SECONDS}s`)
    .sign(getPasswordResetSecret());
}

export async function verifyPasswordResetToken(token: string): Promise<PasswordResetClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getPasswordResetSecret(), {
      issuer: RESET_ISSUER,
      audience: RESET_AUDIENCE,
    });
    if (
      payload.purpose !== RESET_PURPOSE ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.passwordFingerprint !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.sub,
      email: payload.email,
      passwordFingerprint: payload.passwordFingerprint,
    };
  } catch {
    return null;
  }
}
