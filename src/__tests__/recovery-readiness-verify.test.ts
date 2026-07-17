import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const authMocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
}));

const mailMocks = vi.hoisted(() => ({
  verify: vi.fn(),
}));

vi.mock("@/lib/api/auth-helpers", () => ({
  requireAdmin: authMocks.requireAdmin,
  getRequestContext: () => ({ ipAddress: "192.0.2.10", userAgent: "test" }),
}));

vi.mock("@/lib/api/rate-limit", () => ({
  rateLimit: () => ({ ok: true, retryAfterSeconds: 0 }),
  rateLimitedResponse: () =>
    NextResponse.json({ error: "Too many requests" }, { status: 429 }),
}));

vi.mock("@/lib/mail/send", () => ({
  verifyMailTransport: mailMocks.verify,
}));

import { POST } from "@/app/api/auth/recovery-readiness/verify/route";

function request() {
  return new NextRequest(
    "http://localhost/api/auth/recovery-readiness/verify",
    { method: "POST" },
  );
}

describe("protected SMTP transport verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAdmin.mockResolvedValue({
      ok: true,
      session: { userId: "admin-1", role: "admin" },
      accountStatus: "active",
      claimsChanged: false,
    });
    mailMocks.verify.mockResolvedValue({
      ok: true,
      code: "SMTP_VERIFIED",
      readiness: {
        configured: true,
        missing: [],
        portValid: true,
        secureSettingValid: true,
        senderConfigured: true,
        replyToConfigured: true,
        transportSecurity: "starttls",
      },
    });
  });

  it("returns the authoritative gate response when unauthenticated", async () => {
    authMocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(mailMocks.verify).not.toHaveBeenCalled();
  });

  it("verifies connectivity without sending mail or exposing credentials", async () => {
    const response = await POST(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      service: "gem-password-recovery",
      code: "SMTP_VERIFIED",
      configured: true,
      transportSecurity: "starttls",
      missingVariables: [],
      sentMessage: false,
      credentialsExposed: false,
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
  });

  it("returns a safe unavailable response when verification fails", async () => {
    mailMocks.verify.mockResolvedValue({
      ok: false,
      code: "SMTP_AUTH_FAILED",
      readiness: {
        configured: true,
        missing: [],
        portValid: true,
        secureSettingValid: true,
        senderConfigured: true,
        replyToConfigured: true,
        transportSecurity: "starttls",
      },
    });

    const response = await POST(request());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("SMTP_AUTH_FAILED");
    expect(JSON.stringify(body)).not.toContain("password");
    expect(JSON.stringify(body)).not.toContain("smtp-user");
    expect(body.sentMessage).toBe(false);
  });
});
