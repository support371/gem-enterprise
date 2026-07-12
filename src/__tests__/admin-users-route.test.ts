import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const authMocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getGatewaySessionToken: vi.fn(),
}));
const gatewayMocks = vi.hoisted(() => ({
  read: vi.fn(),
  write: vi.fn(),
}));

vi.mock("@/lib/api/auth-helpers", () => ({
  requireAdmin: authMocks.requireAdmin,
  getRequestContext: () => ({ ipAddress: "127.0.0.1", userAgent: "test" }),
  badRequest: (message: string, details?: unknown) =>
    NextResponse.json(details ? { error: message, details } : { error: message }, { status: 400 }),
  forbidden: (message: string) => NextResponse.json({ error: message }, { status: 403 }),
  serverError: () => NextResponse.json({ error: "Internal server error" }, { status: 500 }),
}));
vi.mock("@/lib/auth", () => ({
  getGatewaySessionToken: authMocks.getGatewaySessionToken,
}));
vi.mock("@/lib/supabase-gateway", () => {
  class GatewayRequestError extends Error {
    constructor(
      public statusCode: number,
      public code: string,
      message: string,
    ) {
      super(message);
    }
  }
  return {
    adminReadGateway: gatewayMocks.read,
    adminWriteGateway: gatewayMocks.write,
    GatewayRequestError,
  };
});
vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn() } },
}));
vi.mock("@/lib/audit", () => ({ emitAuditLog: vi.fn() }));

import { GET, PATCH } from "@/app/api/admin/users/route";

function patchRequest(body: unknown) {
  return new NextRequest("http://localhost/api/admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("gateway-backed admin users API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAdmin.mockResolvedValue({
      ok: true,
      session: { userId: "admin-1", role: "admin" },
      accountStatus: "active",
      claimsChanged: false,
    });
    authMocks.getGatewaySessionToken.mockResolvedValue("t".repeat(64));
    gatewayMocks.read.mockResolvedValue({ users: [], viewerRole: "admin" });
    gatewayMocks.write.mockResolvedValue({ ok: true, user: { id: "user-2" } });
  });

  it("returns the authoritative gate response when unauthenticated", async () => {
    authMocks.requireAdmin.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(gatewayMocks.read).not.toHaveBeenCalled();
  });

  it("loads users through the gateway", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(gatewayMocks.read).toHaveBeenCalledWith("users", "t".repeat(64));
  });

  it("rejects malformed role updates before the gateway", async () => {
    const response = await PATCH(patchRequest({ id: "user-2", role: "analyst" }));
    expect(response.status).toBe(400);
    expect(gatewayMocks.write).not.toHaveBeenCalled();
  });

  it("forwards validated updates to the write gateway", async () => {
    const payload = {
      id: "user-2",
      role: "analyst",
      confirmEmail: "reviewer@example.com",
      reason: "Assign to the controlled verification pilot.",
    };
    const response = await PATCH(patchRequest(payload));
    expect(response.status).toBe(200);
    expect(gatewayMocks.write).toHaveBeenCalledWith(
      "update_user",
      "t".repeat(64),
      payload,
    );
  });

  it("preserves gateway authorization errors", async () => {
    const { GatewayRequestError } = await import("@/lib/supabase-gateway");
    gatewayMocks.write.mockRejectedValue(
      new GatewayRequestError(403, "ROLE_ASSIGNMENT_FORBIDDEN", "Forbidden"),
    );
    const response = await PATCH(
      patchRequest({
        id: "user-2",
        role: "admin",
        confirmEmail: "reviewer@example.com",
        reason: "Attempt elevated assignment through a regular administrator.",
      }),
    );
    expect(response.status).toBe(403);
  });
});
