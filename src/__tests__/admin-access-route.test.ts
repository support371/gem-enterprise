import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const validationMocks = vi.hoisted(() => ({
  validate: vi.fn(),
}));

const consumerMocks = vi.hoisted(() => ({
  consume: vi.fn(),
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

vi.mock("@/lib/admin-access-consumer", () => {
  class AdminAccessConsumptionError extends Error {
    constructor(
      public statusCode: number,
      public code: string,
      message: string,
    ) {
      super(message);
    }
  }

  return {
    consumeAdminAccessToken: consumerMocks.consume,
    AdminAccessConsumptionError,
  };
});

vi.mock("@/lib/api/auth-helpers", () => ({
  getRequestContext: () => ({ ipAddress: "192.0.2.1", userAgent: "test" }),
}));

import { POST } from "@/app/api/admin-access/route";

const requestId = `aar_${"5".repeat(32)}`;
const accessToken = `${requestId}.${"a".repeat(64)}`;

function request(body: unknown) {
  return new NextRequest("http://localhost/api/admin-access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("administrator access setup API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validationMocks.validate.mockResolvedValue({
      valid: true,
      expiresAt: "2026-07-17T06:00:00.000Z",
      requestId,
    });
    consumerMocks.consume.mockResolvedValue({
      ok: true,
      email: "admin@gemcybersecurityassist.com",
      loginPath: "/client-login",
    });
  });

  it("rejects a weak password before validation or consumption", async () => {
    const response = await POST(
      request({ accessToken, password: "weak-password" }),
    );

    expect(response.status).toBe(400);
    expect(validationMocks.validate).not.toHaveBeenCalled();
    expect(consumerMocks.consume).not.toHaveBeenCalled();
  });

  it("prevalidates the bound capability before direct database consumption", async () => {
    const password = "Strong-Administrator-Password-2026!";
    const response = await POST(request({ accessToken, password }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(validationMocks.validate).toHaveBeenCalledWith(accessToken);
    expect(consumerMocks.consume).toHaveBeenCalledWith(
      accessToken,
      password,
      requestId,
    );
    expect(validationMocks.validate.mock.invocationCallOrder[0]).toBeLessThan(
      consumerMocks.consume.mock.invocationCallOrder[0],
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });

  it("fails closed when the request-id-bound authorization is inactive", async () => {
    validationMocks.validate.mockResolvedValue({
      valid: false,
      expiresAt: null,
      requestId: null,
    });

    const response = await POST(
      request({
        accessToken,
        password: "Another-Strong-Password-2026!",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("INVALID_TOKEN");
    expect(body.error).toBe("This setup link is invalid or expired.");
    expect(consumerMocks.consume).not.toHaveBeenCalled();
  });

  it("maps an invalid one-time token from atomic consumption to a safe error", async () => {
    const { AdminAccessConsumptionError } = await import(
      "@/lib/admin-access-consumer"
    );
    consumerMocks.consume.mockRejectedValue(
      new AdminAccessConsumptionError(400, "INVALID_TOKEN", "Invalid token"),
    );

    const response = await POST(
      request({
        accessToken: `${requestId}.${"b".repeat(64)}`,
        password: "Another-Strong-Password-2026!",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("This setup link is invalid or expired.");
    expect(body.code).toBe("INVALID_TOKEN");
  });
});
