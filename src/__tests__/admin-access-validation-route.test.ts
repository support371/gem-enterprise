import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const validationMocks = vi.hoisted(() => ({
  validate: vi.fn(),
}));

vi.mock("@/lib/admin-access-token-validation", () => {
  class AdminAccessValidationError extends Error {
    constructor(
      public statusCode: number,
      public code: string,
      message: string,
    ) {
      super(message);
    }
  }

  return {
    validateAdminAccessToken: validationMocks.validate,
    AdminAccessValidationError,
  };
});

vi.mock("@/lib/api/auth-helpers", () => ({
  getRequestContext: () => ({ ipAddress: "198.51.100.2", userAgent: "test" }),
}));

import { POST } from "@/app/api/admin-access/validate/route";

function request(body: unknown) {
  return new NextRequest("http://localhost/api/admin-access/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("administrator access validation API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validationMocks.validate.mockResolvedValue({
      valid: true,
      expiresAt: "2026-07-13T02:00:00.000Z",
      requestId: "aar_5757acb2c0219ac97831663f5f408695",
    });
  });

  it("rejects malformed capabilities before contacting Supabase", async () => {
    const response = await POST(request({ accessToken: "too-short" }));

    expect(response.status).toBe(400);
    expect(validationMocks.validate).not.toHaveBeenCalled();
  });

  it("returns active authorization metadata without exposing the token", async () => {
    const token = "a".repeat(48);
    const response = await POST(request({ accessToken: token }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      valid: true,
      expiresAt: "2026-07-13T02:00:00.000Z",
      requestId: "aar_5757acb2c0219ac97831663f5f408695",
    });
    expect(JSON.stringify(body)).not.toContain(token);
    expect(validationMocks.validate).toHaveBeenCalledWith(token);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });

  it("returns a fail-closed result when no authorization row matches", async () => {
    validationMocks.validate.mockResolvedValue({
      valid: false,
      expiresAt: null,
      requestId: null,
    });

    const response = await POST(request({ accessToken: "c".repeat(48) }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      valid: false,
      expiresAt: null,
      requestId: null,
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns a safe unavailable response when validation cannot run", async () => {
    const { AdminAccessValidationError } = await import(
      "@/lib/admin-access-token-validation"
    );
    validationMocks.validate.mockRejectedValue(
      new AdminAccessValidationError(
        503,
        "ADMIN_ACCESS_VALIDATION_UNAVAILABLE",
        "Administrator authorization validation is unavailable.",
      ),
    );

    const response = await POST(request({ accessToken: "b".repeat(48) }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("ADMIN_ACCESS_VALIDATION_UNAVAILABLE");
  });
});
