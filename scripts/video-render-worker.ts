#!/usr/bin/env node

import {
  checkVideoWorkerReadiness,
  computeBackoffMs,
  fetchWorkerJobs,
  loadVideoWorkerConfig,
  processVideoWorkerJob,
  redactedWorkerConfig,
  VideoWorkerError,
  type VideoWorkerConfig,
  type VideoWorkerJob,
} from "../src/lib/video/worker-runtime";

type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, event: string, fields: Record<string, unknown> = {}) {
  process.stdout.write(
    `${JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: "gem-video-render-worker",
      event,
      ...fields,
    })}\n`,
  );
}

function safeError(error: unknown) {
  if (error instanceof VideoWorkerError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
    };
  }
  return {
    code: "VIDEO_WORKER_UNEXPECTED_ERROR",
    message: "The worker encountered an unexpected error.",
  };
}

function parseMode(arguments_: string[]) {
  if (arguments_.includes("--check")) return "check" as const;
  if (arguments_.includes("--once")) return "once" as const;
  return "continuous" as const;
}

async function processJobWithRetry(
  config: VideoWorkerConfig,
  job: VideoWorkerJob,
  maximumAttempts = 3,
) {
  for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
    try {
      const result = await processVideoWorkerJob(config, job);
      log("info", "job.processed", {
        renderJobId: job.renderJobId,
        promptId: job.promptId,
        outcome: result.outcome,
        status: "status" in result ? result.status : undefined,
        fileName: "fileName" in result ? result.fileName : undefined,
        fileSize: "fileSize" in result ? result.fileSize : undefined,
        checksumSha256:
          "checksumSha256" in result ? result.checksumSha256 : undefined,
        reusedStorageObject:
          "reusedStorageObject" in result
            ? result.reusedStorageObject
            : undefined,
        externalPublicationTaken: false,
      });
      return result;
    } catch (error) {
      const safe = safeError(error);
      const retryable =
        safe.status === undefined ||
        safe.status === 408 ||
        safe.status === 429 ||
        safe.status >= 500;
      if (!retryable || attempt === maximumAttempts - 1) {
        log("error", "job.failed", {
          renderJobId: job.renderJobId,
          promptId: job.promptId,
          attempt: attempt + 1,
          ...safe,
          externalPublicationTaken: false,
        });
        return { outcome: "failed" as const, error: safe };
      }
      const delayMs = computeBackoffMs(attempt);
      log("warn", "job.retrying", {
        renderJobId: job.renderJobId,
        attempt: attempt + 1,
        nextAttemptInMs: delayMs,
        ...safe,
      });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return { outcome: "failed" as const };
}

async function runCycle(config: VideoWorkerConfig) {
  const jobs = await fetchWorkerJobs(config);
  log("info", "cycle.started", { jobCount: jobs.length });
  for (const job of jobs) {
    await processJobWithRetry(config, job);
  }
  log("info", "cycle.completed", { jobCount: jobs.length });
  return jobs.length;
}

async function main() {
  const mode = parseMode(process.argv.slice(2));
  const config = loadVideoWorkerConfig();
  log("info", "worker.starting", {
    mode,
    configuration: redactedWorkerConfig(config),
    externalPublicationTaken: false,
  });

  if (mode === "check") {
    const readiness = await checkVideoWorkerReadiness(config);
    log("info", "worker.ready", readiness);
    return;
  }

  if (mode === "once") {
    await runCycle(config);
    return;
  }

  let stopping = false;
  const stop = (signal: string) => {
    if (stopping) return;
    stopping = true;
    log("info", "worker.stopping", { signal });
  };
  process.on("SIGINT", () => stop("SIGINT"));
  process.on("SIGTERM", () => stop("SIGTERM"));

  while (!stopping) {
    try {
      await runCycle(config);
    } catch (error) {
      log("error", "cycle.failed", safeError(error));
    }
    if (!stopping) {
      await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
    }
  }
  log("info", "worker.stopped");
}

main().catch((error) => {
  log("error", "worker.fatal", safeError(error));
  process.exitCode = 1;
});
