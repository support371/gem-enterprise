import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const verificationMocks = vi.hoisted(() => ({
  verifyTrustedWorkerUpload: vi.fn(),
}));

vi.mock("@/lib/video/worker-upload-verification", () => ({
  verifyTrustedWorkerUpload: verificationMocks.verifyTrustedWorkerUpload,
}));

import { POST } from "@/app/api/video/uploads/verify/route";

const payload = {
  renderJobId: "11111111-1111-4111-8111-111111111111",
  storageRef: "https://assets.example.com/render.mp4",
  fileName: "render.mp4",
  mimeType: "video/mp4",
  fileSize: 2048,
  checksumSha256: "a".repeat(64),
  outputManifest: {
    "19": {
      videos: [{ filename: "render.mp4", subfolder: "daily", type: "output" }],
    },
  },
};

function request(secret?: string) {
  return new NextRequest("http://localhost/api/video/uploads/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}

describe("trusted video upload callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VIDEO_RENDER_CALLBACK_SECRET", "worker-secret-123456789");
    verificationMocks.verifyTrustedWorkerUpload.mockResolvedValue({
      renderJobId: payload.renderJobId,
      uploadId: "upload-1",
      contentId: "content-1",
      contentVersionId: "version-1",
      verifiedAt: new Date("2026-07-25T00:00:00.000Z"),
      externalPublicationTaken: false,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed when the callback secret is not configured", async () => {
    vi.stubEnv("VIDEO_RENDER_CALLBACK_SECRET", "");
    const response = await POST(request());
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.error.code).toBe("VIDEO_RENDER_CALLBACK_NOT_CONFIGURED");
  });

  it("rejects an invalid worker bearer secret", async () => {
    const response = await POST(request("wrong-secret"));
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error.code).toBe("VIDEO_RENDER_CALLBACK_UNAUTHORIZED");
    expect(verificationMocks.verifyTrustedWorkerUpload).not.toHaveBeenCalled();
  });

  it("verifies a valid trusted worker manifest", async () => {
    const response = await POST(request("worker-secret-123456789"));
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(verificationMocks.verifyTrustedWorkerUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        renderJobId: payload.renderJobId,
        storageRef: payload.storageRef,
        checksumSha256: payload.checksumSha256,
      }),
    );
    expect(body.data.uploadId).toBe("upload-1");
    expect(body.data.externalPublicationTaken).toBe(false);
  });
});
