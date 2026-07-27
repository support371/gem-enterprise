import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { finalizeTrustedWorkerContentRender } from "@/lib/video/worker-finalization";
import { TokMetricError } from "@/lib/tokmetric/security";

type FinalizationClaim = {
  id: string;
  workspaceId: string;
  contentId: string;
  requestedById: string | null;
  externalPromptId: string | null;
  dispatchClaimId: string | null;
};

const TERMINAL_FINALIZATION_CODES = new Set([
  "VIDEO_FINALIZATION_ACTOR_OR_PROMPT_MISSING",
  "VIDEO_FINALIZATION_ACTOR_INACTIVE",
  "VIDEO_RENDER_OWNERSHIP_INVALID",
  "VIDEO_RENDER_VERSION_MISMATCH",
  "CONTENT_IMMUTABLE",
  "CONTENT_RENDER_IMMUTABLE",
  "CONTENT_NOT_FOUND",
  "CONTENT_VERSION_MISSING",
]);

async function claimVerifiedRendersForFinalization(limit: number) {
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 20);
  const claimId = randomUUID();
  const claimExpiresAt = new Date(Date.now() + 3 * 60_000);
  return db.$transaction(async (transaction) =>
    transaction.$queryRaw<FinalizationClaim[]>(Prisma.sql`
      WITH candidates AS (
        SELECT jobs.id
        FROM video_render_jobs jobs
        INNER JOIN video_render_uploads uploads
          ON uploads.render_job_id = jobs.id
        WHERE jobs.state = 'COMPLETED'
          AND jobs.requested_by_id IS NOT NULL
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
        jobs.dispatch_claim_id AS "dispatchClaimId"
    `),
  );
}

async function releaseFinalizationClaim(input: {
  id: string;
  claimId: string;
  errorCode: string;
  errorMessage: string;
  terminal?: boolean;
  retryAfterMs?: number;
}) {
  const terminal = input.terminal === true;
  const retryAt = new Date(
    Date.now() +
      Math.min(
        Math.max(input.retryAfterMs ?? 5 * 60_000, 60_000),
        24 * 60 * 60_000,
      ),
  );
  await db.$executeRaw(Prisma.sql`
    UPDATE video_render_jobs
    SET state = CASE WHEN ${terminal} THEN 'FAILED' ELSE state END,
        dispatch_claim_id = CASE WHEN ${terminal} THEN NULL ELSE ${input.claimId} END,
        dispatch_claim_expires_at = CASE WHEN ${terminal} THEN NULL ELSE ${retryAt} END,
        error_code = ${input.errorCode.slice(0, 100)},
        error_message = ${input.errorMessage.slice(0, 500)},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${input.id}
      AND state = 'COMPLETED'
      AND dispatch_claim_id = ${input.claimId}
  `);
}

export async function finalizeVerifiedWorkerRenders(input: {
  limit?: number;
  correlationId: string;
}) {
  const claimed = await claimVerifiedRendersForFinalization(input.limit ?? 5);
  const results: Array<Record<string, unknown>> = [];

  for (const record of claimed) {
    const claimId = record.dispatchClaimId;
    if (!claimId || !record.externalPromptId || !record.requestedById) {
      if (claimId) {
        await releaseFinalizationClaim({
          id: record.id,
          claimId,
          errorCode: "VIDEO_FINALIZATION_ACTOR_OR_PROMPT_MISSING",
          errorMessage:
            "The verified render does not have the prompt or original authorized actor required for finalization.",
          terminal: true,
        });
      }
      results.push({
        renderJobId: record.id,
        status: "failed",
        terminal: true,
        code: "VIDEO_FINALIZATION_ACTOR_OR_PROMPT_MISSING",
      });
      continue;
    }

    const actor = await db.user.findUnique({
      where: { id: record.requestedById },
      select: { status: true, isActive: true },
    });
    if (!actor?.isActive || actor.status !== "active") {
      await releaseFinalizationClaim({
        id: record.id,
        claimId,
        errorCode: "VIDEO_FINALIZATION_ACTOR_INACTIVE",
        errorMessage:
          "The original authorized operator is no longer active, so automatic finalization is blocked.",
        terminal: true,
      });
      results.push({
        renderJobId: record.id,
        status: "failed",
        terminal: true,
        code: "VIDEO_FINALIZATION_ACTOR_INACTIVE",
      });
      continue;
    }

    try {
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
      const code = error instanceof TokMetricError ? error.code : "VIDEO_FINALIZATION_FAILED";
      const message =
        error instanceof TokMetricError
          ? error.message
          : "The verified render could not be finalized.";
      const terminal = TERMINAL_FINALIZATION_CODES.has(code);
      await releaseFinalizationClaim({
        id: record.id,
        claimId,
        errorCode: code,
        errorMessage: message,
        terminal,
      }).catch(() => undefined);
      results.push({ renderJobId: record.id, status: "failed", terminal, code });
    }
  }

  return {
    claimed: claimed.length,
    finalized: results.filter((result) => result.status === "finalized").length,
    failed: results.filter((result) => result.status === "failed").length,
    terminal: results.filter((result) => result.terminal === true).length,
    results,
    externalPublicationTaken: false,
  };
}
