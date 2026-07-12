import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const authMocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getGatewaySessionToken: vi.fn(),
}));
const dbMocks = vi.hoisted(() => ({
  usersFindMany: vi.fn(),
  auditFindMany: vi.fn(),
}));

vi.mock("@/lib/api/auth-helpers", () => ({
  requireAdmin: authMocks.requireAdmin,
}));

vi.mock("@/lib/auth", () => ({
  getGatewaySessionToken: authMocks.getGatewaySessionToken,
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findMany: dbMocks.usersFindMany },
    auditLog: { findMany: dbMocks.auditFindMany },
  },
}));

vi.mock("@/lib/supabase-gateway", () => ({
  adminReadGateway: vi.fn(),
  GatewayRequestError: class GatewayRequestError extends Error {},
}));

import {
  GET as getV1Users,
  POST as createV1User,
} from "@/app/api/v1/admin/users/route";
import {
  GET as getV1Roles,
  POST as createV1Role,
} from "@/app/api/v1/admin/roles/route";
import { GET as getAuditLogs } from "@/app/api/admin/audit/route";

function denied(status: 401 | 403) {
  return {
    ok: false,
    response: NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Forbidden" },
      { status },
    ),
  };
}

describe("authoritative legacy administrator routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.getGatewaySessionToken.mockResolvedValue(null);
    dbMocks.usersFindMany.mockResolvedValue([]);
    dbMocks.auditFindMany.mockResolvedValue([]);
  });

  it.each([
    ["v1 users read", getV1Users],
    ["v1 users create", createV1User],
    ["v1 roles read", getV1Roles],
    ["v1 roles create", createV1Role],
    ["audit log read", getAuditLogs],
  ])("returns the authoritative gate response for %s", async (_label, handler) => {
    authMocks.requireAdmin.mockResolvedValue(denied(403));

    const response = await handler();

    expect(response.status).toBe(403);
    expect(authMocks.requireAdmin).toHaveBeenCalledTimes(1);
    expect(dbMocks.usersFindMany).not.toHaveBeenCalled();
    expect(dbMocks.auditFindMany).not.toHaveBeenCalled();
  });

  it("allows an authoritative administrator to read users", async () => {
    authMocks.requireAdmin.mockResolvedValue({
      ok: true,
      session: { userId: "admin-1", role: "admin" },
      accountStatus: "active",
      claimsChanged: false,
    });

    const response = await getV1Users();

    expect(response.status).toBe(200);
    expect(dbMocks.usersFindMany).toHaveBeenCalledTimes(1);
  });

  it("allows an authoritative administrator to read audit logs", async () => {
    authMocks.requireAdmin.mockResolvedValue({
      ok: true,
      session: { userId: "admin-1", role: "admin" },
      accountStatus: "active",
      claimsChanged: false,
    });

    const response = await getAuditLogs();

    expect(response.status).toBe(200);
    expect(dbMocks.auditFindMany).toHaveBeenCalledTimes(1);
  });
});
