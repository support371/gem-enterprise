import { describe, expect, it } from "vitest";
import { contentHash, redactSecrets, TokMetricError } from "@/lib/tokmetric/security";

describe("TokMetric foundation utilities", () => {
  it("creates stable hashes for reordered object keys", () => {
    expect(contentHash({ caption: "hello", settings: { b: 2, a: 1 } })).toBe(contentHash({ settings: { a: 1, b: 2 }, caption: "hello" }));
  });

  it("changes hashes when approved content changes", () => {
    const first = contentHash({ caption: "approved", hashtags: ["gem"] });
    const second = contentHash({ caption: "approved update", hashtags: ["gem"] });
    expect(first).not.toBe(second);
  });

  it("redacts nested secrets without removing safe metadata", () => {
    expect(redactSecrets({ token: "raw", nested: { clientSecret: "secret", state: "safe" } })).toEqual({ token: "[REDACTED]", nested: { clientSecret: "[REDACTED]", state: "safe" } });
  });

  it("keeps structured TokMetric errors explicit", () => {
    const error = new TokMetricError(409, "IDEMPOTENCY_CONFLICT", "Conflict");
    expect(error.status).toBe(409);
    expect(error.code).toBe("IDEMPOTENCY_CONFLICT");
  });
});
