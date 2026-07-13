import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const authMocks = vi.hoisted(() => ({ requirePlatformOwner: vi.fn() }));

vi.mock("@/lib/api/auth-helpers", () => ({
  requirePlatformOwner: authMocks.requirePlatformOwner,
}));

import { GET } from "@/app/api/admin/plan-workspaces/route";
import { getPlanWorkspace, planWorkspaceCatalog } from "@/lib/planWorkspaces";

describe("owner plan workspace viewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requirePlatformOwner.mockResolvedValue({
      ok: true,
      session: { userId: "owner-1", role: "super_admin" },
      accountStatus: "active",
      claimsChanged: false,
    });
  });

  it("defines the Basic, Professional, and Enterprise plan sequence", () => {
    expect(planWorkspaceCatalog.map((plan) => plan.id)).toEqual([
      "basic",
      "professional",
      "enterprise",
    ]);
    expect(getPlanWorkspace("enterprise")?.personas.some((persona) => persona.id === "platform-owner")).toBe(true);
  });

  it("returns only curated read-only preview data to a platform owner", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.mode).toBe("owner_read_only_preview");
    expect(body.protections).toEqual({
      tenantDataIncluded: false,
      productionMutationAllowed: false,
      sharedCredentialsRequired: false,
    });
  });

  it("fails closed when the authoritative owner gate rejects access", async () => {
    authMocks.requirePlatformOwner.mockResolvedValue({
      ok: false,
      response: NextResponse.json(
        { error: "Platform Owner access is required.", code: "PLATFORM_OWNER_REQUIRED" },
        { status: 403 },
      ),
    });

    const response = await GET();
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: "PLATFORM_OWNER_REQUIRED" });
  });
});
