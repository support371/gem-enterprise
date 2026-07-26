-- Durable, workspace-scoped video rendering lifecycle.
-- This migration does not enable social publishing or expose the render worker.

CREATE TABLE "video_render_jobs" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "content_version_id" TEXT NOT NULL,
    "compliance_review_id" TEXT NOT NULL,
    "requested_by_id" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'comfyui-local',
    "client_id" TEXT NOT NULL,
    "external_prompt_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'DISPATCHING',
    "error_code" TEXT,
    "error_message" TEXT,
    "output_manifest" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "finalized_at" TIMESTAMP(3),

    CONSTRAINT "video_render_jobs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "video_render_jobs_state_check" CHECK (
      "state" IN (
        'DISPATCHING',
        'QUEUED',
        'RUNNING',
        'COMPLETED',
        'FAILED',
        'CANCELLED',
        'FINALIZING',
        'FINALIZED'
      )
    ),
    CONSTRAINT "video_render_jobs_provider_check" CHECK (
      "provider" IN ('comfyui-local')
    )
);

CREATE TABLE "video_render_uploads" (
    "id" TEXT NOT NULL,
    "render_job_id" TEXT NOT NULL,
    "storage_ref" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "checksum_sha256" TEXT NOT NULL,
    "safe_metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_render_uploads_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "video_render_uploads_size_check" CHECK (
      "file_size" > 0 AND "file_size" <= 1073741824
    ),
    CONSTRAINT "video_render_uploads_checksum_check" CHECK (
      "checksum_sha256" ~ '^[a-f0-9]{64}$'
    )
);

CREATE UNIQUE INDEX "video_render_jobs_workspace_idempotency_key"
ON "video_render_jobs"("workspace_id", "idempotency_key");

CREATE UNIQUE INDEX "video_render_jobs_client_id_key"
ON "video_render_jobs"("client_id");

CREATE UNIQUE INDEX "video_render_jobs_external_prompt_id_key"
ON "video_render_jobs"("external_prompt_id")
WHERE "external_prompt_id" IS NOT NULL;

CREATE INDEX "video_render_jobs_content_state_idx"
ON "video_render_jobs"("workspace_id", "content_id", "state", "created_at");

CREATE UNIQUE INDEX "video_render_uploads_render_job_id_key"
ON "video_render_uploads"("render_job_id");

CREATE UNIQUE INDEX "video_render_uploads_storage_ref_key"
ON "video_render_uploads"("storage_ref");

ALTER TABLE "video_render_jobs"
ADD CONSTRAINT "video_render_jobs_workspace_id_fkey"
FOREIGN KEY ("workspace_id") REFERENCES "tokmetric_workspaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "video_render_jobs"
ADD CONSTRAINT "video_render_jobs_content_id_fkey"
FOREIGN KEY ("content_id") REFERENCES "tokmetric_contents"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "video_render_jobs"
ADD CONSTRAINT "video_render_jobs_content_version_id_fkey"
FOREIGN KEY ("content_version_id") REFERENCES "tokmetric_content_versions"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "video_render_jobs"
ADD CONSTRAINT "video_render_jobs_compliance_review_id_fkey"
FOREIGN KEY ("compliance_review_id") REFERENCES "tokmetric_compliance_reviews"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "video_render_jobs"
ADD CONSTRAINT "video_render_jobs_requested_by_id_fkey"
FOREIGN KEY ("requested_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "video_render_uploads"
ADD CONSTRAINT "video_render_uploads_render_job_id_fkey"
FOREIGN KEY ("render_job_id") REFERENCES "video_render_jobs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "video_render_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "video_render_uploads" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE "video_render_jobs" FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE "video_render_uploads" FROM PUBLIC;

DO $gem_video_render_privileges$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL PRIVILEGES ON TABLE "video_render_jobs" FROM anon;
    REVOKE ALL PRIVILEGES ON TABLE "video_render_uploads" FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL PRIVILEGES ON TABLE "video_render_jobs" FROM authenticated;
    REVOKE ALL PRIVILEGES ON TABLE "video_render_uploads" FROM authenticated;
  END IF;
END
$gem_video_render_privileges$;
