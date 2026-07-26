import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { Readable, Transform } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { pipeline } from "node:stream/promises";
import { z } from "zod";
import { getVideoJob, probeComfyUi } from "@/lib/video/comfyui";

const GIBIBYTE = 1024 * 1024 * 1024;
const DEFAULT_MAX_FILE_BYTES = GIBIBYTE;
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_POLL_INTERVAL_MS = 15_000;
const DEFAULT_BATCH_SIZE = 5;
const VIDEO_MIME_TYPES = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
} as const;

export type VideoWorkerJob = {
  renderJobId: string;
  workspaceId: string;
  contentId: string;
  contentVersionId: string;
  promptId: string;
  state: "QUEUED" | "RUNNING" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
};

export type VideoOutputDescriptor = {
  fileName: string;
  subfolder: string;
  type: string;
  mimeType: "video/mp4" | "video/webm" | "video/quicktime";
};

export type VideoWorkerConfig = {
  gemBaseUrl: string;
  callbackSecret: string;
  comfyBaseUrl: string;
  comfyBearerToken?: string;
  storageBaseUrl: string;
  storageKey: string;
  storageBucket: string;
  storagePrefix: string;
  batchSize: number;
  pollIntervalMs: number;
  maxFileBytes: number;
  requestTimeoutMs: number;
};

export type DownloadedVideo = {
  tempDirectory: string;
  tempPath: string;
  fileName: string;
  mimeType: VideoOutputDescriptor["mimeType"];
  fileSize: number;
  checksumSha256: string;
};

export class VideoWorkerError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "VideoWorkerError";
  }
}

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

function required(env: NodeJS.ProcessEnv, names: string[]) {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  throw new VideoWorkerError(
    "WORKER_CONFIGURATION_MISSING",
    `A required worker environment value is missing: ${names.join(" or ")}.`,
  );
}

function optionalInteger(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
    throw new VideoWorkerError(
      "WORKER_CONFIGURATION_INVALID",
      `${name} must be an integer between ${minimum} and ${maximum}.`,
    );
  }
  return parsed;
}

function normalizedUrl(value: string, name: string) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) throw new Error("unsupported protocol");
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new VideoWorkerError(
      "WORKER_CONFIGURATION_INVALID",
      `${name} must be a valid HTTP or HTTPS URL.`,
    );
  }
}

