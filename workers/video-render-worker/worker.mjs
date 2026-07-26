import http from "node:http";
import { openAsBlob } from "node:fs";
import {
  buildStorageObjectPath,
  collectOutputFiles,
  comfyJobState,
  encodeObjectPath,
  inspectOutputFile,
  redactUrl,
} from "./lib.mjs";

const configuration = loadConfiguration();
const processing = new Set();
let stopping = false;
let lastCycleAt = null;
let lastSuccessAt = null;
let lastError = null;

function env(name, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

function positiveInteger(name, fallback, minimum, maximum) {
  const parsed = Number.parseInt(env(name), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function loadConfiguration() {
  const values = {
    gemBaseUrl: env("GEM_BASE_URL").replace(/\/$/, ""),
    callbackSecret: env("VIDEO_RENDER_CALLBACK_SECRET"),
    comfyBaseUrl: env("COMFYUI_BASE_URL", "http://127.0.0.1:8188").replace(/\/$/, ""),
    comfyBearerToken: env("COMFYUI_BEARER_TOKEN"),
    comfyOutputDirectory: env("COMFYUI_OUTPUT_DIR"),
    supabaseUrl: env("SUPABASE_URL").replace(/\/$/, ""),
    supabaseServiceRoleKey: env("SUPABASE_SERVICE_ROLE_KEY"),
    assetBucket: env("VIDEO_ASSET_BUCKET", "gem-rendered-media"),
    pollIntervalMs: positiveInteger("VIDEO_WORKER_POLL_INTERVAL_MS", 15_000, 2_000, 300_000),
    batchSize: positiveInteger("VIDEO_WORKER_BATCH_SIZE", 10, 1, 50),
    concurrency: positiveInteger("VIDEO_WORKER_CONCURRENCY", 2, 1, 8),
    healthPort: positiveInteger("VIDEO_WORKER_HEALTH_PORT", 8787, 1, 65_535),
    requestTimeoutMs: positiveInteger("VIDEO_WORKER_REQUEST_TIMEOUT_MS", 30_000, 5_000, 300_000),
  };
  const missing = [
    ["GEM_BASE_URL", values.gemBaseUrl],
    ["VIDEO_RENDER_CALLBACK_SECRET", values.callbackSecret],
    ["COMFYUI_OUTPUT_DIR", values.comfyOutputDirectory],
    ["SUPABASE_URL", values.supabaseUrl],
    ["SUPABASE_SERVICE_ROLE_KEY", values.supabaseServiceRoleKey],
    ["VIDEO_ASSET_BUCKET", values.assetBucket],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(`Missing required worker configuration: ${missing.join(", ")}`);
  }
  return values;
}

function log(level, message, metadata = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  };
  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

async function requestJson(url, init = {}, timeoutMs = configuration.requestTimeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });
    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text.slice(0, 500) };
      }
    }
    if (!response.ok) {
      const error = new Error(
        payload?.error?.message || payload?.message || `HTTP_${response.status}`,
      );
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`REQUEST_TIMEOUT:${redactUrl(url)}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function workerHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${configuration.callbackSecret}`,
    ...extra,
  };
}

function comfyHeaders(extra = {}) {
  return {
    ...(configuration.comfyBearerToken
      ? { Authorization: `Bearer ${configuration.comfyBearerToken}` }
      : {}),
    ...extra,
  };
}

async function listJobs() {
  const payload = await requestJson(
    `${configuration.gemBaseUrl}/api/video/worker/jobs?limit=${configuration.batchSize}`,
    { headers: workerHeaders() },
  );
  return Array.isArray(payload?.jobs) ? payload.jobs : [];
}

async function fetchComfyState(promptId) {
  const [history, queue] = await Promise.all([
    requestJson(
      `${configuration.comfyBaseUrl}/history/${encodeURIComponent(promptId)}`,
      { headers: comfyHeaders() },
    ),
    requestJson(`${configuration.comfyBaseUrl}/queue`, {
      headers: comfyHeaders(),
    }),
  ]);
  return comfyJobState(history, promptId, queue);
}

async function reportState(job, state) {
  await requestJson(
    `${configuration.gemBaseUrl}/api/video/worker/jobs/${encodeURIComponent(job.renderJobId)}/status`,
    {
      method: "POST",
      headers: workerHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        promptId: job.promptId,
        state: state.state,
        outputManifest: state.outputManifest,
        errorCode: state.errorCode,
        errorMessage: state.errorMessage,
      }),
    },
  );
}

