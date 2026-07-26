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
  batchSize: 5,
  pollIntervalMs: 15_000,
  maxFileBytes: 1024,
  requestTimeoutMs: 30_000,
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
        new Response(new Uint8Array([1]), {
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
      status: 413,
    });
  });

  it("uploads to a deterministic private object with upsert disabled", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "gem-worker-test-"));
    const tempPath = join(tempDirectory, "render.mp4");
    await writeFile(tempPath, "render-data");
    const downloaded: DownloadedVideo = {
      tempDirectory,
      tempPath,
      fileName: "render.mp4",
      mimeType: "video/mp4",
      fileSize: 11,
      checksumSha256: "b".repeat(64),
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    try {
      const result = await uploadDownloadedVideo(config, job, downloaded);
      expect(result.reused).toBe(false);
      expect(result.objectPath).toContain(
        `${job.renderJobId}/${"b".repeat(64)}-render.mp4`,
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/storage/v1/object/gem-video-renders/renders/"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer storage-secret",
            apikey: "storage-secret",
            "Content-Type": "video/mp4",
            "x-upsert": "false",
          }),
          duplex: "half",
        }),
      );
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("reuses an existing deterministic object only when size and MIME match", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "gem-worker-test-"));
    const tempPath = join(tempDirectory, "render.mp4");
    await writeFile(tempPath, "render-data");
    const downloaded: DownloadedVideo = {
      tempDirectory,
      tempPath,
      fileName: "render.mp4",
      mimeType: "video/mp4",
      fileSize: 11,
      checksumSha256: "c".repeat(64),
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("conflict", { status: 409 }))
      .mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          headers: {
            "content-length": "11",
            "content-type": "video/mp4",
          },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    try {
      const result = await uploadDownloadedVideo(config, job, downloaded);
      expect(result.reused).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
        method: "HEAD",
        headers: {
          Authorization: "Bearer storage-secret",
          apikey: "storage-secret",
        },
      });
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });
});
