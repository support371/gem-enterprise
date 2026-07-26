import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, serviceUnavailable, serverError } from "@/lib/api/auth-helpers";
import {
  getManusCampaignTask,
  ManusApiError,
  ManusConfigurationError,
} from "@/lib/manus/client";

const TASK_ID_PATTERN = /^[A-Za-z0-9_-]{6,200}$/;

type RouteContext = { params: Promise<{ taskId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { taskId } = await context.params;
  if (!TASK_ID_PATTERN.test(taskId)) {
    return NextResponse.json(
      { error: "Invalid Manus task identifier." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const reservation = await db.auditLog.findFirst({
      where: {
        userId: gate.session.userId,
        resource: "manus_campaign_task_reservation",
        resourceId: taskId,
      },
      select: { id: true },
    });
    if (!reservation) {
      return NextResponse.json(
        { error: "Manus task not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    const task = await getManusCampaignTask(taskId);
    return NextResponse.json(
      {
        taskId,
        ...task,
        externalActionTaken: false,
        publicationAllowed: false,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof ManusConfigurationError) {
      return serviceUnavailable(error.message);
    }
    if (error instanceof ManusApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      return serviceUnavailable("Manus did not respond before the request timeout.");
    }
    console.error("[GET /api/admin/manus/tasks/:taskId]", error);
    return serverError("The Manus task could not be read.");
  }
}
