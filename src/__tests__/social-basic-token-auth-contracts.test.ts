import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSocialOAuthProviderConfig,
  validateSocialOAuthProviderConfig,
  type SocialOAuthProviderConfig,
} from "@/lib/social-media/oauth/config";
import {
  exchangeSocialAuthorizationCode,
  refreshSocialAccessToken,
} from "@/lib/social-media/oauth/client";
import type { StoredSocialCredential } from "@/lib/social-media/oauth/store";

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function basicConfig(provider: "X" | "NEXTDOOR"): SocialOAuthProviderConfig {
  return {
    provider,
    displayName: provider,
    enabled: true,
    clientId: `${provider.toLowerCase()}-client`,
    clientSecret: `${provider.toLowerCase()}-secret`,
    redirectUri: `https://gemcybersecurityassist.com/api/social-media/oauth/${provider.toLowerCase()}/callback`,
    authorizationUrl: "https://provider.example/authorize",
    tokenUrl: "https://provider.example/token",
    accountDiscoveryUrl: "https://provider.example/me",
    scopes:
      provider === "X"
        ? ["tweet.read", "users.read", "offline.access"]
        : ["openid", "profile", "post:write", "post:read"],
    usePkce: provider === "X",
    tokenClientAuthentication: "BASIC",
    refreshMode: "STANDARD",
    additionalAuthorizationParameters: {},
  };
}

function requestDetails(fetchMock: ReturnType<typeof vi.fn>) {
  const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
  const headers = new Headers(request.headers);
  const body = new URLSearchParams(String(request.body));
  return { headers, body };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("social OAuth Basic client authentication contracts", () => {
  it("keeps confidential X credentials out of the token request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        access_token: "x-access-token",
        refresh_token: "x-refresh-token",
        expires_in: 7200,
        scope: "tweet.read users.read offline.access",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const config = basicConfig("X");

    await exchangeSocialAuthorizationCode({
      config,
      code: "authorization-code",
      codeVerifier: "pkce-verifier",
      requestedScopes: config.scopes,
    });

    const { headers, body } = requestDetails(fetchMock);
    expect(headers.get("authorization")).toBe(
      `Basic ${Buffer.from("x-client:x-secret").toString("base64")}`,
    );
    expect(body.get("client_id")).toBeNull();
    expect(body.get("client_secret")).toBeNull();
    expect(body.get("code_verifier")).toBe("pkce-verifier");
  });

  it("refreshes Nextdoor with Basic authentication and the granted scope set", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        access_token: "nextdoor-rotated-access-token",
        refresh_token: "nextdoor-rotated-refresh-token",
        expires_in: 3600,
        scope: "openid profile post:write post:read",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const config = basicConfig("NEXTDOOR");
    const credential: StoredSocialCredential = {
      provider: "NEXTDOOR",
      accessToken: "nextdoor-access-token",
      refreshToken: "nextdoor-refresh-token",
      grantedScopes: config.scopes,
      externalAccountId: "nextdoor-profile-1",
    };

    const refreshed = await refreshSocialAccessToken({ config, credential });
    const { headers, body } = requestDetails(fetchMock);

    expect(headers.get("authorization")).toBe(
      `Basic ${Buffer.from("nextdoor-client:nextdoor-secret").toString("base64")}`,
    );
    expect(body.get("client_id")).toBeNull();
    expect(body.get("client_secret")).toBeNull();
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("refresh_token")).toBe("nextdoor-refresh-token");
    expect(body.get("scope")).toBe("openid profile post:write post:read");
    expect(refreshed.credential.externalAccountId).toBe("nextdoor-profile-1");
  });

  it("blocks Nextdoor account authorization without the profile discovery scope", () => {
    vi.stubEnv("SOCIAL_TOKEN_ENCRYPTION_KEY", Buffer.alloc(32, 4).toString("base64"));
    vi.stubEnv("NEXTDOOR_PUBLISH_API_ACCESS_APPROVED", "true");
    vi.stubEnv("NEXTDOOR_OAUTH_ENABLED", "true");
    vi.stubEnv("NEXTDOOR_CLIENT_ID", "nextdoor-client");
    vi.stubEnv("NEXTDOOR_CLIENT_SECRET", "nextdoor-secret");
    vi.stubEnv(
      "NEXTDOOR_OAUTH_REDIRECT_URI",
      "https://gemcybersecurityassist.com/api/social-media/oauth/nextdoor/callback",
    );
    vi.stubEnv("NEXTDOOR_SOCIAL_SCOPES", "openid profile:read post:write post:read");

    expect(validateSocialOAuthProviderConfig("NEXTDOOR")).toMatchObject({
      ok: false,
      missing: expect.arrayContaining(["NEXTDOOR_PROFILE_DISCOVERY_SCOPE"]),
    });

    vi.stubEnv("NEXTDOOR_SOCIAL_SCOPES", "openid profile post:write post:read");
    expect(validateSocialOAuthProviderConfig("NEXTDOOR").ok).toBe(true);
    expect(getSocialOAuthProviderConfig("NEXTDOOR").refreshMode).toBe("STANDARD");
  });
});
