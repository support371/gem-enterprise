import { afterEach, describe, expect, it, vi } from "vitest";
import type { SocialOAuthProviderConfig } from "@/lib/social-media/oauth/config";
import { discoverSocialAccounts } from "@/lib/social-media/oauth/discovery";
import type { StoredSocialCredential } from "@/lib/social-media/oauth/store";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Meta Page credential isolation", () => {
  it("does not copy user-token refresh or expiry data onto Page access tokens", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "page-123",
                name: "GEM Enterprise",
                access_token: "page-access-token",
                tasks: ["PROFILE_PLUS_CREATE_CONTENT"],
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const config: SocialOAuthProviderConfig = {
      provider: "META",
      displayName: "Meta Business",
      enabled: true,
      clientId: "meta-client",
      clientSecret: "meta-secret",
      redirectUri: "https://gemcybersecurityassist.com/api/social-media/oauth/meta/callback",
      authorizationUrl: "https://www.facebook.com/v24.0/dialog/oauth",
      tokenUrl: "https://graph.facebook.com/v24.0/oauth/access_token",
      accountDiscoveryUrl: "https://graph.facebook.com/v24.0/me/accounts",
      scopes: ["pages_show_list", "pages_manage_posts"],
      usePkce: false,
      tokenClientAuthentication: "BODY",
      refreshMode: "NONE",
      additionalAuthorizationParameters: {},
      apiVersion: "v24.0",
    };
    const userCredential: StoredSocialCredential = {
      provider: "META",
      accessToken: "user-access-token",
      refreshToken: "user-refresh-token",
      tokenType: "bearer",
      expiresAt: "2026-08-01T00:00:00.000Z",
      refreshExpiresAt: "2026-09-01T00:00:00.000Z",
      grantedScopes: config.scopes,
    };

    const [page] = await discoverSocialAccounts({ config, credential: userCredential });
    expect(page.credential).toEqual({
      provider: "META",
      accessToken: "page-access-token",
      tokenType: "bearer",
      grantedScopes: config.scopes,
      externalAccountId: "page-123",
    });
    expect(page.credential.refreshToken).toBeUndefined();
    expect(page.credential.expiresAt).toBeUndefined();
    expect(page.credential.refreshExpiresAt).toBeUndefined();
  });
});
