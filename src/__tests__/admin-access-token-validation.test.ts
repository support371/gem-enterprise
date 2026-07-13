import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AdminAccessValidationError,
  validateAdminAccessToken,
} from "@/lib/admin-access-token-validation";

describe("administrator access token validation client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends only a SHA-256 token hash to the validation RPC", async () => {
    const accessToken = "browser-capability-" + "a".repeat(48);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            valid: true,
            expires_at: "2026-07-13T02:00:00.000Z",
            request_id: "aar_5757acb2c0219ac97831663f5f408695",
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await validateAdminAccessToken(accessToken);

    expect(result).toEqual({
      valid: true,
      expiresAt: "2026-07-13T02:00:00.000Z",
      requestId: "aar_5757acb2c0219ac97831663f5f408695",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as { p_token_hash: string };
    expect(url).toContain("/rest/v1/rpc/gem_validate_admin_access_token");
    expect(body.p_token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(body.p_token_hash).not.toContain(accessToken);
    expect(String(init.body)).not.toContain(accessToken);
  });

  it("returns a simple invalid result for missing or expired capabilities", async () => {
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

    await expect(validateAdminAccessToken("b".repeat(48))).resolves.toEqual({
      valid: false,
      expiresAt: null,
      requestId: null,
    });
  });

  it("maps remote failures to a typed safe error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "not available" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(validateAdminAccessToken("c".repeat(48))).rejects.toMatchObject({
      statusCode: 503,
      code: "ADMIN_ACCESS_VALIDATION_FAILED",
    } satisfies Partial<AdminAccessValidationError>);
  });
});
