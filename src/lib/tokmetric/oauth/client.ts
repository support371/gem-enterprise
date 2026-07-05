import { z } from "zod";
import { TokMetricError, redactSecrets } from "@/lib/tokmetric/security";
import { getTikTokOAuthConfig, providerScopes, type TokMetricConnectorProvider } from "./config";

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
  refresh_expires_in: z.number().optional(),
  scope: z.string().optional(),
  open_id: z.string().optional(),
  token_type: z.string().optional(),
});

export type TikTokTokenResponse = z.infer<typeof tokenResponseSchema>;

export function buildAuthorizationUrl(input: { workspaceId: string; provider: TokMetricConnectorProvider; state: string; codeChallenge: string }) {
  const config = getTikTokOAuthConfig();
  const url = new URL(config.authorizationUrl);
  url.searchParams.set("client_key", config.clientKey);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", providerScopes[input.provider].join(","));
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url;
}

export async function exchangeAuthorizationCode(input: { code: string; codeVerifier: string }) {
  const config = getTikTokOAuthConfig();
  const body = new URLSearchParams({
    client_key: config.clientKey,
    client_secret: config.clientSecret,
    code: input.code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
    code_verifier: input.codeVerifier,
  });
  const response = await fetch(config.tokenUrl, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const payload = await response.json().catch(() => ({}));
  const parsed = tokenResponseSchema.safeParse(payload);
  if (!response.ok || !parsed.success) {
    throw new TokMetricError(502, "TIKTOK_TOKEN_EXCHANGE_FAILED", "TikTok authorization code exchange failed.");
  }
  return parsed.data;
}

export async function refreshTikTokToken(refreshToken: string) {
  const config = getTikTokOAuthConfig();
  const body = new URLSearchParams({
    client_key: config.clientKey,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const response = await fetch(config.tokenUrl, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const payload = await response.json().catch(() => ({}));
  const parsed = tokenResponseSchema.safeParse(payload);
  if (!response.ok || !parsed.success) throw new TokMetricError(502, "TIKTOK_TOKEN_REFRESH_FAILED", "TikTok token refresh failed.");
  return parsed.data;
}

export async function revokeTikTokToken(accessToken: string) {
  const config = getTikTokOAuthConfig();
  const body = new URLSearchParams({ client_key: config.clientKey, client_secret: config.clientSecret, token: accessToken });
  const response = await fetch(config.revokeUrl, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new TokMetricError(502, "TIKTOK_TOKEN_REVOCATION_FAILED", "TikTok token revocation failed.");
}

export function safeTokenMetadata(token: TikTokTokenResponse, provider: TokMetricConnectorProvider, environment: string) {
  const grantedScopes = token.scope ? token.scope.split(/[ ,]+/).filter(Boolean) : providerScopes[provider];
  return redactSecrets({
    provider,
    environment,
    externalAccountId: token.open_id ?? null,
    grantedScopes,
    expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null,
  }) as { provider: string; environment: string; externalAccountId: string | null; grantedScopes: string[]; expiresAt: string | null };
}
