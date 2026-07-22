import { afterEach, describe, expect, it, vi } from "vitest";
import type { SocialOAuthProviderConfig } from "@/lib/social-media/oauth/config";
import { discoverSocialAccounts } from "@/lib/social-media/oauth/discovery";
import { refreshSocialAccessToken } from "@/lib/social-media/oauth/client";
import type { StoredSocialCredential } from "@/lib/social-media/oauth/store";

function response(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function config(
  provider: SocialOAuthProviderConfig["provider"],
  overrides: Partial<SocialOAuthProviderConfig>,
): SocialOAuthProviderConfig {
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
    scopes: ["profile"],
    usePkce: false,
    tokenClientAuthentication: "BODY",
    refreshMode: "NONE",
    additionalAuthorizationParameters: {},
    ...overrides,
  };
}

function credential(
  provider: StoredSocialCredential["provider"],
  overrides: Partial<StoredSocialCredential> = {},
): StoredSocialCredential {
  return {
    provider,
    accessToken: `${provider.toLowerCase()}-access-token`,
    grantedScopes: ["profile"],
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("social provider pagination and refresh failure classification", () => {
  it("follows YouTube page tokens with the maximum safe page size", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          items: [{ id: "channel-b", snippet: { title: "Channel B" } }],
          nextPageToken: "page-2",
        }),
      )
      .mockResolvedValueOnce(
        response({
          items: [{ id: "channel-a", snippet: { title: "Channel A" } }],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const accounts = await discoverSocialAccounts({
      config: config("YOUTUBE", {
        accountDiscoveryUrl: "https://www.googleapis.com/youtube/v3/channels",
        scopes: [
          "https://www.googleapis.com/auth/youtube.readonly",
          "https://www.googleapis.com/auth/youtube.upload",
        ],
        refreshMode: "STANDARD",
      }),
      credential: credential("YOUTUBE"),
    });

    expect(accounts.map((account) => account.externalAccountId)).toEqual([
      "channel-a",
      "channel-b",
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    const secondUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));
    expect(firstUrl.searchParams.get("maxResults")).toBe("50");
    expect(firstUrl.searchParams.get("pageToken")).toBeNull();
    expect(secondUrl.searchParams.get("pageToken")).toBe("page-2");
  });

  it("rejects provider pagination links that leave the configured HTTPS origin", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          data: [
            {
              id: "page-1",
              name: "GEM Enterprise",
              access_token: "page-access-token",
            },
          ],
          paging: { next: "https://attacker.example/steal" },
        }),
      ),
    );

    await expect(
      discoverSocialAccounts({
        config: config("META", {
          accountDiscoveryUrl: "https://graph.facebook.com/v24.0/me/accounts",
        }),
        credential: credential("META"),
      }),
    ).rejects.toMatchObject({
      code: "SOCIAL_ACCOUNT_DISCOVERY_PAGINATION_INVALID",
    });
  });

  it("classifies provider 5xx and rate limits as transient refresh outages", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ error: "temporarily unavailable" }, 503))
      .mockResolvedValueOnce(response({ error: "rate limited" }, 429));
    vi.stubGlobal("fetch", fetchMock);
    const xConfig = config("X", {
      tokenClientAuthentication: "BASIC",
      refreshMode: "STANDARD",
      scopes: ["tweet.read", "users.read", "offline.access"],
    });
    const xCredential = credential("X", {
      refreshToken: "x-refresh-token",
      grantedScopes: xConfig.scopes,
    });

    await expect(
      refreshSocialAccessToken({ config: xConfig, credential: xCredential }),
    ).rejects.toMatchObject({ code: "SOCIAL_TOKEN_REFRESH_UNAVAILABLE", status: 503 });
    await expect(
      refreshSocialAccessToken({ config: xConfig, credential: xCredential }),
    ).rejects.toMatchObject({ code: "SOCIAL_TOKEN_REFRESH_UNAVAILABLE", status: 503 });
  });

  it("requires explicit invalid-grant evidence before forcing reauthorization", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ error: "invalid_client" }, 401))
      .mockResolvedValueOnce(response({ error: "invalid_grant" }, 400));
    vi.stubGlobal("fetch", fetchMock);
    const xConfig = config("X", {
      tokenClientAuthentication: "BASIC",
      refreshMode: "STANDARD",
      scopes: ["tweet.read", "users.read", "offline.access"],
    });
    const xCredential = credential("X", {
      refreshToken: "stored-refresh-token",
      grantedScopes: xConfig.scopes,
    });

    await expect(
      refreshSocialAccessToken({ config: xConfig, credential: xCredential }),
    ).rejects.toMatchObject({ code: "SOCIAL_TOKEN_REFRESH_UNAVAILABLE", status: 503 });
    await expect(
      refreshSocialAccessToken({ config: xConfig, credential: xCredential }),
    ).rejects.toMatchObject({ code: "SOCIAL_TOKEN_REFRESH_REJECTED", status: 401 });
  });
});
