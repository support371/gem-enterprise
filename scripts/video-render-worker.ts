#!/usr/bin/env node

import { createServer } from "node:http";
import {
  loadVideoWorkerConfig,
  runVideoWorkerIteration,
  videoWorkerDoctor,
  type WorkerIterationResult,
} from "../src/lib/video/worker-agent";

const args = new Set(process.argv.slice(2));
const once = args.has("--once");
const doctor = args.has("--doctor");
const healthPort = Number.parseInt(
  process.env.VIDEO_RENDER_WORKER_HEALTH_PORT ?? "0",
  10,
);
const healthHost =
  process.env.VIDEO_RENDER_WORKER_HEALTH_HOST?.trim() || "127.0.0.1";

let stopping = false;
let lastStartedAt: string | null = null;
let lastCompletedAt: string | null = null;
let lastError: string | null = null;
let lastResult: WorkerIterationResult | null = null;

function log(
  level: "info" | "error",
  event: string,
  details: Record<string, unknown> = {},
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details,
  };
  const serialized = JSON.stringify(entry);
  if (level === "error") console.error(serialized);
  else console.log(serialized);
}

function errorMessage(error: unknown) {
  return (error instanceof Error ? error.message : String(error)).slice(0, 1_000);
}

async function sleep(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function startHealthServer(workerId: string) {
  if (!Number.isFinite(healthPort) || healthPort <= 0 || healthPort > 65_535) {
    return null;
  }
  const server = createServer((request, response) => {
    if (request.url !== "/health" && request.url !== "/ready") {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: false, error: "Not found" }));
      return;
    }
    const ready = !lastError || Boolean(lastCompletedAt);
    const status = request.url === "/ready" && !ready ? 503 : 200;
    response.writeHead(status, {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    });
    response.end(
      JSON.stringify({
        ok: status === 200,
        workerId,
        stopping,
        lastStartedAt,
        lastCompletedAt,
        lastError,
        lastResult,
      }),
    );
  });
  server.listen(healthPort, healthHost, () => {
    log("info", "video_worker.health_started", {
      host: healthHost,
      port: healthPort,
    });
  });
  return server;
}

async function main() {
  const config = loadVideoWorkerConfig();

  if (doctor) {
    const result = await videoWorkerDoctor(config);
    log("info", "video_worker.doctor_passed", result);
    return;
  }

  const healthServer = startHealthServer(config.workerId);
  const stop = (signal: string) => {
    if (stopping) return;
    stopping = true;
    log("info", "video_worker.shutdown_requested", { signal });
  };
  process.on("SIGINT", () => stop("SIGINT"));
  process.on("SIGTERM", () => stop("SIGTERM"));

  log("info", "video_worker.started", {
    workerId: config.workerId,
    pollIntervalMs: config.pollIntervalMs,
    outputDirectory: config.comfyUiOutputDir,
    storageOrigin: new URL(config.supabaseUrl).origin,
    gemApiOrigin: new URL(config.gemApiBaseUrl).origin,
    once,
  });

  do {
    lastStartedAt = new Date().toISOString();
    try {
      lastResult = await runVideoWorkerIteration(config);
      lastCompletedAt = new Date().toISOString();
      lastError = null;
      log("info", "video_worker.iteration_completed", lastResult);
    } catch (error) {
      lastCompletedAt = new Date().toISOString();
      lastError = errorMessage(error);
      log("error", "video_worker.iteration_failed", {
        error: lastError,
      });
      if (once) process.exitCode = 1;
    }

    if (!once && !stopping) await sleep(config.pollIntervalMs);
  } while (!once && !stopping);

  if (healthServer) {
    await new Promise<void>((resolve) => healthServer.close(() => resolve()));
  }
  log("info", "video_worker.stopped", { workerId: config.workerId });
}

main().catch((error) => {
  log("error", "video_worker.fatal", { error: errorMessage(error) });
  process.exitCode = 1;
});
