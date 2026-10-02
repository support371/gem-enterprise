import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCommandRunnerCommand } from "@/lib/command-runner/catalog";

const AGGREGATE_TYPE = "command_runner_job";
const REQUESTED = "COMMAND_RUNNER_REQUESTED";
const CLAIMED = "COMMAND_RUNNER_CLAIMED";
const COMPLETED = "COMMAND_RUNNER_COMPLETED";
const FAILED = "COMMAND_RUNNER_FAILED";
const TIMED_OUT = "COMMAND_RUNNER_TIMED_OUT";

const terminalEvents = [COMPLETED, FAILED, TIMED_OUT] as const;
const blockingEvents = [CLAIMED, ...terminalEvents] as const;

export type CommandRunnerJobStatus = "queued" | "running" | "completed" | "failed" | "timed_out";

export interface CommandRunnerJobView {
  id: string;
  commandId: string;
  commandLabel: string;
  hostId: string;
  status: CommandRunnerJobStatus;
  requestedAt: string | null;
  updatedAt: string;
  durationMs?: number;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function json(value: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function cleanOutput(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(
      /((?:authorization|token|secret|password|api[_-]?key)\s*[=:]\s*)([^\s]+)/gi,
      "$1[REDACTED]",
    )
    .slice(0, 16_000);
}

function statusFor(eventType: string): CommandRunnerJobStatus {
  if (eventType === COMPLETED) return "completed";
  if (eventType === FAILED) return "failed";
  if (eventType === TIMED_OUT) return "timed_out";
  if (eventType === CLAIMED) return "running";
  return "queued";
}

export async function queueCommandRunnerJob(input: {
  workspaceId: string;
  actorId: string;
  hostId: string;
  commandId: string;
}) {
  const command = getCommandRunnerCommand(input.commandId);
  if (!command) throw new Error("COMMAND_NOT_ALLOWED");

  const jobId = crypto.randomUUID();
  const correlationId = jobId;
  const safeMetadata = json({
    commandId: command.id,
    hostId: input.hostId,
    actorId: input.actorId,
  });

  await db.$transaction([
    db.domainEvent.create({
      data: {
        workspaceId: input.workspaceId,
        aggregateType: AGGREGATE_TYPE,
        aggregateId: jobId,
        eventType: REQUESTED,
        correlationId,
        safeMetadata,
      },
    }),
    db.auditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        action: REQUESTED,
        entityType: AGGREGATE_TYPE,
        entityId: jobId,
        correlationId,
        outcome: "QUEUED",
        sourceChannel: "command_center",
        safeMetadata,
      },
    }),
  ]);

  return { id: jobId, commandId: command.id, status: "queued" as const };
}

export async function listCommandRunnerJobs(workspaceId: string, take = 20): Promise<CommandRunnerJobView[]> {
  const events = await db.domainEvent.findMany({
    where: { workspaceId, aggregateType: AGGREGATE_TYPE },
    orderBy: { createdAt: "desc" },
    take: Math.max(100, take * 8),
  });

  const jobs = new Map<string, CommandRunnerJobView>();

  for (const event of events) {
    const metadata = object(event.safeMetadata);
    const commandId = typeof metadata.commandId === "string" ? metadata.commandId : "unknown";
    const hostId = typeof metadata.hostId === "string" ? metadata.hostId : "unknown";
    const existing = jobs.get(event.aggregateId);

    if (!existing) {
      const command = getCommandRunnerCommand(commandId);
      jobs.set(event.aggregateId, {
        id: event.aggregateId,
        commandId,
        commandLabel: command?.label ?? commandId,
        hostId,
        status: statusFor(event.eventType),
        requestedAt: event.eventType === REQUESTED ? event.createdAt.toISOString() : null,
        updatedAt: event.createdAt.toISOString(),
        durationMs: typeof metadata.durationMs === "number" ? metadata.durationMs : undefined,
        exitCode: typeof metadata.exitCode === "number" ? metadata.exitCode : metadata.exitCode === null ? null : undefined,
        stdout: cleanOutput(metadata.stdout),
        stderr: cleanOutput(metadata.stderr),
      });
      continue;
    }

    if (!existing.requestedAt && event.eventType === REQUESTED) {
      existing.requestedAt = event.createdAt.toISOString();
    }
    if (existing.commandId === "unknown" && commandId !== "unknown") {
      existing.commandId = commandId;
      existing.commandLabel = getCommandRunnerCommand(commandId)?.label ?? commandId;
    }
    if (existing.hostId === "unknown" && hostId !== "unknown") existing.hostId = hostId;
  }

  return [...jobs.values()]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, take);
}

