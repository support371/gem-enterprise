import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSocialOAuthProviderConfig,
  validateSocialOAuthProviderConfig,
} from "@/lib/social-media/oauth/config";
import { discoverSocialAccounts } from "@/lib/social-media/oauth/discovery";
import type { StoredSocialCredential } from "@/lib/social-media/oauth/store";

function configureShared() {
  vi.stubEnv("SOCIAL_TOKEN_ENCRYPTION_KEY", Buffer.alloc(32, 3).toString("base64"));
}

function configureLinkedIn(scopes: string) {
  configureShared();
  vi.stubEnv("LINKEDIN_SOCIAL_OAUTH_ENABLED", "true");
  vi.stubEnv("LINKEDIN_COMMUNITY_MANAGEMENT_ACCESS_APPROVED", "true");
  vi.stubEnv("LINKEDIN_CLIENT_ID", "linkedin-client");
  vi.stubEnv("LINKEDIN_CLIENT_SECRET", "linkedin-secret");
  vi.stubEnv(
    "LINKEDIN_OAUTH_REDIRECT_URI",
    "https://gemcybersecurityassist.com/api/social-media/oauth/linkedin/callback",
  );
  vi.stubEnv("LINKEDIN_API_VERSION", "202607");
  vi.stubEnv("LINKEDIN_SOCIAL_SCOPES", scopes);
}

function configureYouTube(scopes: string) {
  configureShared();
  vi.stubEnv("YOUTUBE_SOCIAL_OAUTH_ENABLED", "true");
  vi.stubEnv("YOUTUBE_DATA_API_AUDIT_APPROVED", "true");
  vi.stubEnv("GOOGLE_SOCIAL_CLIENT_ID", "google-client");
  vi.stubEnv("GOOGLE_SOCIAL_CLIENT_SECRET", "google-secret");
  vi.stubEnv(
    "YOUTUBE_OAUTH_REDIRECT_URI",
    "https://gemcybersecurityassist.com/api/social-media/oauth/youtube/callback",
  );
  vi.stubEnv("YOUTUBE_SOCIAL_SCOPES", scopes);
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("social provider discovery scope contracts", () => {
  it("blocks LinkedIn authorization without organization-admin discovery scope", () => {
    configureLinkedIn("w_organization_social r_organization_social");
    expect(validateSocialOAuthProviderConfig("LINKEDIN")).toMatchObject({
      ok: false,
      missing: expect.arrayContaining(["LINKEDIN_ORGANIZATION_ADMIN_SCOPE"]),
    });

    vi.stubEnv(
      "LINKEDIN_SOCIAL_SCOPES",
      "rw_organization_admin w_organization_social r_organization_social",
    );
    expect(validateSocialOAuthProviderConfig("LINKEDIN").ok).toBe(true);
  });

  it("normalizes approved LinkedIn organization ACL fields and records role eligibility", async () => {
    configureLinkedIn(
      "rw_organization_admin w_organization_social r_organization_social",
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            elements: [
              {
                organization: "urn:li:organization:1234",
                role: "ADMINISTRATOR",
                state: "APPROVED",
              },
              {
                organizationTarget: "urn:li:organization:5678",
                role: "VIEWER",
                state: "APPROVED",
              },
              {
                organization: "urn:li:organization:9999",
                role: "ADMINISTRATOR",
                state: "REVOKED",
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const config = getSocialOAuthProviderConfig("LINKEDIN");
    const credential: StoredSocialCredential = {
      provider: "LINKEDIN",
      accessToken: "linkedin-access-token",
      grantedScopes: config.scopes,
    };
    const accounts = await discoverSocialAccounts({ config, credential });

    expect(accounts.map((account) => account.externalAccountId)).toEqual(["1234", "5678"]);
    expect(accounts[0].safeMetadata).toMatchObject({
      organizationUrn: "urn:li:organization:1234",
      approvedRole: "ADMINISTRATOR",
      roleState: "APPROVED",
      publishRoleEligible: true,
    });
    expect(accounts[1].safeMetadata).toMatchObject({
      approvedRole: "VIEWER",
      publishRoleEligible: false,
    });
  });

  it("blocks YouTube authorization when upload consent cannot discover the channel", () => {
    configureYouTube("https://www.googleapis.com/auth/youtube.upload");
    expect(validateSocialOAuthProviderConfig("YOUTUBE")).toMatchObject({
      ok: false,
      missing: expect.arrayContaining(["YOUTUBE_CHANNEL_DISCOVERY_SCOPE"]),
    });

    vi.stubEnv(
      "YOUTUBE_SOCIAL_SCOPES",
      "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload",
    );
    expect(validateSocialOAuthProviderConfig("YOUTUBE").ok).toBe(true);
  });
});
