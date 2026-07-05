import { describe, expect, it } from "vitest";
import { contentHash, getTokMetricIdempotencyTtlSeconds, redactSecrets } from "@/lib/tokmetric/security";
import { decodeOAuthState, encodeOAuthState } from "@/lib/tokmetric/oauth/state";

describe("TokMetric hardening regressions", () => {
  it("keeps PKCE verifier out of browser-visible state", () => {
    const verifier = "pkce-verifier-must-not-leak";
    const state = encodeOAuthState({ nonce: "nonce", workspaceId: "workspace", actorId: "actor", provider: "TIKTOK_LOGIN_KIT", environment: "sandbox", createdAt: Date.now() });
    expect(state).not.toContain(verifier);
    expect(decodeOAuthState(state)).not.toHaveProperty("codeVerifier");
  });

  it("detects tampered state", () => {
    const state = encodeOAuthState({ nonce: "nonce", workspaceId: "workspace", actorId: "actor", provider: "TIKTOK_LOGIN_KIT", environment: "sandbox", createdAt: Date.now() });
    expect(() => decodeOAuthState(`${state}x`)).toThrowError(/OAuth state validation failed/);
  });

  it("supports normalized idempotency payload hashing", () => {
    const first = contentHash({ action: "disconnect", connectorId: "c1" });
    const second = contentHash({ connectorId: "c1", action: "disconnect" });
    const volatile = contentHash({ action: "disconnect", connectorId: "c1", requestId: "random" });
    expect(first).toBe(second);
    expect(first).not.toBe(volatile);
  });

  it("uses a safe idempotency TTL default and handles malformed values", () => {
    const original = process.env.TOKMETRIC_IDEMPOTENCY_TTL_SECONDS;
    delete process.env.TOKMETRIC_IDEMPOTENCY_TTL_SECONDS;
    expect(getTokMetricIdempotencyTtlSeconds()).toBe(86400);
    process.env.TOKMETRIC_IDEMPOTENCY_TTL_SECONDS = "not-a-number";
    expect(getTokMetricIdempotencyTtlSeconds()).toBe(86400);
    process.env.TOKMETRIC_IDEMPOTENCY_TTL_SECONDS = "120";
    expect(getTokMetricIdempotencyTtlSeconds()).toBe(120);
    if (original === undefined) delete process.env.TOKMETRIC_IDEMPOTENCY_TTL_SECONDS;
    else process.env.TOKMETRIC_IDEMPOTENCY_TTL_SECONDS = original;
  });

  it("redacts secret-bearing keys while preserving harmless similarly named metadata", () => {
    expect(redactSecrets({ accessToken: "raw", refreshToken: "raw", clientSecret: "raw", secretRef: "raw", refreshIntervalSeconds: 60, tokenCount: 3 })).toEqual({
      accessToken: "[REDACTED]",
      refreshToken: "[REDACTED]",
      clientSecret: "[REDACTED]",
      secretRef: "[REDACTED]",
      refreshIntervalSeconds: 60,
      tokenCount: 3,
    });
  });
});
