import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/api/auth-helpers", () => ({
  getRequestContext: () => ({ ipAddress: "192.0.2.10", userAgent: "test" }),
}));

vi.mock("@/lib/api/rate-limit", () => ({
  rateLimit: () => ({ ok: true, retryAfterSeconds: 0 }),
  rateLimitedResponse: vi.fn(),
}));

import { POST } from "@/app/api/admin-access/status/route";

function request(body: unknown) {
  return new NextRequest("http://localhost/api/admin-access/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  tokenHash: "a".repeat(64),
  requestId: `aar_${"b".repeat(32)}`,
};

describe("administrator access authorization status API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns active when Supabase confirms the authorization", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ active: true, expiresAt: "2026-07-13T03:00:00Z" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await POST(request(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.active).toBe(true);
    expect(body.expiresAt).toBe("2026-07-13T03:00:00Z");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns inactive when the authorization is not registered", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ active: false, expiresAt: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const response = await POST(request(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ active: false, expiresAt: null });
  });

  it("fails closed for malformed identifiers without calling Supabase", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await POST(
      request({ tokenHash: "not-a-hash", requestId: "not-a-request" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ active: false, expiresAt: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns service unavailable when verification fails upstream", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const response = await POST(request(validBody));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Authorization verification unavailable");
  });
});
