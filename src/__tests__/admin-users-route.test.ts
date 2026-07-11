import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const authMocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
}));
const dbMocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  findMany: vi.fn(),
}));
const auditMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/auth-helpers", () => ({
  requireAdmin: authMocks.requireAdmin,
  getRequestContext: () => ({ ipAddress: "127.0.0.1", userAgent: "test" }),
  badRequest: (message: string, details?: unknown) =>
    NextResponse.json(details ? { error: message, details } : { error: message }, { status: 400 }),
  forbidden: (message: string) => NextResponse.json({ error: message }, { status: 403 }),
  serverError: () => NextResponse.json({ error: "Internal server error" }, { status: 500 }),
}));
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: dbMocks.findUnique,
      update: dbMocks.update,
      findMany: dbMocks.findMany,
    },
  },
}));
vi.mock("@/lib/audit", () => ({ emitAuditLog: auditMock }));

import { PATCH } from "@/app/api/admin/users/route";

const target = {
  id: "user-2",
  email: "reviewer@example.com",
  role: "client",
  isActive: true,
  status: "active",
  isEmailVerified: true,
};

function request(body: unknown) {
  return new NextRequest("http://localhost/api/admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("admin user role assignment API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireAdmin.mockResolvedValue({
      ok: true,
      session: { userId: "admin-1", role: "admin" },
      accountStatus: "active",
      claimsChanged: false,
    });
    dbMocks.findUnique.mockResolvedValue(target);
    dbMocks.update.mockResolvedValue({ ...target, role: "analyst" });
  });

  it("prevents a regular admin from granting administrator", async () => {
    const response = await PATCH(
      request({
        id: target.id,
        role: "admin",
        confirmEmail: target.email,
        reason: "Administrator access is requested for the pilot.",
      }),
    );
    expect(response.status).toBe(403);
    expect(dbMocks.update).not.toHaveBeenCalled();
  });

  it("rejects an email confirmation mismatch", async () => {
    const response = await PATCH(
      request({
        id: target.id,
        role: "analyst",
        confirmEmail: "wrong@example.com",
        reason: "Assign this account to the pilot review team.",
      }),
    );
    expect(response.status).toBe(400);
    expect(dbMocks.update).not.toHaveBeenCalled();
  });

  it("assigns analyst and records the reason in the audit event", async () => {
    const response = await PATCH(
      request({
        id: target.id,
        role: "analyst",
        confirmEmail: target.email,
        reason: "Assign this account to the controlled verification pilot.",
      }),
    );
    expect(response.status).toBe(200);
    expect(dbMocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: "analyst" } }),
    );
    expect(auditMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "role_change",
        metadata: expect.objectContaining({
          previousRole: "client",
          newRole: "analyst",
          reason: "Assign this account to the controlled verification pilot.",
        }),
      }),
    );
  });

  it("rejects promotion of an unverified account", async () => {
    dbMocks.findUnique.mockResolvedValue({ ...target, isEmailVerified: false });
    const response = await PATCH(
      request({
        id: target.id,
        role: "analyst",
        confirmEmail: target.email,
        reason: "Assign this account to the controlled verification pilot.",
      }),
    );
    expect(response.status).toBe(409);
    expect(dbMocks.update).not.toHaveBeenCalled();
  });
});
