-- Extend GEM Verify Secure Evidence Vault with upload authorization and scan tracking.
-- This migration does not activate document intake or create any public access policy.

ALTER TABLE public.gem_verify_evidence_items
  ADD COLUMN IF NOT EXISTS upload_token_hash text,
  ADD COLUMN IF NOT EXISTS upload_url_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS upload_completed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS verified_file_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS storage_etag text,
  ADD COLUMN IF NOT EXISTS scan_job_id text,
  ADD COLUMN IF NOT EXISTS scan_provider text,
  ADD COLUMN IF NOT EXISTS scan_requested_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS scan_completed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS scan_result jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'gem_verify_evidence_items_verified_size_check'
  ) THEN
    ALTER TABLE public.gem_verify_evidence_items
      ADD CONSTRAINT gem_verify_evidence_items_verified_size_check
      CHECK (
        verified_file_size_bytes IS NULL OR
        (verified_file_size_bytes > 0 AND verified_file_size_bytes <= 10485760)
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS gem_verify_evidence_items_upload_expiry_idx
  ON public.gem_verify_evidence_items (upload_url_expires_at)
  WHERE status = 'reserved';

CREATE INDEX IF NOT EXISTS gem_verify_evidence_items_scan_job_idx
  ON public.gem_verify_evidence_items (scan_job_id)
  WHERE scan_job_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.gem_verify_evidence_scan_jobs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  evidence_id text NOT NULL,
  provider text NOT NULL,
  provider_job_id text,
  status text NOT NULL DEFAULT 'queued',
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_error text,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT gem_verify_evidence_scan_jobs_evidence_fk
    FOREIGN KEY (evidence_id)
    REFERENCES public.gem_verify_evidence_items(id)
    ON DELETE CASCADE,
  CONSTRAINT gem_verify_evidence_scan_jobs_status_check
    CHECK (status IN ('queued','submitted','running','passed','failed','error','cancelled'))
);

ALTER TABLE public.gem_verify_evidence_scan_jobs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS gem_verify_evidence_scan_jobs_evidence_status_idx
  ON public.gem_verify_evidence_scan_jobs (evidence_id, status, requested_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS gem_verify_evidence_scan_jobs_provider_job_idx
  ON public.gem_verify_evidence_scan_jobs (provider, provider_job_id)
  WHERE provider_job_id IS NOT NULL;

ALTER TABLE public.gem_verify_evidence_access_events
  DROP CONSTRAINT IF EXISTS gem_verify_evidence_access_events_action_check;

ALTER TABLE public.gem_verify_evidence_access_events
  ADD CONSTRAINT gem_verify_evidence_access_events_action_check
  CHECK (action IN (
    'metadata_read',
    'view_requested',
    'signed_url_issued',
    'downloaded',
    'upload_reserved',
    'upload_completed',
    'scan_requested',
    'scan_callback_received',
    'validation_recorded',
    'quarantine_changed',
    'released',
    'rejected',
    'deletion_requested',
    'deleted'
  ));

REVOKE ALL ON TABLE public.gem_verify_evidence_scan_jobs FROM anon, authenticated;
