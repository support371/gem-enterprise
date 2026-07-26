import { z } from "zod";
import { probeComfyUi } from "@/lib/video/comfyui";
import {
  VideoWorkerError,
  type DownloadedVideo,
  type VideoWorkerConfig,
  type VideoWorkerJob,
} from "./types";

const workerJobsResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    jobs: z.array(
      z.object({
        renderJobId: z.string().uuid(),
        workspaceId: z.string().min(1),
        contentId: z.string().min(1),
        contentVersionId: z.string().min(1),
        promptId: z.string().min(1),
        state: z.enum(["QUEUED", "RUNNING", "COMPLETED"]),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
    ),
  }),
});

export function callbackHeaders(config: VideoWorkerConfig) {
  return {
    Authorization: `Bearer ${config.callbackSecret}`,
  };
}

export function storageHeaders(config: VideoWorkerConfig) {
  return {
    Authorization: `Bearer ${config.storageKey}`,
    apikey: config.storageKey,
  };
}

async function withRequestTimeout<T>(
  timeoutMs: number,
  work: (signal: AbortSignal) => Promise<T>,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await work(controller.signal);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new VideoWorkerError(
        "VIDEO_WORKER_REQUEST_TIMEOUT",
        "A worker network request timed out.",
        504,
      );
    }
    if (error instanceof VideoWorkerError) throw error;
    throw new VideoWorkerError(
      "VIDEO_WORKER_REQUEST_FAILED",
      "A worker network request failed.",
      503,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function timedFetch(
  url: string,
  init: RequestInit,
  timeoutMs: number,
) {
  return withRequestTimeout(timeoutMs, (signal) =>
    fetch(url, { ...init, signal }),
  );
}

export async function timedJsonFetch(
  url: string,
  init: RequestInit,
  timeoutMs: number,
) {
  return withRequestTimeout(timeoutMs, async (signal) => {
    const response = await fetch(url, { ...init, signal });
    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = null;
      }
    }
    return { response, payload, text };
  });
}

export async function fetchWorkerJobs(
  config: VideoWorkerConfig,
): Promise<VideoWorkerJob[]> {
  const url = new URL(`${config.gemBaseUrl}/api/video/worker/jobs`);
  url.searchParams.set("limit", String(config.batchSize));
  const { response, payload } = await timedJsonFetch(
    url.toString(),
    {
      method: "GET",
      headers: callbackHeaders(config),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_JOB_FEED_FAILED",
      `The GEM worker job feed returned HTTP ${response.status}.`,
      response.status,
    );
  }
  const parsed = workerJobsResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_JOB_FEED_INVALID",
      "The GEM worker job feed returned an invalid response.",
      502,
    );
  }
  return parsed.data.data.jobs as VideoWorkerJob[];
}

export async function verifyUploadedVideo(
  config: VideoWorkerConfig,
  job: VideoWorkerJob,
  downloaded: DownloadedVideo,
  storageRef: string,
) {
  const { response, payload } = await timedJsonFetch(
    `${config.gemBaseUrl}/api/video/uploads/verify`,
    {
      method: "POST",
      headers: {
        ...callbackHeaders(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        renderJobId: job.renderJobId,
        storageRef,
        fileName: downloaded.fileName,
        mimeType: downloaded.mimeType,
        fileSize: downloaded.fileSize,
        checksumSha256: downloaded.checksumSha256,
      }),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_UPLOAD_CALLBACK_FAILED",
      `The GEM upload-verification callback returned HTTP ${response.status}.`,
      response.status,
    );
  }
  return payload;
}

export async function checkVideoWorkerReadiness(config: VideoWorkerConfig) {
  const [jobs, comfy, bucket] = await Promise.all([
    fetchWorkerJobs(config),
    probeComfyUi(),
    timedFetch(
      `${config.storageBaseUrl}/storage/v1/bucket/${encodeURIComponent(
        config.storageBucket,
      )}`,
      {
        method: "GET",
        headers: storageHeaders(config),
        cache: "no-store",
      },
      config.requestTimeoutMs,
    ),
  ]);
  if (!comfy.ok) {
    throw new VideoWorkerError(
      "COMFYUI_READINESS_FAILED",
      `ComfyUI readiness returned HTTP ${comfy.status}.`,
      comfy.status,
    );
  }
  if (!bucket.ok) {
    throw new VideoWorkerError(
      "VIDEO_STORAGE_BUCKET_UNAVAILABLE",
      `The configured render bucket returned HTTP ${bucket.status}.`,
      bucket.status,
    );
  }
  return {
    ready: true,
    pendingJobs: jobs.length,
    comfyStatus: comfy.status,
    storageBucket: config.storageBucket,
  };
}
