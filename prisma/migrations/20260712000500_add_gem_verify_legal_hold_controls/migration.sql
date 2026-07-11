-- Controlled legal-hold metadata for GEM Verify evidence.
-- This migration does not apply or release any legal hold.

ALTER TABLE public.gem_verify_evidence_items
  ADD COLUMN IF NOT EXISTS legal_hold_reason text,
  ADD COLUMN IF NOT EXISTS legal_hold_applied_by_user_id text,
  ADD COLUMN IF NOT EXISTS legal_hold_applied_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS legal_hold_release_reason text,
  ADD COLUMN IF NOT EXISTS legal_hold_released_by_user_id text,
  ADD COLUMN IF NOT EXISTS legal_hold_released_at timestamp with time zone;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gem_verify_evidence_items_hold_applier_fk'
  ) THEN
    ALTER TABLE public.gem_verify_evidence_items
      ADD CONSTRAINT gem_verify_evidence_items_hold_applier_fk
      FOREIGN KEY (legal_hold_applied_by_user_id)
      REFERENCES public.users(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gem_verify_evidence_items_hold_releaser_fk'
  ) THEN
    ALTER TABLE public.gem_verify_evidence_items
      ADD CONSTRAINT gem_verify_evidence_items_hold_releaser_fk
      FOREIGN KEY (legal_hold_released_by_user_id)
      REFERENCES public.users(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gem_verify_evidence_items_hold_separation_check'
  ) THEN
    ALTER TABLE public.gem_verify_evidence_items
      ADD CONSTRAINT gem_verify_evidence_items_hold_separation_check
      CHECK (
        legal_hold_released_by_user_id IS NULL OR
        legal_hold_applied_by_user_id IS NULL OR
        legal_hold_released_by_user_id <> legal_hold_applied_by_user_id
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS gem_verify_evidence_items_hold_applier_idx
  ON public.gem_verify_evidence_items (legal_hold_applied_by_user_id)
  WHERE legal_hold_applied_by_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS gem_verify_evidence_items_hold_releaser_idx
  ON public.gem_verify_evidence_items (legal_hold_released_by_user_id)
  WHERE legal_hold_released_by_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS gem_verify_evidence_items_active_hold_idx
  ON public.gem_verify_evidence_items (legal_hold_applied_at DESC)
  WHERE legal_hold = true AND deleted_at IS NULL;

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
    'legal_hold_applied',
    'legal_hold_released',
    'deletion_requested',
    'deleted'
  ));
