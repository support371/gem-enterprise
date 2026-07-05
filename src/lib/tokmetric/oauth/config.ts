import { z } from "zod";

export const tiktokEnvironmentSchema = z.enum(["sandbox", "production"]);
export type TikTokEnvironment = z.infer<typeof tiktokEnvironmentSchema>;

export const connectorProviders = [
  "TIKTOK_LOGIN_KIT",
  "TIKTOK_DISPLAY_API",
  "TIKTOK_CONTENT_POSTING_API",
  "TIKTOK_BUSINESS_API",
  "TIKTOK_SHOP_SELLER",
  "TIKTOK_SHOP_CREATOR",
] as const;

export type TokMetricConnectorProvider = typeof connectorProviders[number];

const platformApprovalRequired = new Set<TokMetricConnectorProvider>([
  "TIKTOK_BUSINESS_API",
  "TIKTOK_SHOP_SELLER",
  "TIKTOK_SHOP_CREATOR",
]);

export function isPlatformApprovalRequired(provider: TokMetricConnectorProvider) {
  return platformApprovalRequired.has(provider);
}

export function getTikTokOAuthConfig() {
  const environment = tiktokEnvironmentSchema.catch("sandbox").parse(process.env.TIKTOK_ENVIRONMENT);
  const clientKey = process.env.TIKTOK_CLIENT_KEY || process.env.TOKMETRIC_TIKTOK_CLIENT_KEY || "";
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET || process.env.TOKMETRIC_TIKTOK_CLIENT_SECRET || "";
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || process.env.TOKMETRIC_TIKTOK_OAUTH_REDIRECT_URL || "";
  const oauthEnabled = process.env.TOKMETRIC_TIKTOK_OAUTH_ENABLED === "true";
  return {
    environment,
    clientKey,
    clientSecret,
    redirectUri,
    oauthEnabled,
    authorizationUrl: environment === "production" ? "https://www.tiktok.com/v2/auth/authorize/" : "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: environment === "production" ? "https://open.tiktokapis.com/v2/oauth/token/" : "https://open.tiktokapis.com/v2/oauth/token/",
    revokeUrl: environment === "production" ? "https://open.tiktokapis.com/v2/oauth/revoke/" : "https://open.tiktokapis.com/v2/oauth/revoke/",
  };
}

export function validateTikTokOAuthConfig() {
  const config = getTikTokOAuthConfig();
  const missing: string[] = [];
  if (!config.oauthEnabled) missing.push("TOKMETRIC_TIKTOK_OAUTH_ENABLED");
  if (!config.clientKey) missing.push("TIKTOK_CLIENT_KEY");
  if (!config.clientSecret) missing.push("TIKTOK_CLIENT_SECRET");
  if (!config.redirectUri) missing.push("TIKTOK_REDIRECT_URI");
  if (!process.env.TOKMETRIC_TOKEN_ENCRYPTION_KEY) missing.push("TOKMETRIC_TOKEN_ENCRYPTION_KEY");
  return { config, ok: missing.length === 0, missing };
}

export const providerScopes: Record<TokMetricConnectorProvider, string[]> = {
  TIKTOK_LOGIN_KIT: ["user.info.basic"],
  TIKTOK_DISPLAY_API: ["user.info.basic", "video.list"],
  TIKTOK_CONTENT_POSTING_API: ["user.info.basic", "video.upload", "video.publish"],
  TIKTOK_BUSINESS_API: ["business.basic"],
  TIKTOK_SHOP_SELLER: ["seller.authorization.info"],
  TIKTOK_SHOP_CREATOR: ["affiliate_creator.info"],
};
