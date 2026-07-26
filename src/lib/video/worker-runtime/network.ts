import { z } from "zod";
import { probeComfyUi, videoJobInputSchema } from "@/lib/video/comfyui";
import {
  VideoWorkerError,
  type DownloadedVideo,
  type VideoWorkerConfig,
  type VideoWorkerDispatchJob,
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

const workerDispatchReadinessSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    ready: z.literal(true),
    pending: z.number().int().nonnegative(),
    leased: z.number().int().nonnegative(),
  }),
});

const workerDispatchResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    jobs: z.array(
      z.object({
        renderJobId: z.string().uuid(),
        workspaceId: z.string().min(1),
        contentId: z.string().min(1),
        contentVersionId: z.string().min(1),
        complianceReviewId: z.string().min(1),
        clientId: z.string().uuid(),
        claimId: z.string().uuid(),
        claimExpiresAt: z.string(),
        dispatchAttemptCount: z.number().int().nonnegative(),
        dispatch: videoJobInputSchema,
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

export async function fetchWorkerDispatchReadiness(config: VideoWorkerConfig) {
  const { response, payload } = await timedJsonFetch(
    `${config.gemBaseUrl}/api/video/worker/dispatch`,
    {
      method: "GET",
      headers: callbackHeaders(config),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_DISPATCH_READINESS_FAILED",
      `The GEM dispatch readiness endpoint returned HTTP ${response.status}.`,
      response.status,
    );
  }
  const parsed = workerDispatchReadinessSchema.safeParse(payload);
  if (!parsed.success) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_DISPATCH_READINESS_INVALID",
      "The GEM dispatch readiness endpoint returned an invalid response.",
      502,
    );
  }
  return parsed.data.data;
}

export async function claimWorkerDispatchJobs(
  config: VideoWorkerConfig,
): Promise<VideoWorkerDispatchJob[]> {
  const { response, payload } = await timedJsonFetch(
    `${config.gemBaseUrl}/api/video/worker/dispatch`,
    {
      method: "POST",
      headers: {
        ...callbackHeaders(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        limit: config.batchSize,
        leaseMs: config.dispatchLeaseMs,
      }),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_DISPATCH_FEED_FAILED",
      `The GEM dispatch feed returned HTTP ${response.status}.`,
      response.status,
    );
  }
  const parsed = workerDispatchResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_DISPATCH_FEED_INVALID",
      "The GEM dispatch feed returned an invalid response.",
      502,
    );
  }
  return parsed.data.data.jobs as VideoWorkerDispatchJob[];
}

export async function completeWorkerDispatch(
  config: VideoWorkerConfig,
  job: VideoWorkerDispatchJob,
  promptId: string,
) {
  const { response } = await timedJsonFetch(
    `${config.gemBaseUrl}/api/video/worker/dispatch/${encodeURIComponent(
      job.renderJobId,
    )}/complete`,
    {
      method: "POST",
      headers: {
        ...callbackHeaders(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ claimId: job.claimId, promptId }),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_DISPATCH_CALLBACK_FAILED",
      `The GEM dispatch callback returned HTTP ${response.status}.`,
      response.status,
    );
  }
}

export async function failWorkerDispatch(
  config: VideoWorkerConfig,
  job: VideoWorkerDispatchJob,
  input: {
    retryable: boolean;
    errorCode: string;
    errorMessage: string;
  },
) {
  const { response } = await timedJsonFetch(
    `${config.gemBaseUrl}/api/video/worker/dispatch/${encodeURIComponent(
      job.renderJobId,
    )}/fail`,
    {
      method: "POST",
      headers: {
        ...callbackHeaders(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        claimId: job.claimId,
        retryable: input.retryable,
        errorCode: input.errorCode.slice(0, 100),
        errorMessage: input.errorMessage.slice(0, 500),
      }),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_DISPATCH_FAILURE_CALLBACK_FAILED",
      `The GEM dispatch-failure callback returned HTTP ${response.status}.`,
      response.status,
    );
  }
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

export async function finalizeVerifiedRenders(config: VideoWorkerConfig) {
  const { response, payload } = await timedJsonFetch(
    `${config.gemBaseUrl}/api/video/worker/finalize`,
    {
      method: "POST",
      headers: {
        ...callbackHeaders(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit: config.batchSize }),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_WORKER_FINALIZATION_FAILED",
      `The GEM finalization endpoint returned HTTP ${response.status}.`,
      response.status,
    );
  }
  return payload;
}

export async function checkVideoWorkerReadiness(config: VideoWorkerConfig) {
  const [jobs, dispatch, comfy, bucket] = await Promise.all([
    fetchWorkerJobs(config),
    fetchWorkerDispatchReadiness(config),
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
    pendingDispatchJobs: dispatch.pending,
    leasedDispatchJobs: dispatch.leased,
    comfyStatus: comfy.status,
    storageBucket: config.storageBucket,
  };
}
