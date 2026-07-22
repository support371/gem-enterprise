import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildLocalHealthEvidence,
  hasAllRequiredScopes,
  tokenExpiryState,
  type SocialProviderLifecycleAdapter,
} from "@/lib/social-media/oauth/lifecycle";
import {
  getSocialProviderLifecycleAdapter,
  listRegisteredSocialLifecycleProviders,
  registerSocialProviderLifecycleAdapter,
  resetSocialProviderLifecycleAdaptersForTests,
} from "@/lib/social-media/oauth/lifecycle-registry";

function adapter(provider: SocialProviderLifecycleAdapter["provider"]): SocialProviderLifecycleAdapter {
  return {
    provider,
    async discoverAccounts() {
      return [];
    },
    async refreshCredential({ credential }) {
      return credential;
    },
    async checkHealth({ credential, requiredScopes }) {
      return buildLocalHealthEvidence({
        provider,
        credential,
        requiredScopes,
        externalAccountVisible: Boolean(credential.externalAccountId),
      });
    },
    async revokeCredential() {
      return { revoked: false, externalPublishingEnabled: false };
    },
  };
}

afterEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  resetSocialProviderLifecycleAdaptersForTests();
  vi.unstubAllEnvs();
});

describe("social provider lifecycle", () => {
  it("evaluates required scopes exactly", () => {
    expect(hasAllRequiredScopes(["read", "write"], ["read"])).toBe(true);
    expect(hasAllRequiredScopes(["read"], ["read", "write"])).toBe(false);
  });

  it("classifies token expiry without external calls", () => {
    const now = Date.parse("2026-07-22T12:00:00.000Z");
    expect(tokenExpiryState(undefined, now)).toBe("UNKNOWN");
    expect(tokenExpiryState("invalid", now)).toBe("ERROR");
    expect(tokenExpiryState("2026-07-22T11:59:00.000Z", now)).toBe("EXPIRED");
    expect(tokenExpiryState("2026-07-22T12:10:00.000Z", now)).toBe("DEGRADED");
    expect(tokenExpiryState("2026-07-22T13:00:00.000Z", now)).toBe("HEALTHY");
  });

  it("returns secret-safe local evidence with publishing disabled", () => {
    const evidence = buildLocalHealthEvidence({
      provider: "X",
      credential: {
        provider: "X",
        accessToken: "must-not-appear",
        refreshToken: "also-secret",
        expiresAt: "2026-07-22T13:00:00.000Z",
        grantedScopes: ["tweet.read", "users.read"],
        externalAccountId: "account-1",
      },
      requiredScopes: ["tweet.read", "users.read"],
      externalAccountVisible: true,
      now: Date.parse("2026-07-22T12:00:00.000Z"),
    });
    const serialized = JSON.stringify(evidence);
    expect(evidence.state).toBe("HEALTHY");
    expect(evidence.externalPublishingEnabled).toBe(false);
    expect(evidence.externalWriteAttempted).toBe(false);
    expect(serialized).not.toContain("must-not-appear");
    expect(serialized).not.toContain("also-secret");
  });

  it("fails closed until a provider adapter is registered", () => {
    expect(() => getSocialProviderLifecycleAdapter("META")).toThrow(
      "has not been configured",
    );
    registerSocialProviderLifecycleAdapter(adapter("META"));
    expect(listRegisteredSocialLifecycleProviders()).toEqual(["META"]);
    expect(getSocialProviderLifecycleAdapter("META").provider).toBe("META");
    expect(() => registerSocialProviderLifecycleAdapter(adapter("META"))).toThrow(
      "already registered",
    );
  });
});
