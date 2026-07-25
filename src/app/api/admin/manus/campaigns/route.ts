import { NextRequest, NextResponse } from "next/server";
import { emitAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
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

const FREE_TIER_DAILY_TASK_LIMIT = 1;
const FREE_TIER_MONTHLY_TASK_LIMIT = 5;

function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !!origin && origin === request.nextUrl.origin;
}

function utcPeriodBoundaries(now = new Date()) {
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const nextDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { dayStart, nextDay, monthStart, nextMonth };
}

async function enforceFreeTierQuota(userId: string) {
  const { dayStart, nextDay, monthStart, nextMonth } = utcPeriodBoundaries();
  const [dailyTasks, monthlyTasks] = await Promise.all([
    db.auditLog.count({
      where: {
        userId,
        resource: "manus_campaign_task",
        createdAt: { gte: dayStart, lt: nextDay },
      },
    }),
    db.auditLog.count({
      where: {
        userId,
        resource: "manus_campaign_task",
        createdAt: { gte: monthStart, lt: nextMonth },
      },
    }),
  ]);

  if (monthlyTasks >= FREE_TIER_MONTHLY_TASK_LIMIT) {
    return NextResponse.json(
      {
        error: "The conservative Manus free-tier monthly limit has been reached. Wait for the next UTC month or use GEM's local campaign drafting tools.",
        code: "MANUS_FREE_MONTHLY_LIMIT_REACHED",
        limits: {
          dailyTasks: FREE_TIER_DAILY_TASK_LIMIT,
          monthlyTasks: FREE_TIER_MONTHLY_TASK_LIMIT,
          resetTimezone: "UTC",
        },
      },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (dailyTasks >= FREE_TIER_DAILY_TASK_LIMIT) {
    return NextResponse.json(
      {
        error: "Today's conservative Manus free-tier task has already been used. Wait until 00:00 UTC before starting another Manus campaign task.",
        code: "MANUS_FREE_DAILY_LIMIT_REACHED",
        limits: {
          dailyTasks: FREE_TIER_DAILY_TASK_LIMIT,
          monthlyTasks: FREE_TIER_MONTHLY_TASK_LIMIT,
          resetTimezone: "UTC",
        },
      },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  return null;
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
    const quotaResponse = await enforceFreeTierQuota(gate.session.userId);
    if (quotaResponse) return quotaResponse;

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
        agentProfile: task.agentProfile,
        freeTierPolicy: {
          dailyTaskLimit: FREE_TIER_DAILY_TASK_LIMIT,
          monthlyTaskLimit: FREE_TIER_MONTHLY_TASK_LIMIT,
          resetTimezone: "UTC",
        },
        externalActionTaken: false,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        task,
        status: "running",
        limits: {
          dailyTasks: FREE_TIER_DAILY_TASK_LIMIT,
          monthlyTasks: FREE_TIER_MONTHLY_TASK_LIMIT,
          resetTimezone: "UTC",
        },
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
