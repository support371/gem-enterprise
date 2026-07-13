import { afterEach, describe, expect, it, vi } from "vitest";
import { validateAdminAccessToken } from "@/lib/admin-access-validation";

describe("administrator access validation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends only the SHA-256 token hash to the validation RPC", async () => {
    const accessToken = "browser-capability-" + "a".repeat(48);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            valid: true,
            expires_at: "2026-07-13T03:00:00.000Z",
            request_id: "aar_1234567890abcdef1234567890abcdef",
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await validateAdminAccessToken(accessToken);

    expect(result.valid).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as { p_token_hash: string };
    expect(url).toContain("/rest/v1/rpc/gem_validate_admin_access_token");
    expect(body.p_token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(String(init.body)).not.toContain(accessToken);
  });

  it("returns an invalid result when no active authorization row matches", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            { valid: false, expires_at: null, request_id: null },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(validateAdminAccessToken("b".repeat(64))).resolves.toEqual({
      valid: false,
      expiresAt: null,
      requestId: null,
    });
  });

  it("fails closed when the validation service is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(validateAdminAccessToken("c".repeat(64))).rejects.toThrow(
      "Administrator authorization validation is unavailable.",
    );
  });
});
