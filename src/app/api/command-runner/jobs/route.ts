import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePlatformOwner } from "@/lib/api/auth-helpers";
import { commandRunnerCommands, getCommandRunnerCommand } from "@/lib/command-runner/catalog";
import { getCommandRunnerConfig } from "@/lib/command-runner/config";
import { listCommandRunnerJobs, queueCommandRunnerJob } from "@/lib/command-runner/store";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  commandId: z.string().min(1).max(64),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  const gate = await requirePlatformOwner();
  if (!gate.ok) return gate.response;

  const config = getCommandRunnerConfig();
  const jobs = config.workspaceId
    ? await listCommandRunnerJobs(config.workspaceId)
    : [];

  return json({
    enabled: config.enabled,
    configured: Boolean(config.workspaceId && config.workerTokenConfigured),
    hostId: config.hostId,
    commands: commandRunnerCommands,
    jobs,
  });
}

export async function POST(request: NextRequest) {
  const gate = await requirePlatformOwner();
  if (!gate.ok) return gate.response;

  const config = getCommandRunnerConfig();
  if (!config.enabled) return json({ error: "Command runner is disabled." }, 503);
  if (!config.workspaceId || !config.workerTokenConfigured) {
    return json({ error: "Command runner configuration is incomplete." }, 503);
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return json({ error: "Invalid command request.", details: parsed.error.flatten() }, 400);
  }

  const command = getCommandRunnerCommand(parsed.data.commandId);
  if (!command) return json({ error: "Command is not allowlisted." }, 400);

  const job = await queueCommandRunnerJob({
    workspaceId: config.workspaceId,
    actorId: gate.session.userId,
    hostId: config.hostId,
    commandId: command.id,
  });

  return json({ job }, 202);
}
