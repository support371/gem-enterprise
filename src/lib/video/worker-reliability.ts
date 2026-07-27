import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  getVideoRenderJobById,
  type VideoRenderJobRecord,
} from "@/lib/video/store";
import { finalizeTrustedWorkerContentRender } from "@/lib/video/worker-finalization";
import { TokMetricError } from "@/lib/tokmetric/security";

const FINALIZATION_MAXIMUM_ATTEMPTS = 5;
const FINALIZATION_LEASE_MS = 3 * 60_000;
const FINALIZATION_RETRY_MS = 5 * 60_000;
const FINALIZATION_PERMISSION_RETRY_MS = 60 * 60_000;
const PRIVILEGED_ROLES = new Set(["admin", "super_admin", "internal"]);
const REQUIRED_FINALIZATION_PERMISSIONS = [
  ["create", "media"],
  ["edit", "content"],
  ["review", "content"],
  ["request", "approvals"],
] as const;

const TERMINAL_FINALIZATION_CODES = new Set([
  "CONTENT_IMMUTABLE",
  "CONTENT_NOT_FOUND",
  "CONTENT_RENDER_IMMUTABLE",
  "VIDEO_FINALIZATION_STATE_INCONSISTENT",
  "VIDEO_MEDIA_ASSET_CONFLICT",
  "VIDEO_RENDER_OWNERSHIP_INVALID",
  "VIDEO_RENDER_VERSION_MISMATCH",
  "VIDEO_UPLOAD_VERIFICATION_REQUIRED",
]);

type FinalizationClaim = {
  id: string;
  workspaceId: string;
  contentId: string;
  requestedById: string | null;
  externalPromptId: string | null;
  dispatchClaimId: string | null;
  finalizationAttemptCount: number;
};

