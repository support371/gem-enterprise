import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encryptCredential, decryptCredential, createPkcePair } from "@/lib/tokmetric/oauth/crypto";
import { encodeOAuthState, decodeOAuthState } from "@/lib/tokmetric/oauth/state";
import { connectorDefaults } from "@/lib/tokmetric/oauth/connectors";
import { exchangeAuthorizationCode, refreshTikTokToken, revokeTikTokToken, safeTokenMetadata } from "@/lib/tokmetric/oauth/client";
import { redactSecrets, TokMetricError } from "@/lib/tokmetric/security";

const env = { ...process.env };

beforeEach(() => {
  vi.restoreAllMocks();
  process.env = { ...env, JWT_SECRET: "test-secret-that-is-at-least-32-characters", TOKMETRIC_TOKEN_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", TIKTOK_CLIENT_KEY: "client", TIKTOK_CLIENT_SECRET: "secret", TIKTOK_REDIRECT_URI: "https://example.test/callback", TIKTOK_ENVIRONMENT: "sandbox", TOKMETRIC_TIKTOK_OAUTH_ENABLED: "true" };
});

afterEach(() => {
  process.env = { ...env };
});

describe("TokMetric TikTok OAuth", () => {
  it("detects OAuth state mismatch", () => {
    const pkce = createPkcePair();
    const state = encodeOAuthState({ nonce: "nonce", workspaceId: "w1", provider: "TIKTOK_LOGIN_KIT", environment: "sandbox", createdAt: Date.now(), actorId: "u1" });
    expect(() => decodeOAuthState(`${state}tampered`)).toThrow(TokMetricError);
  });

  it("round-trips OAuth state and PKCE data", () => {
    const pkce = createPkcePair();
    const encoded = encodeOAuthState({ nonce: "nonce", workspaceId: "w1", provider: "TIKTOK_DISPLAY_API", environment: "sandbox", createdAt: Date.now(), actorId: "u1" });
    expect(encoded).not.toContain(pkce.verifier);
    const decoded = decodeOAuthState(encoded);
    expect(decoded).not.toHaveProperty("codeVerifier");
    expect(decoded.provider).toBe("TIKTOK_DISPLAY_API");
  });

  it("encrypts token persistence payloads", () => {
    const encrypted = encryptCredential({ accessToken: "access", refreshToken: "refresh" });
    expect(encrypted).not.toContain("access");
    expect(decryptCredential<{ accessToken: string }>(encrypted).accessToken).toBe("access");
  });

  it("fails closed when OAuth configuration is missing", () => {
    delete process.env.TIKTOK_CLIENT_KEY;
    delete process.env.TOKMETRIC_TIKTOK_CLIENT_KEY;
    const login = connectorDefaults().find((connector) => connector.provider === "TIKTOK_LOGIN_KIT");
    expect(login?.state).toBe("NOT_CONFIGURED");
    expect(login?.configurationMissing).toContain("TIKTOK_CLIENT_KEY");
  });

  it("separates sandbox and production configuration", () => {
    process.env.TIKTOK_ENVIRONMENT = "production";
    expect(connectorDefaults()[0].environment).toBe("production");
  });

  it("marks Business and Shop connectors as platform approval required", () => {
    expect(connectorDefaults().filter((connector) => connector.state === "PLATFORM_APPROVAL_REQUIRED").map((connector) => connector.provider)).toEqual(["TIKTOK_BUSINESS_API", "TIKTOK_SHOP_SELLER", "TIKTOK_SHOP_CREATOR"]);
  });

  it("handles failed token exchange", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, json: async () => ({ error: "bad" }) })));
    await expect(exchangeAuthorizationCode({ code: "bad", codeVerifier: "verifier" })).rejects.toMatchObject({ code: "TIKTOK_TOKEN_EXCHANGE_FAILED" });
  });

  it("handles successful token refresh and safe metadata", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ access_token: "new", refresh_token: "refresh", expires_in: 3600, scope: "user.info.basic video.list", open_id: "open" }) })));
    const token = await refreshTikTokToken("refresh");
    expect(token.access_token).toBe("new");
    const metadata = safeTokenMetadata(token, "TIKTOK_DISPLAY_API", "sandbox");
    expect(metadata.externalAccountId).toBe("open");
    expect(JSON.stringify(metadata)).not.toContain("new");
  });

  it("handles refresh failure as reauthorization input", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, json: async () => ({}) })));
    await expect(refreshTikTokToken("revoked-refresh-token")).rejects.toMatchObject({ code: "TIKTOK_TOKEN_REFRESH_FAILED" });
  });

  it("supports token revocation calls without exposing credentials", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({}) }));
    vi.stubGlobal("fetch", fetchMock);
    await revokeTikTokToken("access-token");
    const requestInit = (fetchMock as any).mock.calls[0]?.[1] as RequestInit;
    expect(String(requestInit.body)).toContain("token=access-token");
    expect(redactSecrets({ accessToken: "access-token", refreshToken: "refresh" })).toEqual({ accessToken: "[REDACTED]", refreshToken: "[REDACTED]" });
  });
});
