import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateCommandRunnerWorker, getCommandRunnerConfig } from "@/lib/command-runner/config";
import { completeCommandRunnerJob } from "@/lib/command-runner/store";

export const dynamic = "force-dynamic";

const resultSchema = z.object({
  jobId: z.string().min(1).max(128),
  status: z.enum(["completed", "failed", "timed_out"]),
  exitCode: z.number().int().nullable(),
  durationMs: z.number().int().min(0).max(3_600_000),
  stdout: z.string().max(64_000).optional(),
  stderr: z.string().max(64_000).optional(),
});

export async function POST(request: NextRequest) {
  const auth = authenticateCommandRunnerWorker(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.reason ?? "Unauthorized" },
      { status: auth.reason === "COMMAND_RUNNER_UNAUTHORIZED" ? 401 : 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const config = getCommandRunnerConfig();
  if (!config.workspaceId) {
    return NextResponse.json(
      { error: "Command runner workspace is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsed = resultSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid command result.", details: parsed.error.flatten() },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = parsed.data as {
    jobId: string;
    status: "completed" | "failed" | "timed_out";
    exitCode: number | null;
    durationMs: number;
    stdout?: string;
    stderr?: string;
  };

  try {
    await completeCommandRunnerJob({
      workspaceId: config.workspaceId,
      hostId: auth.hostId,
      ...result,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "COMMAND_RESULT_REJECTED";
    return NextResponse.json(
      { error: code },
      { status: code === "COMMAND_JOB_NOT_CLAIMED" ? 409 : 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