export async function claimNextCommandRunnerJob(input: {
  workspaceId: string;
  hostId: string;
}) {
  const requested = await db.domainEvent.findMany({
    where: {
      workspaceId: input.workspaceId,
      aggregateType: AGGREGATE_TYPE,
      eventType: REQUESTED,
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  if (!requested.length) return null;

  const ids = requested.map((event) => event.aggregateId);
  const progressed = await db.domainEvent.findMany({
    where: {
      workspaceId: input.workspaceId,
      aggregateType: AGGREGATE_TYPE,
      aggregateId: { in: ids },
      eventType: { in: [...blockingEvents] },
    },
    select: { aggregateId: true },
  });
  const blocked = new Set(progressed.map((event) => event.aggregateId));

  for (const request of requested) {
    if (blocked.has(request.aggregateId)) continue;

    const metadata = object(request.safeMetadata);
    const commandId = typeof metadata.commandId === "string" ? metadata.commandId : "";
    const requestedHost = typeof metadata.hostId === "string" ? metadata.hostId : "";
    const command = getCommandRunnerCommand(commandId);
    if (!command || requestedHost !== input.hostId) continue;

    await db.domainEvent.create({
      data: {
        workspaceId: input.workspaceId,
        aggregateType: AGGREGATE_TYPE,
        aggregateId: request.aggregateId,
        eventType: CLAIMED,
        correlationId: request.correlationId,
        safeMetadata: json({ commandId, hostId: input.hostId }),
      },
    });

    return {
      id: request.aggregateId,
      commandId,
      timeoutMs: command.timeoutMs,
    };
  }

  return null;
}

export async function completeCommandRunnerJob(input: {
  workspaceId: string;
  hostId: string;
  jobId: string;
  status: "completed" | "failed" | "timed_out";
  exitCode: number | null;
  durationMs: number;
  stdout?: string;
  stderr?: string;
}) {
  const claim = await db.domainEvent.findFirst({
    where: {
      workspaceId: input.workspaceId,
      aggregateType: AGGREGATE_TYPE,
      aggregateId: input.jobId,
      eventType: CLAIMED,
    },
    orderBy: { createdAt: "desc" },
  });
  if (!claim) throw new Error("COMMAND_JOB_NOT_CLAIMED");

  const claimMetadata = object(claim.safeMetadata);
  if (claimMetadata.hostId !== input.hostId) throw new Error("COMMAND_HOST_MISMATCH");

  const existingTerminal = await db.domainEvent.findFirst({
    where: {
      workspaceId: input.workspaceId,
      aggregateType: AGGREGATE_TYPE,
      aggregateId: input.jobId,
      eventType: { in: [...terminalEvents] },
    },
  });
  if (existingTerminal) return;

  const commandId = typeof claimMetadata.commandId === "string" ? claimMetadata.commandId : "unknown";
  const eventType =
    input.status === "completed" ? COMPLETED : input.status === "timed_out" ? TIMED_OUT : FAILED;
  const safeMetadata = json({
    commandId,
    hostId: input.hostId,
    exitCode: input.exitCode,
    durationMs: input.durationMs,
    stdout: cleanOutput(input.stdout),
    stderr: cleanOutput(input.stderr),
  });

  await db.$transaction([
    db.domainEvent.create({
      data: {
        workspaceId: input.workspaceId,
        aggregateType: AGGREGATE_TYPE,
        aggregateId: input.jobId,
        eventType,
        correlationId: claim.correlationId,
        safeMetadata,
      },
    }),
    db.auditEvent.create({
      data: {
        workspaceId: input.workspaceId,
        action: eventType,
        entityType: AGGREGATE_TYPE,
        entityId: input.jobId,
        correlationId: claim.correlationId,
        outcome: input.status.toUpperCase(),
        sourceChannel: "gem_assist_worker",
        safeMetadata: json({
          commandId,
          hostId: input.hostId,
          exitCode: input.exitCode,
          durationMs: input.durationMs,
        }),
      },
    }),
  ]);
}
