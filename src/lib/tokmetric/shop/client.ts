import crypto from "node:crypto";
import { z } from "zod";
import { TokMetricError } from "@/lib/tokmetric/security";
import { getTikTokShopConfig } from "./config";

const tokenDataSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().optional(),
  access_token_expire_in: z.number().optional(),
  refresh_token_expire_in: z.number().optional(),
  open_id: z.string().optional(),
  seller_name: z.string().optional(),
  seller_base_region: z.string().optional(),
  granted_scopes: z.array(z.string()).optional(),
});

const tokenEnvelopeSchema = z.object({
  code: z.number(),
  message: z.string().optional(),
  data: tokenDataSchema,
});

export type TikTokShopToken = z.infer<typeof tokenDataSchema>;

export function buildTikTokShopAuthorizationUrl(state: string) {
  const config = getTikTokShopConfig();
  const url = new URL(config.authorizationUrl);
  url.searchParams.set("service_id", config.serviceId);
  url.searchParams.set("state", state);
  return url;
}

async function tokenRequest(url: string, params: Record<string, string>) {
  const endpoint = new URL(url);
  Object.entries(params).forEach(([key, value]) => endpoint.searchParams.set(key, value));
  const response = await fetch(endpoint, { method: "GET", cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  const parsed = tokenEnvelopeSchema.safeParse(payload);
  if (!response.ok || !parsed.success || parsed.data.code !== 0) {
    throw new TokMetricError(
      502,
      "TIKTOK_SHOP_TOKEN_EXCHANGE_FAILED",
      "TikTok Shop did not complete the seller token exchange.",
    );
  }
  return parsed.data.data;
}

export function exchangeTikTokShopAuthorizationCode(authCode: string) {
  const config = getTikTokShopConfig();
  return tokenRequest(config.tokenUrl, {
    app_key: config.appKey,
    app_secret: config.appSecret,
    auth_code: authCode,
    grant_type: "authorized_code",
  });
}

export function refreshTikTokShopToken(refreshToken: string) {
  const config = getTikTokShopConfig();
  return tokenRequest(config.refreshUrl, {
    app_key: config.appKey,
    app_secret: config.appSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
}

function signedUrl(path: string, query: Record<string, string>, body = "") {
  const config = getTikTokShopConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { ...query, app_key: config.appKey, timestamp };
  const canonical = Object.entries(params)
    .filter(([key]) => key !== "sign" && key !== "access_token")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}${value}`)
    .join("");
  const payload = `${config.appSecret}${path}${canonical}${body}${config.appSecret}`;
  const sign = crypto.createHmac("sha256", config.appSecret).update(payload).digest("hex");
  const url = new URL(path, config.apiOrigin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set("sign", sign);
  return url;
}

async function shopApi(input: {
  path: string;
  accessToken: string;
  query?: Record<string, string>;
  body?: Record<string, unknown>;
}) {
  const body = input.body ? JSON.stringify(input.body) : "";
  const url = signedUrl(input.path, input.query || {}, body);
  const response = await fetch(url, {
    method: input.body ? "POST" : "GET",
    cache: "no-store",
    headers: {
      "x-tts-access-token": input.accessToken,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body || undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || (typeof payload?.code === "number" && payload.code !== 0)) {
    throw new TokMetricError(502, "TIKTOK_SHOP_API_FAILED", "TikTok Shop rejected the catalog request.");
  }
  return payload;
}

export function getAuthorizedTikTokShops(accessToken: string) {
  return shopApi({ path: "/authorization/202309/shops", accessToken });
}

export function searchTikTokShopProducts(accessToken: string, shopCipher: string) {
  return shopApi({
    path: "/product/202502/products/search",
    accessToken,
    query: { shop_cipher: shopCipher, page_size: "20" },
    body: {},
  });
}
