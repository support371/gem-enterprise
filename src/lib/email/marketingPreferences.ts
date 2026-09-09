import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = 1;
const KEY_PURPOSE = "gem-marketing-unsubscribe-v1";

export type MarketingPreferences = {
  marketingEmailOptOut?: boolean;
  marketingEmailOptOutAt?: string;
};

function getSigningKey(): Buffer {
  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required for marketing preference tokens");
  }

  return createHmac("sha256", jwtSecret).update(KEY_PURPOSE, "utf8").digest();
}

function encodePayload(payload: object): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getSigningKey())
    .update(encodedPayload, "utf8")
    .digest("base64url");
}

export function createMarketingUnsubscribeToken(userId: string): string {
  const encodedPayload = encodePayload({ v: TOKEN_VERSION, userId });
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyMarketingUnsubscribeToken(token: string): string | null {
  const [encodedPayload, signature, ...extra] = token.split(".");
  if (!encodedPayload || !signature || extra.length > 0) return null;

  const expected = sign(encodedPayload);
  const receivedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (receivedBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(receivedBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as { v?: unknown; userId?: unknown };
    if (payload.v !== TOKEN_VERSION) return null;
    if (typeof payload.userId !== "string" || !payload.userId.trim()) return null;
    return payload.userId;
  } catch {
    return null;
  }
}

export function buildMarketingUnsubscribeUrl(userId: string): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "https://www.gemcybersecurityassist.com";
  const url = new URL("/api/marketing/unsubscribe", configured.replace(/\/$/, ""));
  url.searchParams.set("token", createMarketingUnsubscribeToken(userId));
  return url.toString();
}

export function getMarketingPreferences(value: unknown): MarketingPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  return {
    marketingEmailOptOut:
      input.marketingEmailOptOut === true ? true : undefined,
    marketingEmailOptOutAt:
      typeof input.marketingEmailOptOutAt === "string"
        ? input.marketingEmailOptOutAt
        : undefined,
  };
}

export function isMarketingEmailSuppressed(value: unknown): boolean {
  return getMarketingPreferences(value).marketingEmailOptOut === true;
}

export function mergeMarketingOptOutPreferences(
  value: unknown,
  optedOutAt = new Date().toISOString(),
): Record<string, unknown> {
  const existing =
    value && typeof value === "object" && !Array.isArray(value)
      ? { ...(value as Record<string, unknown>) }
      : {};
  return {
    ...existing,
    marketingEmailOptOut: true,
    marketingEmailOptOutAt: optedOutAt,
  };
}
