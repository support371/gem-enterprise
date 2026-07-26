import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchWorkerJobs,
  type VideoWorkerConfig,
} from "@/lib/video/worker-runtime";

const config: VideoWorkerConfig = {
  gemBaseUrl: "https://www.gemcybersecurityassist.com",
  callbackSecret: "callback-secret",
  comfyBaseUrl: "https://comfy.example.com",
  comfyBearerToken: "comfy-secret",
  storageBaseUrl: "https://project.supabase.co",
  storageKey: "storage-key",
  storageBucket: "gem-video-renders",
  storagePrefix: "renders",
  batchSize: 5,
  pollIntervalMs: 15_000,
  maxFileBytes: 1024 * 1024,
  requestTimeoutMs: 10,
  transferTimeoutMs: 60_000,
};

describe("trusted video worker network timeouts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("keeps the timeout active while reading a JSON response body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        async (_url: string, init?: RequestInit) =>
          ({
            ok: true,
            status: 200,
            text: () =>
              new Promise<string>((_resolve, reject) => {
                init?.signal?.addEventListener(
                  "abort",
                  () => reject(new DOMException("Aborted", "AbortError")),
                  { once: true },
                );
              }),
          }) as Response,
      ),
    );

    await expect(fetchWorkerJobs(config)).rejects.toMatchObject({
      code: "VIDEO_WORKER_REQUEST_TIMEOUT",
      status: 504,
    });
  });
});
