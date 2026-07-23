-- Durable, provider-neutral social publishing queue.
-- This migration does not enable live publishing. All provider gates remain
-- fail-closed and are evaluated by the server-side worker before any write.

CREATE TABLE "social_publishing_jobs" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "connector_id" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "content_version_hash" TEXT NOT NULL,
    "approved_version_hash" TEXT NOT NULL,
    "approval_id" TEXT NOT NULL,
    "compliance_review_id" TEXT NOT NULL,
    "compliance_passed" BOOLEAN NOT NULL DEFAULT false,
    "idempotency_key" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "local_context" TEXT,
    "state" TEXT NOT NULL DEFAULT 'PENDING',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "next_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claim_id" TEXT,
    "claim_expires_at" TIMESTAMP(3),
    "external_post_id" TEXT,
    "external_post_url" TEXT,
    "provider_status_code" INTEGER,
    "safe_provider_metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "last_error_code" TEXT,
    "last_error_message" TEXT,
    "requested_by_id" TEXT,
    "scheduled_for" TIMESTAMP(3),
    "claimed_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_publishing_jobs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "social_publishing_jobs_provider_check" CHECK (
      "provider" IN (
        'FACEBOOK_PAGE',
        'INSTAGRAM_PROFESSIONAL',
        'X',
        'LINKEDIN_COMPANY',
        'YOUTUBE',
        'NEXTDOOR'
      )
    ),
    CONSTRAINT "social_publishing_jobs_state_check" CHECK (
      "state" IN (
        'PENDING',
        'CLAIMED',
        'RETRYING',
        'PUBLISHED',
        'FAILED',
        'DEAD_LETTER',
        'BLOCKED',
        'CANCELLED'
      )
    ),
    CONSTRAINT "social_publishing_jobs_attempts_check" CHECK (
      "attempt_count" >= 0 AND "max_attempts" BETWEEN 1 AND 5
    )
);

CREATE TABLE "social_publishing_attempts" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "error_code" TEXT,
    "error_message" TEXT,
    "provider_status_code" INTEGER,
    "safe_metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_publishing_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "social_publishing_attempts_outcome_check" CHECK (
      "outcome" IN ('PUBLISHED', 'RETRYING', 'FAILED', 'DEAD_LETTER', 'BLOCKED')
    )
);

CREATE UNIQUE INDEX "social_publishing_jobs_workspace_idempotency_key"
ON "social_publishing_jobs"("workspace_id", "idempotency_key");

CREATE INDEX "social_publishing_jobs_claimable_idx"
ON "social_publishing_jobs"("state", "next_attempt_at", "created_at");

CREATE INDEX "social_publishing_jobs_workspace_state_idx"
ON "social_publishing_jobs"("workspace_id", "state", "created_at");

CREATE UNIQUE INDEX "social_publishing_attempts_job_attempt_key"
ON "social_publishing_attempts"("job_id", "attempt_number");

ALTER TABLE "social_publishing_jobs"
ADD CONSTRAINT "social_publishing_jobs_workspace_id_fkey"
FOREIGN KEY ("workspace_id") REFERENCES "tokmetric_workspaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "social_publishing_jobs"
ADD CONSTRAINT "social_publishing_jobs_connector_id_fkey"
FOREIGN KEY ("connector_id") REFERENCES "social_connectors"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "social_publishing_jobs"
ADD CONSTRAINT "social_publishing_jobs_requested_by_id_fkey"
FOREIGN KEY ("requested_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "social_publishing_attempts"
ADD CONSTRAINT "social_publishing_attempts_job_id_fkey"
FOREIGN KEY ("job_id") REFERENCES "social_publishing_jobs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "social_publishing_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_publishing_attempts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE "social_publishing_jobs" FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE "social_publishing_attempts" FROM PUBLIC;

DO $gem_social_publishing_privileges$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL PRIVILEGES ON TABLE "social_publishing_jobs" FROM anon;
    REVOKE ALL PRIVILEGES ON TABLE "social_publishing_attempts" FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL PRIVILEGES ON TABLE "social_publishing_jobs" FROM authenticated;
    REVOKE ALL PRIVILEGES ON TABLE "social_publishing_attempts" FROM authenticated;
  END IF;
END
$gem_social_publishing_privileges$;

-- Preserve legacy Facebook content during migration while making the shared
-- connector identity available. New writes must use social_connector_id.
DO $gem_legacy_facebook_bridge$
BEGIN
  IF to_regclass('public.facebook_content_items') IS NOT NULL THEN
    ALTER TABLE public.facebook_content_items
      ADD COLUMN IF NOT EXISTS social_connector_id TEXT;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'facebook_content_items_social_connector_id_fkey'
    ) THEN
      ALTER TABLE public.facebook_content_items
        ADD CONSTRAINT facebook_content_items_social_connector_id_fkey
        FOREIGN KEY (social_connector_id) REFERENCES social_connectors(id)
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    CREATE INDEX IF NOT EXISTS idx_facebook_content_social_connector
      ON public.facebook_content_items(social_connector_id);
  END IF;
END
$gem_legacy_facebook_bridge$;
