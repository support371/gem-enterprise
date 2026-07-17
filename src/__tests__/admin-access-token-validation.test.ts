import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AdminAccessValidationError,
  validateAdminAccessToken,
} from "@/lib/admin-access-token-validation";

const requestId = `aar_${"5".repeat(32)}`;
const accessToken = `${requestId}.${"a".repeat(64)}`;

describe("administrator access token validation client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends the bound request ID and only a SHA-256 token hash to the edge gateway", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          valid: true,
          expiresAt: "2026-07-17T06:00:00.000Z",
          requestId,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await validateAdminAccessToken(accessToken);

    expect(result).toEqual({
      valid: true,
      expiresAt: "2026-07-17T06:00:00.000Z",
      requestId,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      action: string;
      tokenHash: string;
      requestId: string;
    };
    const headers = init.headers as Record<string, string>;

    expect(url).toContain("/functions/v1/gem-admin-access-gateway");
    expect(body).toMatchObject({ action: "validate", requestId });
    expect(body.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(String(init.body)).not.toContain(accessToken);
    expect(headers.apikey).toBeTruthy();
    expect(headers.Authorization).toMatch(/^Bearer /);
  });

  it("returns a simple invalid result for missing or expired capabilities", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ valid: false, expiresAt: null, requestId: null }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(validateAdminAccessToken(accessToken)).resolves.toEqual({
      valid: false,
      expiresAt: null,
      requestId: null,
    });
  });

  it("rejects legacy unbound capabilities before contacting Supabase", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(validateAdminAccessToken("b".repeat(64))).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_TOKEN",
    } satisfies Partial<AdminAccessValidationError>);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps remote failures to a typed safe error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "not available",
            code: "ADMIN_ACCESS_GATEWAY_UNAVAILABLE",
          }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(validateAdminAccessToken(accessToken)).rejects.toMatchObject({
      statusCode: 503,
      code: "ADMIN_ACCESS_GATEWAY_UNAVAILABLE",
    } satisfies Partial<AdminAccessValidationError>);
  });
});
