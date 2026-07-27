import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const comfyMocks = vi.hoisted(() => ({
  getVideoJob: vi.fn(),
}));
const storeMocks = vi.hoisted(() => ({
  getVideoRenderJobById: vi.fn(),
  recordVerifiedVideoUpload: vi.fn(),
  updateVideoRenderState: vi.fn(),
}));
const securityMocks = vi.hoisted(() => ({
  emitTokMetricAudit: vi.fn(),
}));

vi.mock("@/lib/video/comfyui", () => ({ getVideoJob: comfyMocks.getVideoJob }));
vi.mock("@/lib/video/store", () => ({
  getVideoRenderJobById: storeMocks.getVideoRenderJobById,
  recordVerifiedVideoUpload: storeMocks.recordVerifiedVideoUpload,
  updateVideoRenderState: storeMocks.updateVideoRenderState,
}));
vi.mock("@/lib/tokmetric/security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/tokmetric/security")>(
    "@/lib/tokmetric/security",
  );
  return { ...actual, emitTokMetricAudit: securityMocks.emitTokMetricAudit };
});

import { verifyTrustedWorkerUpload } from "@/lib/video/worker-upload-verification";

const record = {
  id: "11111111-1111-4111-8111-111111111111",
  workspaceId: "workspace-1",
  contentId: "content-1",
  contentVersionId: "version-1",
  complianceReviewId: "review-1",
  requestedById: "admin-1",
  provider: "comfyui-local" as const,
  clientId: "client-1",
  externalPromptId: "prompt-1",
  idempotencyKey: "render-1",
  requestHash: "hash-1",
  state: "QUEUED" as const,
  errorCode: null,
  errorMessage: null,
  outputManifest: {},
  createdAt: new Date("2026-07-26T00:00:00.000Z"),
  updatedAt: new Date("2026-07-26T00:00:00.000Z"),
  completedAt: null,
  finalizedAt: null,
};
const completed = {
  ...record,
  state: "COMPLETED" as const,
  outputManifest: {
    "19": {
      videos: [
        {
          filename: "render.mp4",
          subfolder: "daily",
          type: "output",
        },
      ],
    },
  },
  completedAt: new Date("2026-07-26T00:05:00.000Z"),
};
const input = {
  renderJobId: record.id,
  storageRef:
    "https://project.supabase.co/storage/v1/object/gem-video-renders/render.mp4",
  fileName: "render.mp4",
  mimeType: "video/mp4",
  fileSize: 2048,
  checksumSha256: "a".repeat(64),
  correlationId: "correlation-1",
  outputManifest: completed.outputManifest,
};

describe("trusted worker private upload verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VIDEO_RENDER_STORAGE_URL", "https://project.supabase.co");
    vi.stubEnv("VIDEO_ASSET_ALLOWED_ORIGINS", "https://project.supabase.co");
    vi.stubEnv("VIDEO_RENDER_STORAGE_KEY", "storage-secret");
    storeMocks.getVideoRenderJobById.mockResolvedValue(record);
    comfyMocks.getVideoJob.mockResolvedValue({
      promptId: "prompt-1",
      status: "completed",
      outputs: completed.outputManifest,
    });
    storeMocks.updateVideoRenderState.mockResolvedValue(completed);
    storeMocks.recordVerifiedVideoUpload.mockResolvedValue({
      id: "upload-1",
      renderJobId: record.id,
      storageRef: input.storageRef,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      checksumSha256: input.checksumSha256,
      safeMetadata: {},
      verifiedAt: new Date("2026-07-26T00:06:00.000Z"),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("authenticates the server-side HEAD request only to the configured storage origin", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 200,
        headers: {
          "content-length": "2048",
          "content-type": "video/mp4",
          etag: "etag-1",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyTrustedWorkerUpload(input);

    expect(fetchMock).toHaveBeenCalledWith(
      input.storageRef,
      expect.objectContaining({
        method: "HEAD",
        headers: {
          Authorization: "Bearer storage-secret",
          apikey: "storage-secret",
        },
      }),
    );
    expect(storeMocks.recordVerifiedVideoUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        renderJobId: record.id,
        checksumSha256: input.checksumSha256,
        safeMetadata: expect.objectContaining({
          authenticatedStorageVerification: true,
        }),
      }),
    );
    expect(result).toMatchObject({
      uploadId: "upload-1",
      externalPublicationTaken: false,
    });
  });

  it("never sends the storage credential to a different approved origin", async () => {
    vi.stubEnv(
      "VIDEO_ASSET_ALLOWED_ORIGINS",
      "https://project.supabase.co,https://assets.example.com",
    );
    const externalInput = {
      ...input,
      storageRef: "https://assets.example.com/render.mp4",
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 200,
        headers: {
          "content-length": "2048",
          "content-type": "video/mp4",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await verifyTrustedWorkerUpload(externalInput);
    expect(fetchMock).toHaveBeenCalledWith(
      externalInput.storageRef,
      expect.objectContaining({ headers: {} }),
    );
  });

  it("rejects a file that is not in the exact provider output manifest", async () => {
    vi.stubGlobal("fetch", vi.fn());
    await expect(
      verifyTrustedWorkerUpload({ ...input, fileName: "other.mp4" }),
    ).rejects.toMatchObject({ code: "VIDEO_OUTPUT_BINDING_INVALID" });
    expect(storeMocks.recordVerifiedVideoUpload).not.toHaveBeenCalled();
  });

  it("rejects storage metadata that differs from the worker manifest", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: {
            "content-length": "4096",
            "content-type": "video/mp4",
          },
        }),
      ),
    );

    await expect(verifyTrustedWorkerUpload(input)).rejects.toMatchObject({
      code: "VIDEO_STORAGE_SIZE_MISMATCH",
    });
    expect(storeMocks.recordVerifiedVideoUpload).not.toHaveBeenCalled();
  });
});
