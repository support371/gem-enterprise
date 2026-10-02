import { timingSafeEqual } from "crypto";

export interface CommandRunnerConfig {
  enabled: boolean;
  workspaceId: string | null;
  hostId: string;
  workerTokenConfigured: boolean;
}

export function getCommandRunnerConfig(): CommandRunnerConfig {
  return {
    enabled: process.env.GEM_COMMAND_RUNNER_ENABLED === "true",
    workspaceId: process.env.GEM_COMMAND_RUNNER_WORKSPACE_ID?.trim() || null,
    hostId: process.env.GEM_COMMAND_RUNNER_HOST_ID?.trim() || "GEM-ASSIST",
    workerTokenConfigured: Boolean(process.env.GEM_COMMAND_RUNNER_WORKER_TOKEN?.trim()),
  };
}

function sameSecret(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function authenticateCommandRunnerWorker(request: Request): {
  ok: boolean;
  hostId: string;
  reason?: string;
} {
  const config = getCommandRunnerConfig();
  if (!config.enabled) return { ok: false, hostId: config.hostId, reason: "COMMAND_RUNNER_DISABLED" };
  if (!config.workspaceId) return { ok: false, hostId: config.hostId, reason: "COMMAND_RUNNER_WORKSPACE_MISSING" };

  const expectedToken = process.env.GEM_COMMAND_RUNNER_WORKER_TOKEN?.trim() || "";
  if (!expectedToken) return { ok: false, hostId: config.hostId, reason: "COMMAND_RUNNER_TOKEN_MISSING" };

  const authorization = request.headers.get("authorization") || "";
  const suppliedToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const suppliedHost = request.headers.get("x-gem-host-id")?.trim() || "";

  if (!suppliedToken || !sameSecret(suppliedToken, expectedToken)) {
    return { ok: false, hostId: config.hostId, reason: "COMMAND_RUNNER_UNAUTHORIZED" };
  }
  if (suppliedHost !== config.hostId) {
    return { ok: false, hostId: config.hostId, reason: "COMMAND_RUNNER_HOST_MISMATCH" };
  }

  return { ok: true, hostId: config.hostId };
}
