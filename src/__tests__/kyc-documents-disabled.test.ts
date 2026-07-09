import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/auth-helpers", () => ({
  requireSession: vi.fn(async () => ({
    ok: true,
    session: { userId: "user-1", role: "client" },
  })),
}));

import { POST } from "@/app/api/kyc/documents/route";

describe("KYC document intake", () => {
  it("remains fail closed during GEM Verify Phase 1", async () => {
    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("SECURE_DOCUMENT_UPLOAD_NOT_ACTIVE");
    expect(body.requirements).toContain("malware scanning and quarantine");
  });
});
