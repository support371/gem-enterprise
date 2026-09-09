import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildMarketingUnsubscribeUrl,
  createMarketingUnsubscribeToken,
  isMarketingEmailSuppressed,
  mergeMarketingOptOutPreferences,
  verifyMarketingUnsubscribeToken,
} from "@/lib/email/marketingPreferences";

describe("marketing email compliance preferences", () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.JWT_SECRET = "marketing-preference-test-secret-that-is-long-enough";
    process.env.NEXT_PUBLIC_APP_URL = "https://www.gemcybersecurityassist.com";
  });

  afterEach(() => {
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
    if (originalAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  it("creates a signed token that resolves only to the intended user id", () => {
    const token = createMarketingUnsubscribeToken("user_123");
    expect(verifyMarketingUnsubscribeToken(token)).toBe("user_123");
    expect(token).not.toContain("user@example.com");

    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
    expect(verifyMarketingUnsubscribeToken(tampered)).toBeNull();
  });

  it("builds the unsubscribe URL on the canonical GEM host", () => {
    const url = new URL(buildMarketingUnsubscribeUrl("user_123"));
    expect(url.origin).toBe("https://www.gemcybersecurityassist.com");
    expect(url.pathname).toBe("/api/marketing/unsubscribe");
    expect(url.searchParams.get("token")).toBeTruthy();
  });

  it("preserves existing profile preferences when marketing opt-out is recorded", () => {
    const updated = mergeMarketingOptOutPreferences(
      { theme: "dark", notifications: { security: true } },
      "2026-09-09T08:45:00.000Z",
    );

    expect(updated.theme).toBe("dark");
    expect(updated.notifications).toEqual({ security: true });
    expect(updated.marketingEmailOptOut).toBe(true);
    expect(updated.marketingEmailOptOutAt).toBe("2026-09-09T08:45:00.000Z");
    expect(isMarketingEmailSuppressed(updated)).toBe(true);
  });

  it("does not suppress users without an explicit marketing opt-out", () => {
    expect(isMarketingEmailSuppressed(undefined)).toBe(false);
    expect(isMarketingEmailSuppressed({ marketingEmailOptOut: false })).toBe(false);
  });
});