export function loadVideoWorkerConfig(
  env: NodeJS.ProcessEnv = process.env,
): VideoWorkerConfig {
  const gemBaseUrl = normalizedUrl(
    required(env, ["GEM_VIDEO_WORKER_API_URL", "GEM_BASE_URL"]),
    "GEM_VIDEO_WORKER_API_URL",
  );
  const comfyBaseUrl = normalizedUrl(
    required(env, ["COMFYUI_BASE_URL"]),
    "COMFYUI_BASE_URL",
  );
  const storageBaseUrl = normalizedUrl(
    required(env, ["VIDEO_RENDER_STORAGE_URL", "SUPABASE_URL"]),
    "VIDEO_RENDER_STORAGE_URL",
  );
  const storageBucket = required(env, ["VIDEO_RENDER_STORAGE_BUCKET"]);
  const storagePrefix = sanitizePathSegment(
    env.VIDEO_RENDER_STORAGE_PREFIX?.trim() || "renders",
  );

  return {
    gemBaseUrl,
    callbackSecret: required(env, ["VIDEO_RENDER_CALLBACK_SECRET"]),
    comfyBaseUrl,
    comfyBearerToken: env.COMFYUI_BEARER_TOKEN?.trim() || undefined,
    storageBaseUrl,
    storageKey: required(env, [
      "VIDEO_RENDER_STORAGE_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]),
    storageBucket: sanitizePathSegment(storageBucket),
    storagePrefix,
    batchSize: optionalInteger(
      env,
      "VIDEO_RENDER_WORKER_BATCH_SIZE",
      DEFAULT_BATCH_SIZE,
      1,
      20,
    ),
    pollIntervalMs: optionalInteger(
      env,
      "VIDEO_RENDER_WORKER_POLL_MS",
      DEFAULT_POLL_INTERVAL_MS,
      5_000,
      300_000,
    ),
    maxFileBytes: optionalInteger(
      env,
      "VIDEO_RENDER_MAX_FILE_BYTES",
      DEFAULT_MAX_FILE_BYTES,
      1,
      GIBIBYTE,
    ),
    requestTimeoutMs: optionalInteger(
      env,
      "VIDEO_RENDER_WORKER_TIMEOUT_MS",
      DEFAULT_REQUEST_TIMEOUT_MS,
      5_000,
      120_000,
    ),
  };
}

export function redactedWorkerConfig(config: VideoWorkerConfig) {
  return {
    gemBaseUrl: config.gemBaseUrl,
    comfyBaseUrl: config.comfyBaseUrl,
    comfyBearerTokenConfigured: Boolean(config.comfyBearerToken),
    storageBaseUrl: config.storageBaseUrl,
    storageBucket: config.storageBucket,
    storagePrefix: config.storagePrefix,
    storageKeyConfigured: Boolean(config.storageKey),
    callbackSecretConfigured: Boolean(config.callbackSecret),
    batchSize: config.batchSize,
    pollIntervalMs: config.pollIntervalMs,
    maxFileBytes: config.maxFileBytes,
    requestTimeoutMs: config.requestTimeoutMs,
  };
}

export function sanitizePathSegment(value: string) {
  const normalized = value
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 120);
  if (!normalized) {
    throw new VideoWorkerError(
      "VIDEO_PATH_SEGMENT_INVALID",
      "A deterministic storage path segment could not be produced.",
    );
  }
  return normalized;
}

export function mimeTypeForFileName(fileName: string) {
  const extension = extname(fileName).toLowerCase() as keyof typeof VIDEO_MIME_TYPES;
  return VIDEO_MIME_TYPES[extension] ?? null;
}

function outputDescriptors(value: unknown, results: VideoOutputDescriptor[] = []) {
  if (Array.isArray(value)) {
    for (const entry of value) outputDescriptors(entry, results);
    return results;
  }
  if (!value || typeof value !== "object") return results;

  const record = value as Record<string, unknown>;
  if (typeof record.filename === "string") {
    const mimeType = mimeTypeForFileName(record.filename);
    if (mimeType) {
      results.push({
        fileName: basename(record.filename),
        subfolder: typeof record.subfolder === "string" ? record.subfolder : "",
        type: typeof record.type === "string" ? record.type : "output",
        mimeType,
      });
    }
  }
  for (const entry of Object.values(record)) outputDescriptors(entry, results);
  return results;
}

export function selectVideoOutput(manifest: unknown) {
  const preference = new Map([
    ["video/mp4", 0],
    ["video/webm", 1],
    ["video/quicktime", 2],
  ]);
  const outputs = outputDescriptors(manifest)
    .filter((entry, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.fileName === entry.fileName &&
          candidate.subfolder === entry.subfolder &&
          candidate.type === entry.type,
      ) === index,
    )
    .sort((left, right) => {
      const typeOrder = Number(left.type !== "output") - Number(right.type !== "output");
      if (typeOrder !== 0) return typeOrder;
      const mimeOrder =
        (preference.get(left.mimeType) ?? 99) -
        (preference.get(right.mimeType) ?? 99);
      if (mimeOrder !== 0) return mimeOrder;
      return left.fileName.localeCompare(right.fileName);
    });

  if (!outputs[0]) {
    throw new VideoWorkerError(
      "VIDEO_OUTPUT_NOT_FOUND",
      "The completed ComfyUI job does not contain a supported video output.",
    );
  }
  return outputs[0];
}

export function buildStorageObjectPath(input: {
  storagePrefix: string;
  job: VideoWorkerJob;
  checksumSha256: string;
  fileName: string;
}) {
  const safeName = sanitizePathSegment(input.fileName);
  return [
    sanitizePathSegment(input.storagePrefix),
    sanitizePathSegment(input.job.workspaceId),
    sanitizePathSegment(input.job.contentId),
    sanitizePathSegment(input.job.renderJobId),
    `${input.checksumSha256.toLowerCase()}-${safeName}`,
  ].join("/");
}

export function buildComfyOutputUrl(
  config: VideoWorkerConfig,
  output: VideoOutputDescriptor,
) {
  const url = new URL(`${config.comfyBaseUrl}/view`);
  url.searchParams.set("filename", output.fileName);
  if (output.subfolder) url.searchParams.set("subfolder", output.subfolder);
  url.searchParams.set("type", output.type);
  return url.toString();
}

export function buildStorageObjectUrl(
  config: VideoWorkerConfig,
  objectPath: string,
) {
  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${config.storageBaseUrl}/storage/v1/object/${encodeURIComponent(
    config.storageBucket,
  )}/${encodedPath}`;
}

export function computeBackoffMs(attempt: number) {
  return Math.min(60_000, 1_000 * 2 ** Math.max(0, attempt));
}

function authHeaders(config: VideoWorkerConfig) {
  return {
    Authorization: `Bearer ${config.callbackSecret}`,
  };
}

function storageHeaders(config: VideoWorkerConfig) {
  return {
    Authorization: `Bearer ${config.storageKey}`,
    apikey: config.storageKey,
  };
}

async function timedFetch(
  url: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new VideoWorkerError(
        "VIDEO_WORKER_REQUEST_TIMEOUT",
        "A worker network request timed out.",
        504,
      );
    }
    throw new VideoWorkerError(
      "VIDEO_WORKER_REQUEST_FAILED",
      "A worker network request failed.",
      503,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchWorkerJobs(config: VideoWorkerConfig) {
  const url = new URL(`${config.gemBaseUrl}/api/video/worker/jobs`);
  url.searchParams.set("limit", String(config.batchSize));
  const response = await timedFetch(
    url.toString(),
    {
      method: "GET",
      headers: authHeaders(config),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  const payload = await response.json().catch(() => null);
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
  return parsed.data.data.jobs;
}

export async function downloadVideoOutput(
  config: VideoWorkerConfig,
  output: VideoOutputDescriptor,
): Promise<DownloadedVideo> {
  const headers: Record<string, string> = {};
  if (config.comfyBearerToken) {
    headers.Authorization = `Bearer ${config.comfyBearerToken}`;
  }
  const response = await timedFetch(
    buildComfyOutputUrl(config, output),
    { method: "GET", headers, cache: "no-store" },
    config.requestTimeoutMs,
  );
  if (!response.ok || !response.body) {
    throw new VideoWorkerError(
      "VIDEO_OUTPUT_DOWNLOAD_FAILED",
      `ComfyUI returned HTTP ${response.status} for the completed output.`,
      response.status,
    );
  }

  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > config.maxFileBytes) {
    throw new VideoWorkerError(
      "VIDEO_OUTPUT_TOO_LARGE",
      "The completed video exceeds the configured worker file-size limit.",
      413,
    );
  }
  const declaredType = response.headers.get("content-type")?.split(";")[0]?.trim();
  if (
    declaredType &&
    declaredType !== "application/octet-stream" &&
    declaredType !== output.mimeType
  ) {
    throw new VideoWorkerError(
      "VIDEO_OUTPUT_TYPE_MISMATCH",
      "The downloaded output content type does not match its approved video extension.",
      409,
    );
  }

  const tempDirectory = await mkdtemp(join(tmpdir(), "gem-video-worker-"));
  const tempPath = join(tempDirectory, sanitizePathSegment(output.fileName));
  const hash = createHash("sha256");
  let fileSize = 0;
  const meter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      fileSize += chunk.length;
      if (fileSize > config.maxFileBytes) {
        callback(
          new VideoWorkerError(
            "VIDEO_OUTPUT_TOO_LARGE",
            "The completed video exceeds the configured worker file-size limit.",
            413,
          ),
        );
        return;
      }
      hash.update(chunk);
      callback(null, chunk);
    },
  });

  try {
    const source = Readable.fromWeb(
      response.body as unknown as NodeReadableStream<Uint8Array>,
    );
    await pipeline(source, meter, createWriteStream(tempPath, { flags: "wx" }));
    if (fileSize <= 0) {
      throw new VideoWorkerError(
        "VIDEO_OUTPUT_EMPTY",
        "The completed video output is empty.",
        409,
      );
    }
    return {
      tempDirectory,
      tempPath,
      fileName: output.fileName,
      mimeType: output.mimeType,
      fileSize,
      checksumSha256: hash.digest("hex"),
    };
  } catch (error) {
    await rm(tempDirectory, { recursive: true, force: true });
    if (error instanceof VideoWorkerError) throw error;
    throw new VideoWorkerError(
      "VIDEO_OUTPUT_DOWNLOAD_FAILED",
      "The completed video could not be written to temporary storage.",
      502,
    );
  }
}

async function verifyExistingStorageObject(
  config: VideoWorkerConfig,
  storageRef: string,
  downloaded: DownloadedVideo,
) {
  const response = await timedFetch(
    storageRef,
    {
      method: "HEAD",
      headers: storageHeaders(config),
      cache: "no-store",
    },
    config.requestTimeoutMs,
  );
  const size = Number(response.headers.get("content-length"));
  const type = response.headers.get("content-type")?.split(";")[0]?.trim();
  if (!response.ok || size !== downloaded.fileSize || type !== downloaded.mimeType) {
    throw new VideoWorkerError(
      "VIDEO_STORAGE_OBJECT_CONFLICT",
      "The deterministic storage path already exists with different metadata.",
      409,
    );
  }
}

export async function uploadDownloadedVideo(
  config: VideoWorkerConfig,
  job: VideoWorkerJob,
  downloaded: DownloadedVideo,
) {
  const objectPath = buildStorageObjectPath({
    storagePrefix: config.storagePrefix,
    job,
    checksumSha256: downloaded.checksumSha256,
    fileName: downloaded.fileName,
  });
  const storageRef = buildStorageObjectUrl(config, objectPath);
  const init: RequestInit & { duplex: "half" } = {
    method: "POST",
    headers: {
      ...storageHeaders(config),
      "Content-Type": downloaded.mimeType,
      "x-upsert": "false",
    },
    body: createReadStream(downloaded.tempPath),
    duplex: "half",
  };
  const response = await timedFetch(
    storageRef,
    init,
    Math.max(config.requestTimeoutMs, 120_000),
  );
  if (response.status === 409) {
    await verifyExistingStorageObject(config, storageRef, downloaded);
    return { storageRef, objectPath, reused: true };
  }
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_STORAGE_UPLOAD_FAILED",
      `The storage upload returned HTTP ${response.status}.`,
      response.status,
    );
  }
  return { storageRef, objectPath, reused: false };
}

export async function verifyUploadedVideo(
  config: VideoWorkerConfig,
  job: VideoWorkerJob,
  downloaded: DownloadedVideo,
  storageRef: string,
) {
  const response = await timedFetch(
    `${config.gemBaseUrl}/api/video/uploads/verify`,
    {
      method: "POST",
      headers: {
        ...authHeaders(config),
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
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new VideoWorkerError(
      "VIDEO_UPLOAD_CALLBACK_FAILED",
      `The GEM upload-verification callback returned HTTP ${response.status}.`,
      response.status,
    );
  }
  return payload;
}

export async function processVideoWorkerJob(
  config: VideoWorkerConfig,
  job: VideoWorkerJob,
) {
  const providerJob = await getVideoJob(job.promptId);
  if (providerJob.status === "queued" || providerJob.status === "running") {
    return { outcome: "pending" as const, status: providerJob.status };
  }
  if (providerJob.status === "failed") {
    throw new VideoWorkerError(
      providerJob.error?.type || "VIDEO_RENDER_FAILED",
      providerJob.error?.message || "The ComfyUI render failed.",
      409,
    );
  }
  if (providerJob.status !== "completed") {
    return { outcome: "unknown" as const, status: providerJob.status };
  }

  const output = selectVideoOutput(providerJob.outputs);
  const downloaded = await downloadVideoOutput(config, output);
  try {
    const uploaded = await uploadDownloadedVideo(config, job, downloaded);
    await verifyUploadedVideo(config, job, downloaded, uploaded.storageRef);
    return {
      outcome: "verified" as const,
      fileName: downloaded.fileName,
      mimeType: downloaded.mimeType,
      fileSize: downloaded.fileSize,
      checksumSha256: downloaded.checksumSha256,
      storageRef: uploaded.storageRef,
      reusedStorageObject: uploaded.reused,
    };
  } finally {
    await rm(downloaded.tempDirectory, { recursive: true, force: true });
  }
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
