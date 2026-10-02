import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";

const COMMANDS = Object.freeze({
  "repo-status": { command: "git status --short --branch", timeoutMs: 30_000 },
  lint: { command: "pnpm run lint", timeoutMs: 180_000 },
  typecheck: { command: "pnpm run typecheck", timeoutMs: 180_000 },
  test: { command: "pnpm run test", timeoutMs: 600_000 },
  "verify-preview": { command: "pnpm run verify:preview", timeoutMs: 900_000 },
  build: { command: "pnpm run build", timeoutMs: 900_000 },
});

const platformUrl = (process.env.GEM_PLATFORM_URL || "").replace(/\/$/, "");
const workerToken = process.env.GEM_COMMAND_RUNNER_WORKER_TOKEN || "";
const hostId = process.env.GEM_COMMAND_RUNNER_HOST_ID || "GEM-ASSIST";
const repoDir = process.env.GEM_COMMAND_RUNNER_REPO_DIR || "";
const pollMs = Math.min(60_000, Math.max(2_000, Number(process.env.GEM_COMMAND_RUNNER_POLL_MS || 5_000)));
const once = process.argv.includes("--once");

if (!platformUrl) throw new Error("GEM_PLATFORM_URL is required");
if (!workerToken) throw new Error("GEM_COMMAND_RUNNER_WORKER_TOKEN is required");
if (!repoDir || !existsSync(repoDir)) throw new Error("GEM_COMMAND_RUNNER_REPO_DIR must point to the local repository");

const headers = {
  Authorization: `Bearer ${workerToken}`,
  "Content-Type": "application/json",
  "x-gem-host-id": hostId,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function bounded(current, chunk) {
  const next = current + chunk.toString();
  return next.length > 64_000 ? next.slice(-64_000) : next;
}

async function execute(commandId) {
  const definition = COMMANDS[commandId];
  if (!definition) {
    return {
      status: "failed",
      exitCode: null,
      durationMs: 0,
      stdout: "",
      stderr: "Worker rejected a non-allowlisted command id.",
    };
  }

  const startedAt = Date.now();
  let stdout = "";
  let stderr = "";
  let timedOut = false;

  const child = spawn(definition.command, {
    cwd: repoDir,
    env: process.env,
    shell: true,
    windowsHide: true,
  });

  child.stdout?.on("data", (chunk) => {
    stdout = bounded(stdout, chunk);
  });
  child.stderr?.on("data", (chunk) => {
    stderr = bounded(stderr, chunk);
  });

  const timeout = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, definition.timeoutMs);

  const exitCode = await new Promise((resolve) => {
    child.on("error", (error) => {
      stderr = bounded(stderr, error.stack || error.message);
      resolve(null);
    });
    child.on("close", (code) => resolve(code));
  });

  clearTimeout(timeout);

  return {
    status: timedOut ? "timed_out" : exitCode === 0 ? "completed" : "failed",
    exitCode,
    durationMs: Date.now() - startedAt,
    stdout,
    stderr,
  };
}

async function poll() {
  const response = await fetch(`${platformUrl}/api/command-runner/worker/poll`, {
    method: "POST",
    headers,
    body: "{}",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Poll failed (${response.status}): ${text.slice(0, 500)}`);
  }

  const payload = await response.json();
  return payload.job || null;
}

async function report(jobId, result) {
  const response = await fetch(`${platformUrl}/api/command-runner/worker/result`, {
    method: "POST",
    headers,
    body: JSON.stringify({ jobId, ...result }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Result upload failed (${response.status}): ${text.slice(0, 500)}`);
  }
}

console.log(`[gem-command-runner] host=${hostId} repo=${repoDir}`);

do {
  try {
    const job = await poll();
    if (job) {
      console.log(`[gem-command-runner] executing ${job.commandId} (${job.id})`);
      const result = await execute(job.commandId);
      await report(job.id, result);
      console.log(`[gem-command-runner] ${job.id} -> ${result.status}`);
    }
  } catch (error) {
    console.error("[gem-command-runner]", error instanceof Error ? error.message : error);
  }

  if (!once) await sleep(pollMs);
} while (!once);
