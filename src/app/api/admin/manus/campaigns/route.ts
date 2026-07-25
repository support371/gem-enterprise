import { NextRequest, NextResponse } from "next/server";
import { emitAuditLog } from "@/lib/audit";
import {
  badRequest,
  getRequestContext,
  requireAdmin,
  serviceUnavailable,
  serverError,
} from "@/lib/api/auth-helpers";
import { ManusCampaignBriefSchema } from "@/lib/manus/campaign";
import {
  createManusCampaignTask,
  ManusApiError,
  ManusConfigurationError,
} from "@/lib/manus/client";

function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !!origin && origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  if (!requireSameOrigin(request)) {
    return NextResponse.json(
      { error: "Campaign generation requires a same-origin administrator request." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = ManusCampaignBriefSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  const { ipAddress, userAgent } = getRequestContext(request);

  try {
    const task = await createManusCampaignTask(parsed.data);
    await emitAuditLog({
      userId: gate.session.userId,
      action: "admin_action",
      resource: "manus_campaign_task",
      resourceId: task.taskId,
      metadata: {
        kind: "manus_campaign_task_created",
        service: parsed.data.service,
        channels: parsed.data.channels,
        shareVisibility: "private",
        externalActionTaken: false,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        task,
        status: "running",
        externalActionTaken: false,
        publicationAllowed: false,
      },
      { status: 202, headers: { "Cache-Control": "no-store" } },
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
    console.error("[POST /api/admin/manus/campaigns]", error);
    return serverError("Campaign generation could not be started.");
  }
}
