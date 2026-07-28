import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildNewsletterConfirmationUrl,
  createNewsletterToken,
  hashNewsletterIp,
  hashNewsletterToken,
  newsletterSubscribeSchema,
  normalizeNewsletterEmail,
} from "@/lib/newsletter/subscription";

describe("newsletter subscription controls", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes email addresses before persistence", () => {
    expect(normalizeNewsletterEmail("  User@Example.COM ")).toBe(
      "user@example.com",
    );
  });

  it("requires explicit consent", () => {
    expect(
      newsletterSubscribeSchema.safeParse({
        email: "user@example.com",
        consent: false,
      }).success,
    ).toBe(false);

    expect(
      newsletterSubscribeSchema.safeParse({
        email: "user@example.com",
        consent: true,
      }).success,
    ).toBe(true);
  });

  it("creates opaque tokens and stores only deterministic hashes", () => {
    const token = createNewsletterToken();
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(hashNewsletterToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashNewsletterToken(token)).toBe(hashNewsletterToken(token));
    expect(hashNewsletterToken(token)).not.toContain(token);
  });

  it("does not retain an IP-derived value without a managed privacy salt", () => {
    vi.stubEnv("NEWSLETTER_PRIVACY_SALT", "");
    expect(hashNewsletterIp("203.0.113.10")).toBeNull();
  });

  it("uses a keyed one-way IP hash when the privacy salt is configured", () => {
    vi.stubEnv("NEWSLETTER_PRIVACY_SALT", "managed-test-salt");
    const first = hashNewsletterIp("203.0.113.10");
    const second = hashNewsletterIp("203.0.113.10");
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).toBe(second);
    expect(first).not.toContain("203.0.113.10");
  });

  it("builds confirmation links only on the configured GEM origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.gemcybersecurityassist.com/");
    const url = new URL(buildNewsletterConfirmationUrl("opaque-token"));
    expect(url.origin).toBe("https://www.gemcybersecurityassist.com");
    expect(url.pathname).toBe("/api/newsletter/confirm");
    expect(url.searchParams.get("token")).toBe("opaque-token");
  });
});
