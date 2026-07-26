import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const storeMocks = vi.hoisted(() => ({
  listTrustedWorkerRenderJobs: vi.fn(),
}));

vi.mock("@/lib/video/worker-store", () => ({
  listTrustedWorkerRenderJobs: storeMocks.listTrustedWorkerRenderJobs,
}));

import { GET } from "@/app/api/video/worker/jobs/route";

function request(secret?: string, limit = "10") {
  return new NextRequest(
    `http://localhost/api/video/worker/jobs?limit=${encodeURIComponent(limit)}`,
    {
      headers: secret ? { Authorization: `Bearer ${secret}` } : {},
    },
  );
}

describe("trusted video worker job feed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VIDEO_RENDER_CALLBACK_SECRET", "worker-secret-123456789");
    storeMocks.listTrustedWorkerRenderJobs.mockResolvedValue([
      {
        id: "11111111-1111-4111-8111-111111111111",
        workspaceId: "workspace-1",
        contentId: "content-1",
        contentVersionId: "version-1",
        externalPromptId: "prompt-1",
        state: "COMPLETED",
        createdAt: new Date("2026-07-26T00:00:00.000Z"),
        updatedAt: new Date("2026-07-26T00:05:00.000Z"),
      },
    ]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects unauthenticated worker discovery", async () => {
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(storeMocks.listTrustedWorkerRenderJobs).not.toHaveBeenCalled();
  });

  it("fails closed when the worker secret is not configured", async () => {
    vi.stubEnv("VIDEO_RENDER_CALLBACK_SECRET", "");
    const response = await GET(request("worker-secret-123456789"));
    const payload = await response.json();
    expect(response.status).toBe(503);
    expect(payload.error.code).toBe("VIDEO_RENDER_CALLBACK_NOT_CONFIGURED");
  });

  it("validates and bounds the requested batch size", async () => {
    const invalid = await GET(request("worker-secret-123456789", "200"));
    const invalidPayload = await invalid.json();
    expect(invalid.status).toBe(400);
    expect(invalidPayload.error.code).toBe("VIDEO_WORKER_QUERY_INVALID");
    expect(storeMocks.listTrustedWorkerRenderJobs).not.toHaveBeenCalled();

    const response = await GET(request("worker-secret-123456789", "20"));
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(storeMocks.listTrustedWorkerRenderJobs).toHaveBeenCalledWith(20);
    expect(payload.data.jobs[0]).toMatchObject({
      renderJobId: "11111111-1111-4111-8111-111111111111",
      promptId: "prompt-1",
      state: "COMPLETED",
    });
    expect(payload.data.externalPublicationTaken).toBe(false);
  });
});
