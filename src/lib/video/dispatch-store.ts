import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { VideoRenderJobRecord } from "@/lib/video/store";
import { TokMetricError } from "@/lib/tokmetric/security";

type VideoRenderJobRow = Omit<
  VideoRenderJobRecord,
  "dispatchPayload" | "outputManifest"
> & {
  dispatchPayload: unknown;
  outputManifest: unknown;
};

const qualifiedJobSelection = Prisma.sql`
  jobs.id,
  jobs.workspace_id AS "workspaceId",
  jobs.content_id AS "contentId",
  jobs.content_version_id AS "contentVersionId",
  jobs.compliance_review_id AS "complianceReviewId",
  jobs.requested_by_id AS "requestedById",
  jobs.provider,
  jobs.client_id AS "clientId",
  jobs.external_prompt_id AS "externalPromptId",
  jobs.idempotency_key AS "idempotencyKey",
  jobs.request_hash AS "requestHash",
  jobs.dispatch_payload AS "dispatchPayload",
  jobs.dispatch_attempt_count AS "dispatchAttemptCount",
  jobs.dispatch_claim_id AS "dispatchClaimId",
  jobs.dispatch_claim_expires_at AS "dispatchClaimExpiresAt",
  jobs.dispatched_at AS "dispatchedAt",
  jobs.state,
  jobs.error_code AS "errorCode",
  jobs.error_message AS "errorMessage",
  jobs.output_manifest AS "outputManifest",
  jobs.created_at AS "createdAt",
  jobs.updated_at AS "updatedAt",
  jobs.completed_at AS "completedAt",
  jobs.finalized_at AS "finalizedAt"
`;

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function job(row: VideoRenderJobRow): VideoRenderJobRecord {
  return {
    ...row,
    dispatchPayload: object(row.dispatchPayload),
    outputManifest: object(row.outputManifest),
  };
}

function isMissingStore(error: unknown) {
  if (!(error instanceof Error)) return false;
  const text = `${error.name} ${error.message}`.toLowerCase();
  return (
    text.includes("video_render_jobs") &&
    (text.includes("does not exist") ||
      text.includes("42p01") ||
      text.includes("p2010") ||
      text.includes("dispatch_payload"))
  );
}

export async function claimWorkerDispatchJobs(input: {
  limit?: number;
  leaseMs?: number;
  maximumAttempts?: number;
}) {
  const limit = Math.min(Math.max(Math.trunc(input.limit ?? 5), 1), 20);
  const leaseMs = Math.min(
    Math.max(Math.trunc(input.leaseMs ?? 120_000), 30_000),
    15 * 60_000,
  );
  const maximumAttempts = Math.min(Math.max(input.maximumAttempts ?? 5, 1), 20);
  const claimId = randomUUID();
  const claimExpiresAt = new Date(Date.now() + leaseMs);

  try {
    const rows = await db.$transaction(async (transaction) =>
      transaction.$queryRaw<VideoRenderJobRow[]>(Prisma.sql`
        WITH candidates AS (
          SELECT id
          FROM video_render_jobs
          WHERE state = 'DISPATCHING'
            AND external_prompt_id IS NULL
            AND dispatch_attempt_count < ${maximumAttempts}
            AND (
              dispatch_claim_expires_at IS NULL
              OR dispatch_claim_expires_at <= CURRENT_TIMESTAMP
            )
          ORDER BY created_at ASC
          FOR UPDATE SKIP LOCKED
          LIMIT ${limit}
        )
        UPDATE video_render_jobs jobs
        SET dispatch_claim_id = ${claimId},
            dispatch_claim_expires_at = ${claimExpiresAt},
            updated_at = CURRENT_TIMESTAMP
        FROM candidates
        WHERE jobs.id = candidates.id
        RETURNING ${qualifiedJobSelection}
      `),
    );
    return rows.map(job);
  } catch (error) {
    if (isMissingStore(error)) {
      throw new TokMetricError(
        503,
        "VIDEO_RENDER_STORE_NOT_PROVISIONED",
        "The durable video render dispatch store has not been provisioned.",
      );
    }
    throw error;
  }
}