async function uploadToSupabase(job, inspected) {
  const objectPath = buildStorageObjectPath(job, inspected.fileName);
  const encodedPath = encodeObjectPath(objectPath);
  const blob = await openAsBlob(inspected.filePath, { type: inspected.mimeType });
  const uploadUrl = `${configuration.supabaseUrl}/storage/v1/object/${encodeURIComponent(configuration.assetBucket)}/${encodedPath}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), configuration.requestTimeoutMs * 4);
  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${configuration.supabaseServiceRoleKey}`,
        apikey: configuration.supabaseServiceRoleKey,
        "Content-Type": inspected.mimeType,
        "x-upsert": "true",
      },
      body: blob,
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`SUPABASE_UPLOAD_FAILED:${response.status}:${text.slice(0, 300)}`);
    }
  } finally {
    clearTimeout(timer);
  }

  return {
    storageRef: `${configuration.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(configuration.assetBucket)}/${encodedPath}`,
    objectPath,
  };
}

async function verifyUpload(job, inspected, uploaded) {
  return requestJson(`${configuration.gemBaseUrl}/api/video/uploads/verify`, {
    method: "POST",
    headers: workerHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      renderJobId: job.renderJobId,
      storageRef: uploaded.storageRef,
      fileName: inspected.fileName,
      mimeType: inspected.mimeType,
      fileSize: inspected.fileSize,
      checksumSha256: inspected.checksumSha256,
    }),
  });
}

async function processJob(job) {
  if (!job?.renderJobId || !job?.promptId || processing.has(job.renderJobId)) return;
  processing.add(job.renderJobId);
  try {
    const state = await fetchComfyState(job.promptId);
    await reportState(job, state);

    if (state.state === "FAILED") {
      log("error", "Render failed", {
        renderJobId: job.renderJobId,
        promptId: job.promptId,
        errorCode: state.errorCode,
      });
      return;
    }
    if (state.state !== "COMPLETED") return;

    const outputs = collectOutputFiles(state.outputManifest).sort((left, right) => {
      if (left.mimeType === "video/mp4" && right.mimeType !== "video/mp4") return -1;
      if (right.mimeType === "video/mp4" && left.mimeType !== "video/mp4") return 1;
      return left.fileName.localeCompare(right.fileName);
    });
    if (!outputs.length) {
      throw new Error("COMPLETED_RENDER_HAS_NO_VIDEO_OUTPUT");
    }

    const inspected = await inspectOutputFile(
      configuration.comfyOutputDirectory,
      outputs[0],
    );
    const uploaded = await uploadToSupabase(job, inspected);
    const verification = await verifyUpload(job, inspected, uploaded);
    lastSuccessAt = new Date().toISOString();
    lastError = null;
    log("info", "Render uploaded and verified", {
      renderJobId: job.renderJobId,
      promptId: job.promptId,
      fileName: inspected.fileName,
      fileSize: inspected.fileSize,
      checksumSha256: inspected.checksumSha256,
      objectPath: uploaded.objectPath,
      autoFinalized: Boolean(verification?.data?.autoFinalized),
    });
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    log("error", "Worker job processing failed", {
      renderJobId: job.renderJobId,
      promptId: job.promptId,
      error: lastError,
    });
  } finally {
    processing.delete(job.renderJobId);
  }
}

async function runBounded(jobs) {
  const queue = [...jobs];
  const runners = Array.from(
    { length: Math.min(configuration.concurrency, queue.length) },
    async () => {
      while (queue.length && !stopping) {
        const job = queue.shift();
        if (job) await processJob(job);
      }
    },
  );
  await Promise.all(runners);
}

async function cycle() {
  lastCycleAt = new Date().toISOString();
  try {
    const jobs = await listJobs();
    if (jobs.length) {
      log("info", "Worker cycle received jobs", { count: jobs.length });
      await runBounded(jobs);
    }
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    log("error", "Worker cycle failed", { error: lastError });
  }
}

function startHealthServer() {
  const server = http.createServer((request, response) => {
    if (request.url !== "/health") {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: false, error: "NOT_FOUND" }));
      return;
    }
    response.writeHead(lastError ? 503 : 200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    response.end(
      JSON.stringify({
        ok: !lastError,
        service: "gem-video-render-worker",
        lastCycleAt,
        lastSuccessAt,
        processing: processing.size,
        lastError,
      }),
    );
  });
  server.listen(configuration.healthPort, "0.0.0.0", () => {
    log("info", "Worker health server started", {
      port: configuration.healthPort,
    });
  });
  return server;
}

async function main() {
  log("info", "GEM video render worker started", {
    gemBaseUrl: redactUrl(configuration.gemBaseUrl),
    comfyBaseUrl: redactUrl(configuration.comfyBaseUrl),
    outputDirectory: configuration.comfyOutputDirectory,
    assetBucket: configuration.assetBucket,
    pollIntervalMs: configuration.pollIntervalMs,
    concurrency: configuration.concurrency,
  });
  const healthServer = startHealthServer();
  const stop = () => {
    stopping = true;
    healthServer.close();
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  while (!stopping) {
    await cycle();
    if (!stopping) {
      await new Promise((resolve) => setTimeout(resolve, configuration.pollIntervalMs));
    }
  }
  log("info", "GEM video render worker stopped");
}

main().catch((error) => {
  log("fatal", "Worker terminated", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
