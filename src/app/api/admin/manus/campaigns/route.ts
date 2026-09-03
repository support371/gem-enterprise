import { NextRequest, NextResponse } from "next/server";
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
  assertManusTaskCreationApproved,
  createManusCampaignTask,
  ManusApiError,
  ManusConfigurationError,
} from "@/lib/manus/client";

const FREE_TIER_DAILY_TASK_LIMIT = 1;
const FREE_TIER_MONTHLY_TASK_LIMIT = 5;
const TASK_RESERVATION_RESOURCE = "manus_campaign_task_reservation";

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

async function reserveTaskQuota(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const { dayStart, nextDay, monthStart, nextMonth } = utcPeriodBoundaries();

  return db.$transaction(async (tx) => {
    const lockKey = `manus_campaign_task:${userId}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

    const [dailyTasks, monthlyTasks] = await Promise.all([
      tx.auditLog.count({
        where: {
          userId,
          resource: TASK_RESERVATION_RESOURCE,
          createdAt: { gte: dayStart, lt: nextDay },
        },
      }),
      tx.auditLog.count({
        where: {
          userId,
          resource: TASK_RESERVATION_RESOURCE,
          createdAt: { gte: monthStart, lt: nextMonth },
        },
      }),
    ]);

    if (monthlyTasks >= FREE_TIER_MONTHLY_TASK_LIMIT) {
      return { ok: false as const, period: "monthly" as const };
    }
    if (dailyTasks >= FREE_TIER_DAILY_TASK_LIMIT) {
      return { ok: false as const, period: "daily" as const };
    }

    const reservation = await tx.auditLog.create({
      data: {
        userId,
        action: "admin_action",
        resource: TASK_RESERVATION_RESOURCE,
        metadata: {
          kind: "manus_campaign_task_reserved",
          status: "reserved",
          externalActionTaken: false,
          dailyTaskLimit: FREE_TIER_DAILY_TASK_LIMIT,
          monthlyTaskLimit: FREE_TIER_MONTHLY_TASK_LIMIT,
          resetTimezone: "UTC",
        },
        ipAddress,
        userAgent,
      },
      select: { id: true },
    });

    return { ok: true as const, reservationId: reservation.id };
  });
}

function quotaLimitResponse(period: "daily" | "monthly") {
  const daily = period === "daily";
  return NextResponse.json(
    {
      error: daily
        ? "Today's conservative Manus task limit has been reached. Wait until 00:00 UTC before starting another task."
        : "The conservative Manus monthly task limit has been reached. Wait for the next UTC month or use GEM's local campaign drafting tools.",
      code: daily ? "MANUS_DAILY_LIMIT_REACHED" : "MANUS_MONTHLY_LIMIT_REACHED",
      limits: {
        dailyTasks: FREE_TIER_DAILY_TASK_LIMIT,
        monthlyTasks: FREE_TIER_MONTHLY_TASK_LIMIT,
        resetTimezone: "UTC",
      },
    },
    { status: 429, headers: { "Cache-Control": "no-store" } },
  );
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
  let reservationId: string | undefined;
  let createdTask:
    | Awaited<ReturnType<typeof createManusCampaignTask>>
    | undefined;

  try {
    assertManusTaskCreationApproved();
    const reservation = await reserveTaskQuota(
      gate.session.userId,
      ipAddress,
      userAgent,
    );
    if (!reservation.ok) return quotaLimitResponse(reservation.period);
    reservationId = reservation.reservationId;

    const task = await createManusCampaignTask(parsed.data);
    createdTask = task;
    await db.auditLog.update({
      where: { id: reservationId },
      data: {
        resourceId: task.taskId,
        metadata: {
          kind: "manus_campaign_task_created",
          status: "created",
          service: parsed.data.service,
          channels: parsed.data.channels,
          shareVisibility: "private",
          agentProfile: task.agentProfile,
          quotaPolicy: {
            dailyTaskLimit: FREE_TIER_DAILY_TASK_LIMIT,
            monthlyTaskLimit: FREE_TIER_MONTHLY_TASK_LIMIT,
            resetTimezone: "UTC",
          },
          externalActionTaken: true,
          publicationAllowed: false,
        },
      },
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
        externalActionTaken: true,
        publicationAllowed: false,
        auditRecorded: true,
      },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (reservationId && !createdTask) {
      await db.auditLog.update({
        where: { id: reservationId },
        data: {
          metadata: {
            kind: "manus_campaign_task_failed",
            status: "failed_before_task_confirmation",
            externalActionTaken: false,
            publicationAllowed: false,
          },
        },
      }).catch((auditError) => {
        console.error("[POST /api/admin/manus/campaigns] failed to update reservation", auditError);
      });
    }
    if (reservationId && createdTask) {
      console.error(
        "[POST /api/admin/manus/campaigns] external task created but audit binding failed",
        error,
      );
      return NextResponse.json(
        {
          error: "A private Manus task was created, but GEM could not complete its audit binding. Do not retry this request; review the returned task directly.",
          code: "MANUS_AUDIT_BINDING_FAILED",
          task: createdTask,
          externalActionTaken: true,
          publicationAllowed: false,
          auditRecorded: false,
        },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }
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
