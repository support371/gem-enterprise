import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const gatewayMocks = vi.hoisted(() => ({
  setPassword: vi.fn(),
}));

vi.mock("@/lib/admin-access-gateway", () => {
  class AdminAccessGatewayError extends Error {
    constructor(
      public statusCode: number,
      public code: string,
      message: string,
    ) {
      super(message);
    }
  }

  return {
    setAdminPasswordWithAccessToken: gatewayMocks.setPassword,
    AdminAccessGatewayError,
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
    gatewayMocks.setPassword.mockResolvedValue({
      ok: true,
      email: "admin@gemcybersecurityassist.com",
      loginPath: "/client-login",
    });
  });

  it("rejects a weak password before calling the gateway", async () => {
    const response = await POST(
      request({ accessToken, password: "weak-password" }),
    );

    expect(response.status).toBe(400);
    expect(gatewayMocks.setPassword).not.toHaveBeenCalled();
  });

  it("sets a strong password through the controlled edge gateway", async () => {
    const password = "Strong-Administrator-Password-2026!";
    const response = await POST(request({ accessToken, password }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(gatewayMocks.setPassword).toHaveBeenCalledWith(accessToken, password);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });

  it("maps an invalid one-time token to a safe error", async () => {
    const { AdminAccessGatewayError } = await import(
      "@/lib/admin-access-gateway"
    );
    gatewayMocks.setPassword.mockRejectedValue(
      new AdminAccessGatewayError(400, "INVALID_TOKEN", "Invalid token"),
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
