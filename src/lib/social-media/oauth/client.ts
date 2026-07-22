import { TokMetricError } from "@/lib/tokmetric/security";
import type { SocialOAuthProviderConfig } from "./config";
import type { StoredSocialCredential } from "./store";

interface GenericTokenPayload {
  access_token?: unknown;
  refresh_token?: unknown;
  token_type?: unknown;
  expires_in?: unknown;
  refresh_expires_in?: unknown;
  scope?: unknown;
  scopes?: unknown;
  open_id?: unknown;
  user_id?: unknown;
  sub?: unknown;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function secondsValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return undefined;
}

function tokenScopes(payload: GenericTokenPayload, requestedScopes: string[]) {
  if (Array.isArray(payload.scopes)) {
    return payload.scopes.filter((scope): scope is string => typeof scope === "string" && !!scope.trim());
  }
  const scope = stringValue(payload.scope);
  if (scope) return scope.split(/[\s,]+/).filter(Boolean);
  return requestedScopes;
}

export function buildSocialAuthorizationUrl(input: {
  config: SocialOAuthProviderConfig;
  state: string;
  codeChallenge?: string;
}) {
  const { config } = input;
  const url = new URL(config.authorizationUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", input.state);
  for (const [key, value] of Object.entries(config.additionalAuthorizationParameters)) {
    url.searchParams.set(key, value);
  }
  if (config.usePkce) {
    if (!input.codeChallenge) {
      throw new TokMetricError(500, "SOCIAL_PKCE_REQUIRED", "PKCE challenge was not created.");
    }
    url.searchParams.set("code_challenge", input.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url;
}

export async function exchangeSocialAuthorizationCode(input: {
  config: SocialOAuthProviderConfig;
  code: string;
  codeVerifier?: string;
  requestedScopes: string[];
}) {
  if (input.config.usePkce && !input.codeVerifier) {
    throw new TokMetricError(401, "SOCIAL_PKCE_VERIFIER_MISSING", "PKCE verifier is missing.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.config.redirectUri,
  });
  if (input.config.tokenClientAuthentication === "BODY") {
    body.set("client_id", input.config.clientId);
    body.set("client_secret", input.config.clientSecret);
  } else {
    body.set("client_id", input.config.clientId);
  }
  if (input.codeVerifier) body.set("code_verifier", input.codeVerifier);

  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  });
  if (input.config.tokenClientAuthentication === "BASIC") {
    headers.set(
      "Authorization",
      `Basic ${Buffer.from(`${input.config.clientId}:${input.config.clientSecret}`).toString("base64")}`,
    );
  }

  let response: Response;
  try {
    response = await fetch(input.config.tokenUrl, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new TokMetricError(
      502,
      "SOCIAL_TOKEN_EXCHANGE_UNAVAILABLE",
      `${input.config.displayName} token service is unavailable.`,
    );
  }

  let payload: GenericTokenPayload = {};
  try {
    payload = (await response.json()) as GenericTokenPayload;
  } catch {
    payload = {};
  }
  if (!response.ok) {
    throw new TokMetricError(
      502,
      "SOCIAL_TOKEN_EXCHANGE_FAILED",
      `${input.config.displayName} did not authorize the connector.`,
    );
  }

  const accessToken = stringValue(payload.access_token);
  if (!accessToken) {
    throw new TokMetricError(
      502,
      "SOCIAL_TOKEN_RESPONSE_INVALID",
      `${input.config.displayName} returned an invalid token response.`,
    );
  }
  const expiresIn = secondsValue(payload.expires_in);
  const refreshExpiresIn = secondsValue(payload.refresh_expires_in);
  const externalAccountId =
    stringValue(payload.open_id) || stringValue(payload.user_id) || stringValue(payload.sub);
  const grantedScopes = tokenScopes(payload, input.requestedScopes);

  const credential: StoredSocialCredential = {
    provider: input.config.provider,
    accessToken,
    refreshToken: stringValue(payload.refresh_token),
    tokenType: stringValue(payload.token_type),
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
    refreshExpiresAt: refreshExpiresIn
      ? new Date(Date.now() + refreshExpiresIn * 1000).toISOString()
      : undefined,
    grantedScopes,
    externalAccountId,
  };

  return {
    credential,
    safeMetadata: {
      provider: input.config.provider,
      tokenType: credential.tokenType || "unknown",
      expiresAt: credential.expiresAt || null,
      refreshTokenPresent: Boolean(credential.refreshToken),
      scopeCount: grantedScopes.length,
      externalAccountIdPresent: Boolean(externalAccountId),
    },
  };
}
