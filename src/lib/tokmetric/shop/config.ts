import { z } from "zod";

export const tiktokShopEnvironmentSchema = z.enum(["sandbox", "production"]);
export type TikTokShopEnvironment = z.infer<typeof tiktokShopEnvironmentSchema>;

export function getTikTokShopConfig() {
  const environment = tiktokShopEnvironmentSchema
    .catch("sandbox")
    .parse(process.env.TIKTOK_SHOP_ENVIRONMENT);
  const region = (process.env.TIKTOK_SHOP_REGION || "US").trim().toUpperCase();
  return {
    environment,
    region,
    enabled: process.env.TIKTOK_SHOP_OAUTH_ENABLED === "true",
    apiAccessApproved: process.env.TIKTOK_SHOP_API_ACCESS_APPROVED === "true",
    appKey: (process.env.TIKTOK_SHOP_APP_KEY || "").trim(),
    appSecret: (process.env.TIKTOK_SHOP_APP_SECRET || "").trim(),
    serviceId: (process.env.TIKTOK_SHOP_SERVICE_ID || "").trim(),
    redirectUri: (process.env.TIKTOK_SHOP_REDIRECT_URI || "").trim(),
    authorizationUrl:
      process.env.TIKTOK_SHOP_AUTHORIZATION_URL?.trim() ||
      (region === "US"
        ? "https://services.us.tiktokshop.com/open/authorize"
        : "https://services.tiktokshop.com/open/authorize"),
    tokenUrl:
      process.env.TIKTOK_SHOP_TOKEN_URL?.trim() ||
      "https://auth.tiktok-shops.com/api/v2/token/get",
    refreshUrl:
      process.env.TIKTOK_SHOP_REFRESH_URL?.trim() ||
      "https://auth.tiktok-shops.com/api/v2/token/refresh",
    apiOrigin:
      process.env.TIKTOK_SHOP_API_ORIGIN?.trim() ||
      "https://open-api.tiktokglobalshop.com",
  };
}

export function validateTikTokShopConfig() {
  const config = getTikTokShopConfig();
  const missing: string[] = [];
  if (!config.enabled) missing.push("TIKTOK_SHOP_OAUTH_ENABLED");
  if (!config.apiAccessApproved) missing.push("TIKTOK_SHOP_API_ACCESS_APPROVED");
  if (!config.appKey) missing.push("TIKTOK_SHOP_APP_KEY");
  if (!config.appSecret) missing.push("TIKTOK_SHOP_APP_SECRET");
  if (!config.serviceId) missing.push("TIKTOK_SHOP_SERVICE_ID");
  if (!config.redirectUri) missing.push("TIKTOK_SHOP_REDIRECT_URI");
  if (!process.env.TOKMETRIC_TOKEN_ENCRYPTION_KEY) {
    missing.push("TOKMETRIC_TOKEN_ENCRYPTION_KEY");
  }
  return { config, missing, ok: missing.length === 0 };
}
