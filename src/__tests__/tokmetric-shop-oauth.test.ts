import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildTikTokShopAuthorizationUrl } from "@/lib/tokmetric/shop/client";
import { validateTikTokShopConfig } from "@/lib/tokmetric/shop/config";

const originalEnv = process.env;

describe("TikTok Shop seller OAuth", () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      TIKTOK_SHOP_OAUTH_ENABLED: "true",
      TIKTOK_SHOP_API_ACCESS_APPROVED: "true",
      TIKTOK_SHOP_ENVIRONMENT: "sandbox",
      TIKTOK_SHOP_REGION: "US",
      TIKTOK_SHOP_APP_KEY: "shop-app-key",
      TIKTOK_SHOP_APP_SECRET: "shop-app-secret",
      TIKTOK_SHOP_SERVICE_ID: "service-123",
      TIKTOK_SHOP_REDIRECT_URI: "https://example.test/api/tokmetric/shop/oauth/callback",
      TOKMETRIC_TOKEN_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("requires explicit Shop approval and isolated Shop credentials", () => {
    expect(validateTikTokShopConfig()).toMatchObject({ ok: true, missing: [] });
  });

  it("builds a Seller Center authorization URL without exposing the app secret", () => {
    const url = buildTikTokShopAuthorizationUrl("signed-state");
    expect(url.origin).toBe("https://services.us.tiktokshop.com");
    expect(url.searchParams.get("service_id")).toBe("service-123");
    expect(url.searchParams.get("state")).toBe("signed-state");
    expect(url.toString()).not.toContain("shop-app-secret");
  });

  it("fails closed while provider approval is absent", () => {
    process.env.TIKTOK_SHOP_API_ACCESS_APPROVED = "false";
    expect(validateTikTokShopConfig()).toMatchObject({ ok: false });
    expect(validateTikTokShopConfig().missing).toContain("TIKTOK_SHOP_API_ACCESS_APPROVED");
  });
});
