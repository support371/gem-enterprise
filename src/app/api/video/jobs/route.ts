import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { emitAuditLog } from "@/lib/audit";
import {
  badRequest,
  getRequestContext,
  requireAdmin,
} from "@/lib/api/auth-helpers";
import { queueVideoJob, videoJobInputSchema } from "@/lib/video/comfyui";

function providerErrorStatus(message: string) {
  if (message === "COMFYUI_NOT_CONFIGURED") return 503;
  if (message === "COMFYUI_QUEUE_FULL") return 429;
  if (message === "COMFYUI_TIMEOUT") return 504;
  if (message.startsWith("WORKFLOW_NODE_NOT_FOUND:")) return 400;
  return 502;
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { ipAddress, userAgent } = getRequestContext(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  try {
    const input = videoJobInputSchema.parse(body);
    const job = await queueVideoJob(input);
    await emitAuditLog({
      userId: gate.session.userId,
      action: "admin_action",
      resource: "video_render_job",
      resourceId: job.promptId,
      metadata: {
        kind: "video_render_queued",
        provider: "comfyui-local",
        clientId: job.clientId,
        queueDepthBeforeSubmission: job.queueDepthBeforeSubmission,
        queueLimit: job.queueLimit,
      },
      ipAddress,
      userAgent,
    });
    return NextResponse.json(
      { ok: true, job },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request", issues: error.issues },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      {
        status: providerErrorStatus(message),
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

export async function DELETE() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  return NextResponse.json(
    { error: "Use the individual job cancellation endpoint." },
    { status: 405, headers: { "Cache-Control": "no-store" } },
  );
}
