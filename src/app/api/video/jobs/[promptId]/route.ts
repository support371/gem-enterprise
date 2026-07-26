import { NextRequest, NextResponse } from "next/server";
import { emitAuditLog } from "@/lib/audit";
import {
  getRequestContext,
  requireAdmin,
} from "@/lib/api/auth-helpers";
import { cancelVideoJob, getVideoJob } from "@/lib/video/comfyui";

type RouteContext = { params: Promise<{ promptId: string }> };

function safePromptId(value: string) {
  return value.trim().slice(0, 200);
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const { promptId: rawPromptId } = await context.params;
    const promptId = safePromptId(rawPromptId);
    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    const job = await getVideoJob(promptId);
    return NextResponse.json(
      { ok: true, job },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "COMFYUI_TIMEOUT" ? 504 : 502;
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    const { promptId: rawPromptId } = await context.params;
    const promptId = safePromptId(rawPromptId);
    if (!promptId) {
      return NextResponse.json(
        { error: "Prompt ID is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    const result = await cancelVideoJob(promptId);
    await emitAuditLog({
      userId: gate.session.userId,
      action: "admin_action",
      resource: "video_render_job",
      resourceId: promptId,
      metadata: {
        kind: "video_render_cancellation_requested",
        provider: "comfyui-local",
        cancelled: result.cancelled,
        status: result.status,
        reason: "reason" in result ? result.reason : null,
      },
      ipAddress,
      userAgent,
    });
    return NextResponse.json(
      { ok: true, ...result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "COMFYUI_TIMEOUT" ? 504 : 502;
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