function safeJson(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function bindWorkerPromptIdempotently(input: {
  id: string;
  claimId: string;
  promptId: string;
}) {
  const rows = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    UPDATE video_render_jobs
    SET external_prompt_id = COALESCE(external_prompt_id, ${input.promptId}),
        state = CASE
          WHEN external_prompt_id IS NULL THEN 'QUEUED'
          ELSE state
        END,
        dispatch_attempt_count = CASE
          WHEN external_prompt_id IS NULL THEN dispatch_attempt_count + 1
          ELSE dispatch_attempt_count
        END,
        dispatch_claim_id = NULL,
        dispatch_claim_expires_at = NULL,
        dispatched_at = COALESCE(dispatched_at, CURRENT_TIMESTAMP),
        error_code = NULL,
        error_message = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${input.id}
      AND (
        (
          state = 'DISPATCHING'
          AND external_prompt_id IS NULL
          AND dispatch_claim_id = ${input.claimId}
          AND dispatch_claim_expires_at > CURRENT_TIMESTAMP
        )
        OR (
          external_prompt_id = ${input.promptId}
          AND state IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FINALIZING', 'FINALIZED')
        )
      )
    RETURNING id
  `);
  if (!rows[0]) {
    throw new TokMetricError(
      409,
      "VIDEO_RENDER_DISPATCH_CLAIM_INVALID",
      "The video render dispatch claim is missing, expired, conflicting, or already completed with a different prompt.",
    );
  }
  const job = await getVideoRenderJobById(rows[0].id);
  if (!job) {
    throw new TokMetricError(
      404,
      "VIDEO_RENDER_JOB_NOT_FOUND",
      "The durable video render job was not found after prompt binding.",
    );
  }
  return job;
}

export async function ensureWorkerQueuedEvidence(input: {
  job: VideoRenderJobRecord;
  correlationId: string;
}) {
  const metadata = {
    renderJobId: input.job.id,
    contentId: input.job.contentId,
    contentVersionId: input.job.contentVersionId,
    promptId: input.job.externalPromptId,
    dispatchMode: "trusted-worker",
    externalPublicationTaken: false,
  };
  await db.$transaction(async (transaction) => {
    await transaction.$queryRaw(Prisma.sql`
      SELECT id
      FROM video_render_jobs
      WHERE id = ${input.job.id}
      FOR UPDATE
    `);
    const audit = await transaction.auditEvent.findFirst({
      where: {
        workspaceId: input.job.workspaceId,
        action: "video.render.queued",
        entityType: "video_render_job",
        entityId: input.job.id,
      },
      select: { id: true },
    });
    if (!audit) {
      await transaction.auditEvent.create({
        data: {
          workspaceId: input.job.workspaceId,
          actorId: input.job.requestedById ?? undefined,
          action: "video.render.queued",
          entityType: "video_render_job",
          entityId: input.job.id,
          correlationId: input.correlationId,
          outcome: "queued",
          sourceChannel: "video-render-worker",
          safeMetadata: safeJson(metadata),
        },
      });
    }
    const event = await transaction.domainEvent.findFirst({
      where: {
        workspaceId: input.job.workspaceId,
        aggregateType: "content",
        aggregateId: input.job.contentId,
        eventType: "VIDEO_RENDER_QUEUED",
        safeMetadata: { path: ["renderJobId"], equals: input.job.id },
      },
      select: { id: true },
    });
    if (!event) {
      await transaction.domainEvent.create({
        data: {
          workspaceId: input.job.workspaceId,
          aggregateType: "content",
          aggregateId: input.job.contentId,
          eventType: "VIDEO_RENDER_QUEUED",
          correlationId: input.correlationId,
          safeMetadata: safeJson(metadata),
        },
      });
    }
  });
}

async function authorizeAutomaticFinalizationActor(
  workspaceId: string,
  actorId: string,
) {
  const actor = await db.user.findUnique({
    where: { id: actorId },
    select: { id: true, role: true, status: true, isActive: true },
  });
  if (!actor?.isActive || actor.status !== "active") {
    throw new TokMetricError(
      403,
      "VIDEO_FINALIZATION_ACTOR_INACTIVE",
      "The original render requester is not an active account.",
    );
  }
  const membership = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: actorId } },
    include: { role: { include: { permissions: true } } },
  });
  if (!membership) {
    if (!PRIVILEGED_ROLES.has(actor.role)) {
      throw new TokMetricError(
        403,
        "VIDEO_FINALIZATION_WORKSPACE_FORBIDDEN",
        "The original render requester no longer has access to this workspace.",
      );
    }
    return actor;
  }
  for (const [action, scope] of REQUIRED_FINALIZATION_PERMISSIONS) {
    const allowed = membership.role?.permissions.some(
      (permission) =>
        permission.action === action &&
        (permission.scope === scope || permission.scope === "*"),
    );
    if (!allowed) {
      throw new TokMetricError(
        403,
        "VIDEO_FINALIZATION_PERMISSION_DENIED",
        "The original render requester no longer has every permission required for automatic finalization.",
      );
    }
  }
  return actor;
}

async function claimVerifiedRendersForFinalization(limit: number) {
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 20);
  const claimId = randomUUID();
  const claimExpiresAt = new Date(Date.now() + FINALIZATION_LEASE_MS);
  return db.$transaction(async (transaction) =>
    transaction.$queryRaw<FinalizationClaim[]>(Prisma.sql`
      WITH candidates AS (
        SELECT jobs.id
        FROM video_render_jobs jobs
        INNER JOIN video_render_uploads uploads
          ON uploads.render_job_id = jobs.id
        WHERE jobs.state = 'COMPLETED'
          AND jobs.finalization_attempt_count < ${FINALIZATION_MAXIMUM_ATTEMPTS}
          AND (
            jobs.finalization_next_attempt_at IS NULL
            OR jobs.finalization_next_attempt_at <= CURRENT_TIMESTAMP
          )
          AND (
            jobs.dispatch_claim_id IS NULL
            OR jobs.dispatch_claim_expires_at IS NULL
            OR jobs.dispatch_claim_expires_at <= CURRENT_TIMESTAMP
          )
        ORDER BY jobs.completed_at ASC NULLS LAST, jobs.created_at ASC
        FOR UPDATE OF jobs SKIP LOCKED
        LIMIT ${boundedLimit}
      )
      UPDATE video_render_jobs jobs
      SET dispatch_claim_id = ${claimId},
          dispatch_claim_expires_at = ${claimExpiresAt},
          updated_at = CURRENT_TIMESTAMP
      FROM candidates
      WHERE jobs.id = candidates.id
      RETURNING
        jobs.id,
        jobs.workspace_id AS "workspaceId",
        jobs.content_id AS "contentId",
        jobs.requested_by_id AS "requestedById",
        jobs.external_prompt_id AS "externalPromptId",
        jobs.dispatch_claim_id AS "dispatchClaimId",
        jobs.finalization_attempt_count AS "finalizationAttemptCount"
    `),
  );
}

function finalizationRetryPolicy(error: unknown) {
  if (!(error instanceof TokMetricError)) {
    return { retryable: true, retryAfterMs: FINALIZATION_RETRY_MS };
  }
  if (TERMINAL_FINALIZATION_CODES.has(error.code)) {
    return { retryable: false, retryAfterMs: 0 };
  }
  if (
    error.code === "VIDEO_FINALIZATION_ACTOR_INACTIVE" ||
    error.code === "VIDEO_FINALIZATION_PERMISSION_DENIED" ||
    error.code === "VIDEO_FINALIZATION_WORKSPACE_FORBIDDEN"
  ) {
    return {
      retryable: true,
      retryAfterMs: FINALIZATION_PERMISSION_RETRY_MS,
    };
  }
  return {
    retryable:
      error.status === 408 ||
      error.status === 429 ||
      error.status >= 500,
    retryAfterMs: FINALIZATION_RETRY_MS,
  };
}

async function finishFinalizationFailure(input: {
  record: FinalizationClaim;
  code: string;
  message: string;
  retryable: boolean;
  retryAfterMs: number;
}) {
  if (!input.record.dispatchClaimId) return;
  const retryAt = new Date(
    Date.now() +
      Math.min(Math.max(input.retryAfterMs || FINALIZATION_RETRY_MS, 60_000), 24 * 60 * 60_000),
  );
  await db.$executeRaw(Prisma.sql`
    UPDATE video_render_jobs
    SET finalization_attempt_count = finalization_attempt_count + 1,
        finalization_next_attempt_at = CASE
          WHEN ${input.retryable}
            AND finalization_attempt_count + 1 < ${FINALIZATION_MAXIMUM_ATTEMPTS}
          THEN ${retryAt}
          ELSE NULL
        END,
        state = CASE
          WHEN ${input.retryable}
            AND finalization_attempt_count + 1 < ${FINALIZATION_MAXIMUM_ATTEMPTS}
          THEN 'COMPLETED'
          ELSE 'FAILED'
        END,
        dispatch_claim_id = NULL,
        dispatch_claim_expires_at = NULL,
        error_code = ${input.code.slice(0, 100)},
        error_message = ${input.message.slice(0, 500)},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${input.record.id}
      AND state = 'COMPLETED'
      AND dispatch_claim_id = ${input.record.dispatchClaimId}
  `);
}

export async function finalizeVerifiedWorkerRendersReliably(input: {
  limit?: number;
  correlationId: string;
}) {
  const claimed = await claimVerifiedRendersForFinalization(input.limit ?? 5);
  const results: Array<Record<string, unknown>> = [];

  for (const record of claimed) {
    if (!record.dispatchClaimId || !record.externalPromptId || !record.requestedById) {
      await finishFinalizationFailure({
        record,
        code: "VIDEO_FINALIZATION_ACTOR_OR_PROMPT_MISSING",
        message:
          "The verified render does not have the prompt or authorized requester required for finalization.",
        retryable: false,
        retryAfterMs: 0,
      });
      results.push({
        renderJobId: record.id,
        status: "failed",
        code: "VIDEO_FINALIZATION_ACTOR_OR_PROMPT_MISSING",
      });
      continue;
    }

    try {
      await authorizeAutomaticFinalizationActor(
        record.workspaceId,
        record.requestedById,
      );
      const finalized = await finalizeTrustedWorkerContentRender({
        workspaceId: record.workspaceId,
        contentId: record.contentId,
        promptId: record.externalPromptId,
        actorId: record.requestedById,
        correlationId: input.correlationId,
      });
      results.push({
        renderJobId: record.id,
        status: "finalized",
        contentVersionId: finalized.contentVersionId,
        approvalRequestId: finalized.approvalRequestId,
      });
    } catch (error) {
      const code =
        error instanceof TokMetricError
          ? error.code
          : "VIDEO_FINALIZATION_FAILED";
      const message =
        error instanceof TokMetricError
          ? error.message
          : "The verified render could not be finalized.";
      const policy = finalizationRetryPolicy(error);
      await finishFinalizationFailure({
        record,
        code,
        message,
        retryable: policy.retryable,
        retryAfterMs: policy.retryAfterMs,
      }).catch(() => undefined);
      results.push({ renderJobId: record.id, status: "failed", code });
    }
  }

  return {
    claimed: claimed.length,
    finalized: results.filter((result) => result.status === "finalized").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
    externalPublicationTaken: false,
  };
}
