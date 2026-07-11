-- GEM Verify Secure Evidence Vault foundation
-- This migration creates only the fail-closed storage and metadata control plane.
-- Applicant uploads remain disabled in application code until server credentials,
-- malware scanning, retention policy, and operational approval are verified.

CREATE TABLE IF NOT EXISTS "gem_verify_evidence_items" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "application_id" text NOT NULL,
  "uploaded_by_user_id" text,
  "document_type" text NOT NULL,
  "storage_bucket" text NOT NULL DEFAULT 'gem-verify-evidence',
  "storage_path" text NOT NULL UNIQUE,
  "original_filename" text NOT NULL,
  "declared_mime_type" text NOT NULL,
  "detected_mime_type" text,
  "file_size_bytes" bigint NOT NULL,
  "sha256" text,
  "status" text NOT NULL DEFAULT 'reserved',
  "quarantine_status" text NOT NULL DEFAULT 'pending',
  "validation_status" text NOT NULL DEFAULT 'pending',
  "reviewer_status" text NOT NULL DEFAULT 'pending',
  "country_of_issue" text,
  "issued_at" date,
  "expires_at" date,
  "retention_until" timestamp with time zone,
  "legal_hold" boolean NOT NULL DEFAULT false,
  "deletion_requested_at" timestamp with time zone,
  "deleted_at" timestamp with time zone,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "gem_verify_evidence_items_application_fk"
    FOREIGN KEY ("application_id") REFERENCES "kyc_applications"("id") ON DELETE CASCADE,
  CONSTRAINT "gem_verify_evidence_items_uploader_fk"
    FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
  CONSTRAINT "gem_verify_evidence_items_file_size_check"
    CHECK ("file_size_bytes" > 0 AND "file_size_bytes" <= 10485760),
  CONSTRAINT "gem_verify_evidence_items_status_check"
    CHECK ("status" IN ('reserved','uploaded','quarantined','released','rejected','deletion_pending','deleted')),
  CONSTRAINT "gem_verify_evidence_items_quarantine_check"
    CHECK ("quarantine_status" IN ('pending','scanning','passed','failed','manual_hold')),
  CONSTRAINT "gem_verify_evidence_items_validation_check"
    CHECK ("validation_status" IN ('pending','in_progress','passed','failed','needs_information')),
  CONSTRAINT "gem_verify_evidence_items_reviewer_check"
    CHECK ("reviewer_status" IN ('pending','assigned','under_review','accepted','rejected'))
);

CREATE INDEX IF NOT EXISTS "gem_verify_evidence_items_application_status_idx"
  ON "gem_verify_evidence_items" ("application_id", "status");
CREATE INDEX IF NOT EXISTS "gem_verify_evidence_items_created_at_idx"
  ON "gem_verify_evidence_items" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "gem_verify_evidence_items_retention_idx"
  ON "gem_verify_evidence_items" ("retention_until")
  WHERE "deleted_at" IS NULL AND "legal_hold" = false;
CREATE INDEX IF NOT EXISTS "gem_verify_evidence_items_sha256_idx"
  ON "gem_verify_evidence_items" ("sha256")
  WHERE "sha256" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "gem_verify_evidence_access_events" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "evidence_id" text NOT NULL,
  "actor_user_id" text,
  "action" text NOT NULL,
  "purpose" text NOT NULL,
  "result" text NOT NULL DEFAULT 'recorded',
  "ip_address" text,
  "user_agent" text,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "gem_verify_evidence_access_events_evidence_fk"
    FOREIGN KEY ("evidence_id") REFERENCES "gem_verify_evidence_items"("id") ON DELETE CASCADE,
  CONSTRAINT "gem_verify_evidence_access_events_actor_fk"
    FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
  CONSTRAINT "gem_verify_evidence_access_events_action_check"
    CHECK ("action" IN (
      'metadata_read','view_requested','signed_url_issued','downloaded',
      'validation_recorded','quarantine_changed','released','rejected',
      'deletion_requested','deleted'
    ))
);

CREATE INDEX IF NOT EXISTS "gem_verify_evidence_access_events_evidence_created_idx"
  ON "gem_verify_evidence_access_events" ("evidence_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "gem_verify_evidence_access_events_actor_created_idx"
  ON "gem_verify_evidence_access_events" ("actor_user_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "gem_verify_evidence_validations" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "evidence_id" text NOT NULL,
  "check_type" text NOT NULL,
  "status" text NOT NULL,
  "details" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "checked_by_user_id" text,
  "checked_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "gem_verify_evidence_validations_evidence_fk"
    FOREIGN KEY ("evidence_id") REFERENCES "gem_verify_evidence_items"("id") ON DELETE CASCADE,
  CONSTRAINT "gem_verify_evidence_validations_actor_fk"
    FOREIGN KEY ("checked_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
  CONSTRAINT "gem_verify_evidence_validations_status_check"
    CHECK ("status" IN ('pending','passed','failed','not_applicable','manual_review'))
);

CREATE INDEX IF NOT EXISTS "gem_verify_evidence_validations_evidence_checked_idx"
  ON "gem_verify_evidence_validations" ("evidence_id", "checked_at" DESC);

CREATE TABLE IF NOT EXISTS "gem_verify_retention_policies" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "document_type" text NOT NULL UNIQUE,
  "retention_days" integer NOT NULL,
  "legal_basis" text NOT NULL,
  "jurisdiction" text,
  "is_active" boolean NOT NULL DEFAULT false,
  "created_by_user_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "gem_verify_retention_policies_days_check"
    CHECK ("retention_days" > 0),
  CONSTRAINT "gem_verify_retention_policies_creator_fk"
    FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
);

ALTER TABLE "gem_verify_evidence_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gem_verify_evidence_access_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gem_verify_evidence_validations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gem_verify_retention_policies" ENABLE ROW LEVEL SECURITY;

-- Access events are append-only. Corrections must be represented by a new event.
CREATE OR REPLACE FUNCTION public.gem_verify_block_access_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'GEM Verify evidence access events are append-only';
END;
$$;

DROP TRIGGER IF EXISTS "gem_verify_access_events_append_only" ON "gem_verify_evidence_access_events";
CREATE TRIGGER "gem_verify_access_events_append_only"
BEFORE UPDATE OR DELETE ON "gem_verify_evidence_access_events"
FOR EACH ROW EXECUTE FUNCTION public.gem_verify_block_access_event_mutation();

-- Create or harden the private evidence bucket. No public object policies are added.
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'gem-verify-evidence',
  'gem-verify-evidence',
  false,
  10485760,
  ARRAY['application/pdf','image/jpeg','image/png']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  updated_at = now();
