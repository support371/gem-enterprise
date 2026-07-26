import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  discoverCompletedRenderCandidates,
  loadVideoWorkerConfig,
  mimeTypeForFile,
  resolveComfyOutputPath,
  runVideoWorkerIteration,
  type VideoWorkerConfig,
} from "@/lib/video/worker-agent";

const renderJobId = "11111111-1111-4111-8111-111111111111";

function history(fileName = "render.mp4") {
  return {
    "prompt-1": {
      prompt: [
        1,
        "prompt-1",
        {},
        {
          gemRenderJobId: renderJobId,
          workspaceId: "workspace-1",
          contentId: "content-1",
        },
      ],
      status: { status_str: "success", completed: true },
      outputs: {
        "19": {
          videos: [
            {
              filename: fileName,
              subfolder: "gem",
              type: "output",
            },
          ],
        },
      },
    },
  };
}

async function testConfig(): Promise<{
  config: VideoWorkerConfig;
  root: string;
  outputPath: string;
}> {
  const root = await mkdtemp(path.join(tmpdir(), "gem-video-worker-"));
  const outputPath = path.join(root, "gem", "render.mp4");
  const config = loadVideoWorkerConfig({
    COMFYUI_BASE_URL: "http://comfy.test",
    COMFYUI_OUTPUT_DIR: root,
    GEM_VIDEO_WORKER_API_BASE_URL: "https://gem.test",
    VIDEO_RENDER_CALLBACK_SECRET: "c".repeat(48),
    SUPABASE_URL: "https://storage.test",
    SUPABASE_SERVICE_ROLE_KEY: "s".repeat(64),
    VIDEO_RENDER_SUPABASE_BUCKET: "media",
    VIDEO_RENDER_STORAGE_PREFIX: "video-renders",
    VIDEO_RENDER_WORKER_STATE_FILE: path.join(root, "state.json"),
    VIDEO_RENDER_WORKER_ID: "22222222-2222-4222-8222-222222222222",
    VIDEO_RENDER_WORKER_STABILITY_DELAY_MS: "250",
  });
  return { config, root, outputPath };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("trusted video render worker agent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("discovers only completed GEM-tagged video output", () => {
    const candidates = discoverCompletedRenderCandidates({
      ...history(),
      "prompt-incomplete": {
        prompt: [{ gemRenderJobId: renderJobId }],
        status: { status_str: "running", completed: false },
        outputs: { "1": { videos: [{ filename: "other.mp4" }] } },
      },
      "prompt-unbound": {
        status: { status_str: "success", completed: true },
        outputs: { "1": { videos: [{ filename: "unbound.mp4" }] } },
      },
    });

    expect(candidates).toEqual([
      {
        renderJobId,
        promptId: "prompt-1",
        output: {
          fileName: "render.mp4",
          subfolder: "gem",
          outputType: "output",
        },
      },
    ]);
  });

  it("prefers a permanent MP4 output over temporary files", () => {
    const payload = history();
    payload["prompt-1"].outputs = {
      "1": {
        videos: [
          { filename: "preview.mp4", subfolder: "temp", type: "temp" },
          { filename: "final.webm", subfolder: "gem", type: "output" },
          { filename: "final.mp4", subfolder: "gem", type: "output" },
        ],
      },
    };

    expect(discoverCompletedRenderCandidates(payload)[0]?.output.fileName).toBe(
      "final.mp4",
    );
  });

  it("blocks output paths that escape the ComfyUI output root", () => {
    expect(() =>
      resolveComfyOutputPath("/safe/output", {
        fileName: "render.mp4",
        subfolder: "../../private",
        outputType: "output",
      }),
    ).toThrow("VIDEO_WORKER_OUTPUT_PATH_INVALID");
    expect(
      resolveComfyOutputPath("/safe/output", {
        fileName: "render.mp4",
        subfolder: "gem",
        outputType: "output",
      }),
    ).toBe(path.resolve("/safe/output/gem/render.mp4"));
  });

  it("maps approved video extensions to callback MIME types", () => {
    expect(mimeTypeForFile("render.mp4")).toBe("video/mp4");
    expect(mimeTypeForFile("render.webm")).toBe("video/webm");
    expect(mimeTypeForFile("render.mov")).toBe("video/quicktime");
    expect(() => mimeTypeForFile("render.exe")).toThrow(
      "VIDEO_WORKER_OUTPUT_TYPE_UNSUPPORTED",
    );
  });

  it("uploads, verifies, checkpoints, and skips completed work after restart", async () => {
    const { config, outputPath } = await testConfig();
    await import("node:fs/promises").then(({ mkdir }) =>
      mkdir(path.dirname(outputPath), { recursive: true }),
    );
    await writeFile(outputPath, Buffer.from("completed-video"));

    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/history?")) return jsonResponse(history());
      if (url.includes("/storage/v1/object/media/") && init?.method === "POST") {
        expect(init.headers).toMatchObject({
          Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
          "Content-Type": "video/mp4",
        });
        return jsonResponse({ Key: "video-renders/render.mp4" });
      }
      if (url.includes("/storage/v1/object/public/media/") && init?.method === "HEAD") {
        return new Response(null, {
          status: 200,
          headers: {
            "Content-Length": String(Buffer.byteLength("completed-video")),
            "Content-Type": "video/mp4",
          },
        });
      }
      if (url === "https://gem.test/api/video/uploads/verify") {
        const body = JSON.parse(String(init?.body));
        expect(body).toMatchObject({
          renderJobId,
          fileName: "render.mp4",
          mimeType: "video/mp4",
          fileSize: Buffer.byteLength("completed-video"),
        });
        expect(body.checksumSha256).toMatch(/^[a-f0-9]{64}$/);
        return jsonResponse({ ok: true, data: { uploadId: "upload-1" } }, 201);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const first = await runVideoWorkerIteration(config, {
      fetchImpl: fetchMock as typeof fetch,
      sleep: async () => undefined,
      now: () => new Date("2026-07-26T10:00:00.000Z"),
    });
    expect(first).toMatchObject({
      discovered: 1,
      processed: 1,
      verified: 1,
      failed: 0,
    });

    const state = JSON.parse(await readFile(config.stateFile, "utf8"));
    expect(state.items[renderJobId]).toMatchObject({
      status: "verified",
      attempts: 1,
      manifest: { renderJobId, fileName: "render.mp4" },
    });

    fetchMock.mockClear();
    const second = await runVideoWorkerIteration(config, {
      fetchImpl: fetchMock as typeof fetch,
      sleep: async () => undefined,
      now: () => new Date("2026-07-26T10:01:00.000Z"),
    });
    expect(second).toMatchObject({
      discovered: 1,
      processed: 0,
      skipped: 1,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries a failed callback without uploading the video again", async () => {
    const { config, outputPath } = await testConfig();
    await import("node:fs/promises").then(({ mkdir }) =>
      mkdir(path.dirname(outputPath), { recursive: true }),
    );
    await writeFile(outputPath, Buffer.from("retry-video"));

    let callbackAttempts = 0;
    let uploadAttempts = 0;
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/history?")) return jsonResponse(history());
      if (url.includes("/storage/v1/object/media/") && init?.method === "POST") {
        uploadAttempts += 1;
        return jsonResponse({ Key: "video-renders/render.mp4" });
      }
      if (url.includes("/storage/v1/object/public/media/") && init?.method === "HEAD") {
        return new Response(null, {
          status: 200,
          headers: {
            "Content-Length": String(Buffer.byteLength("retry-video")),
            "Content-Type": "video/mp4",
          },
        });
      }
      if (url === "https://gem.test/api/video/uploads/verify") {
        callbackAttempts += 1;
        return callbackAttempts === 1
          ? jsonResponse({ error: "temporary" }, 503)
          : jsonResponse({ ok: true }, 201);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const first = await runVideoWorkerIteration(config, {
      fetchImpl: fetchMock as typeof fetch,
      sleep: async () => undefined,
      now: () => new Date("2026-07-26T10:00:00.000Z"),
    });
    expect(first.failed).toBe(1);

    const second = await runVideoWorkerIteration(config, {
      fetchImpl: fetchMock as typeof fetch,
      sleep: async () => undefined,
      now: () => new Date("2026-07-26T10:01:00.000Z"),
    });
    expect(second.verified).toBe(1);
    expect(uploadAttempts).toBe(1);
    expect(callbackAttempts).toBe(2);
  });

  it("fails closed when required worker secrets or paths are absent", () => {
    expect(() => loadVideoWorkerConfig({})).toThrow();
    expect(() =>
      loadVideoWorkerConfig({
        COMFYUI_BASE_URL: "http://comfy.test",
        COMFYUI_OUTPUT_DIR: "/tmp/output",
        GEM_VIDEO_WORKER_API_BASE_URL: "https://gem.test",
        VIDEO_RENDER_CALLBACK_SECRET: "short",
        SUPABASE_URL: "https://storage.test",
        SUPABASE_SERVICE_ROLE_KEY: "short",
      }),
    ).toThrow();
  });
});
