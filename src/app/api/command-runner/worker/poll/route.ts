import { NextRequest, NextResponse } from "next/server";
import { authenticateCommandRunnerWorker, getCommandRunnerConfig } from "@/lib/command-runner/config";
import { claimNextCommandRunnerJob } from "@/lib/command-runner/store";

export const dynamic = "force-dynamic";

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

  const job = await claimNextCommandRunnerJob({
    workspaceId: config.workspaceId,
    hostId: auth.hostId,
  });

  return NextResponse.json(
    { job },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
