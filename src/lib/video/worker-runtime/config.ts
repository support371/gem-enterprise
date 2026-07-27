import { resolve } from "node:path";
import {
  VideoWorkerError,
  type VideoWorkerConfig,
  type VideoWorkerEnvironment,
} from "./types";
import { sanitizePathSegment } from "./outputs";

const GIBIBYTE = 1024 * 1024 * 1024;
const DEFAULT_MAX_FILE_BYTES = GIBIBYTE;
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_TRANSFER_TIMEOUT_MS = 15 * 60_000;
const DEFAULT_POLL_INTERVAL_MS = 15_000;
const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_DISPATCH_LEASE_MS = 120_000;

function required(env: VideoWorkerEnvironment, names: string[]) {
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
  env: VideoWorkerEnvironment,
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

function normalizedUrl(
  value: string,
  name: string,
  options: { allowLoopbackHttp?: boolean } = {},
) {
  try {
    const url = new URL(value);
    const loopback = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    const permitted =
      url.protocol === "https:" ||
      (url.protocol === "http:" && options.allowLoopbackHttp === true && loopback);
    if (!permitted) throw new Error("insecure or unsupported protocol");
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new VideoWorkerError(
      "WORKER_CONFIGURATION_INVALID",
      `${name} must use HTTPS, except that ComfyUI may use HTTP on localhost.`,
    );
  }
}

export function loadVideoWorkerConfig(
  env: VideoWorkerEnvironment = process.env,
): VideoWorkerConfig {
  const gemBaseUrl = normalizedUrl(
    required(env, ["GEM_VIDEO_WORKER_API_URL", "GEM_BASE_URL"]),
    "GEM_VIDEO_WORKER_API_URL",
  );
  const comfyBaseUrl = normalizedUrl(
    required(env, ["COMFYUI_BASE_URL"]),
    "COMFYUI_BASE_URL",
    { allowLoopbackHttp: true },
  );
  const storageBaseUrl = normalizedUrl(
    required(env, ["VIDEO_RENDER_STORAGE_URL", "SUPABASE_URL"]),
    "VIDEO_RENDER_STORAGE_URL",
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
    storageBucket: sanitizePathSegment(
      required(env, ["VIDEO_RENDER_STORAGE_BUCKET"]),
    ),
    storagePrefix: sanitizePathSegment(
      env.VIDEO_RENDER_STORAGE_PREFIX?.trim() || "renders",
    ),
    stateDirectory: resolve(
      env.VIDEO_RENDER_WORKER_STATE_DIR?.trim() || ".video-render-worker-state",
    ),
    batchSize: optionalInteger(
      env,
      "VIDEO_RENDER_WORKER_BATCH_SIZE",
      DEFAULT_BATCH_SIZE,
      1,
      20,
    ),
    dispatchLeaseMs: optionalInteger(
      env,
      "VIDEO_RENDER_WORKER_DISPATCH_LEASE_MS",
      DEFAULT_DISPATCH_LEASE_MS,
      30_000,
      15 * 60_000,
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
    transferTimeoutMs: optionalInteger(
      env,
      "VIDEO_RENDER_WORKER_TRANSFER_TIMEOUT_MS",
      DEFAULT_TRANSFER_TIMEOUT_MS,
      60_000,
      60 * 60_000,
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
    stateDirectory: config.stateDirectory,
    storageKeyConfigured: Boolean(config.storageKey),
    callbackSecretConfigured: Boolean(config.callbackSecret),
    batchSize: config.batchSize,
    dispatchLeaseMs: config.dispatchLeaseMs,
    pollIntervalMs: config.pollIntervalMs,
    maxFileBytes: config.maxFileBytes,
    requestTimeoutMs: config.requestTimeoutMs,
    transferTimeoutMs: config.transferTimeoutMs,
  };
}
