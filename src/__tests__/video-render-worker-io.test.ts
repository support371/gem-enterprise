import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  downloadVideoOutput,
  uploadDownloadedVideo,
  type DownloadedVideo,
  type VideoOutputDescriptor,
  type VideoWorkerConfig,
  type VideoWorkerJob,
} from "@/lib/video/worker-runtime";

const config: VideoWorkerConfig = {
  gemBaseUrl: "https://www.gemcybersecurityassist.com",
  callbackSecret: "callback-secret",
  comfyBaseUrl: "https://comfy.example.com",
  comfyBearerToken: "comfy-secret",
  storageBaseUrl: "https://project.supabase.co",
  storageKey: "storage-secret",
  storageBucket: "gem-video-renders",
  storagePrefix: "renders",
  stateDirectory: join(tmpdir(), "gem-video-worker-io-test"),
  batchSize: 5,
  dispatchLeaseMs: 120_000,
  pollIntervalMs: 15_000,
  maxFileBytes: 1024,
  requestTimeoutMs: 30_000,
  transferTimeoutMs: 60_000,
};
const output: VideoOutputDescriptor = {
  fileName: "render.mp4",
  subfolder: "daily",
  type: "output",
  mimeType: "video/mp4",
};
const job: VideoWorkerJob = {
  renderJobId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "workspace-1",
  contentId: "content-1",
  contentVersionId: "version-1",
  promptId: "prompt-1",
  state: "COMPLETED",
  createdAt: "2026-07-26T00:00:00.000Z",
  updatedAt: "2026-07-26T00:05:00.000Z",
};

describe("trusted video worker I/O", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("streams a completed output to disk and calculates the exact SHA-256", async () => {
    const bytes = new TextEncoder().encode("GEM governed video bytes");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(bytes, {
          status: 200,
          headers: {
            "content-length": String(bytes.byteLength),
            "content-type": "video/mp4",
          },
        }),
      ),
    );

    const result = await downloadVideoOutput(config, output);
    try {
      expect(result.fileSize).toBe(bytes.byteLength);
      expect(result.checksumSha256).toBe(
        createHash("sha256").update(bytes).digest("hex"),
      );
      expect(result.mimeType).toBe("video/mp4");
    } finally {
      await rm(result.tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects a declared file larger than the configured maximum", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("too large", {
          status: 200,
          headers: {
            "content-length": "2048",
            "content-type": "video/mp4",
          },
        }),
      ),
    );

    await expect(downloadVideoOutput(config, output)).rejects.toMatchObject({
      code: "VIDEO_OUTPUT_TOO_LARGE",
    });
  });

  it("uploads a hashed temporary file to the deterministic private object path", async () => {
    const directory = await mkdtemp(join(tmpdir(), "gem-video-upload-test-"));
    const tempPath = join(directory, "render.mp4");
    await writeFile(tempPath, "video bytes");
    const downloaded: DownloadedVideo = {
      tempDirectory: directory,
      tempPath,
      fileName: "render.mp4",
      mimeType: "video/mp4",
      fileSize: 11,
      checksumSha256: "a".repeat(64),
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    try {
      const uploaded = await uploadDownloadedVideo(config, job, downloaded);
      expect(uploaded.storageRef).toContain(
        "/storage/v1/object/gem-video-renders/renders/workspace-1/content-1/11111111-1111-4111-8111-111111111111/",
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`${"a".repeat(64)}-render.mp4`),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "video/mp4",
            "x-upsert": "false",
          }),
        }),
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
