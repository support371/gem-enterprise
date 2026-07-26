-- Allow the trusted local worker to claim durable render jobs and submit them to
-- private ComfyUI without exposing ComfyUI to the Vercel runtime.

ALTER TABLE "video_render_jobs"
ADD COLUMN "dispatch_payload" JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN "dispatch_attempt_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dispatch_claim_id" TEXT,
ADD COLUMN "dispatch_claim_expires_at" TIMESTAMP(3),
ADD COLUMN "dispatched_at" TIMESTAMP(3);

ALTER TABLE "video_render_jobs"
ADD CONSTRAINT "video_render_jobs_dispatch_attempt_count_check"
CHECK ("dispatch_attempt_count" >= 0 AND "dispatch_attempt_count" <= 20);

CREATE INDEX "video_render_jobs_dispatch_claim_idx"
ON "video_render_jobs"(
  "state",
  "dispatch_claim_expires_at",
  "created_at"
)
WHERE "external_prompt_id" IS NULL;

CREATE INDEX "video_render_jobs_finalization_ready_idx"
ON "video_render_jobs"("state", "completed_at", "created_at")
WHERE "state" = 'COMPLETED';
