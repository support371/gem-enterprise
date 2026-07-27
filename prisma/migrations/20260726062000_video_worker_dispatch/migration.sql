-- Allow the trusted local worker to claim durable render jobs and submit them to
-- private ComfyUI without exposing ComfyUI to the Vercel runtime.

ALTER TABLE "video_render_jobs"
ADD COLUMN "dispatch_payload" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN "dispatch_attempt_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dispatch_claim_id" TEXT,
ADD COLUMN "dispatch_claim_expires_at" TIMESTAMP(3),
ADD COLUMN "dispatched_at" TIMESTAMP(3),
ADD COLUMN "finalization_attempt_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "finalization_next_attempt_at" TIMESTAMP(3);

-- Pre-existing DISPATCHING rows cannot be submitted by the new worker because
-- no valid workflow payload exists for them. Quarantine them so they cannot
-- poison every leased batch after this migration is applied.
UPDATE "video_render_jobs"
SET "state" = 'FAILED',
    "dispatch_attempt_count" = 20,
    "error_code" = 'VIDEO_RENDER_LEGACY_DISPATCH_QUARANTINED',
    "error_message" = 'The pre-worker render job has no durable dispatch payload and must be queued again.',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "state" = 'DISPATCHING'
  AND "external_prompt_id" IS NULL
  AND "dispatch_payload" = '{}'::jsonb;

ALTER TABLE "video_render_jobs"
ADD CONSTRAINT "video_render_jobs_dispatch_attempt_count_check"
CHECK ("dispatch_attempt_count" >= 0 AND "dispatch_attempt_count" <= 20),
ADD CONSTRAINT "video_render_jobs_finalization_attempt_count_check"
CHECK ("finalization_attempt_count" >= 0 AND "finalization_attempt_count" <= 20);

CREATE INDEX "video_render_jobs_dispatch_claim_idx"
ON "video_render_jobs"(
  "state",
  "dispatch_claim_expires_at",
  "created_at"
)
WHERE "external_prompt_id" IS NULL;

CREATE INDEX "video_render_jobs_finalization_ready_idx"
ON "video_render_jobs"(
  "state",
  "finalization_next_attempt_at",
  "completed_at",
  "created_at"
)
WHERE "state" = 'COMPLETED';
