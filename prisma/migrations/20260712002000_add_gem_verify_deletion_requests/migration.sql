-- Two-person evidence deletion request governance.
-- This migration creates no automatic or executable deletion path.

CREATE TABLE IF NOT EXISTS public.gem_verify_evidence_deletion_requests (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  evidence_id text NOT NULL,
  requested_by_user_id text,
  approved_by_user_id text,
  rejected_by_user_id text,
  status text NOT NULL DEFAULT 'requested',
  reason text NOT NULL,
  rejection_reason text,
  eligibility_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  rejected_at timestamp with time zone,
  executed_at timestamp with time zone,
  execution_error text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT gem_verify_deletion_requests_evidence_fk
    FOREIGN KEY (evidence_id)
    REFERENCES public.gem_verify_evidence_items(id)
    ON DELETE CASCADE,
  CONSTRAINT gem_verify_deletion_requests_requester_fk
    FOREIGN KEY (requested_by_user_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL,
  CONSTRAINT gem_verify_deletion_requests_approver_fk
    FOREIGN KEY (approved_by_user_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL,
  CONSTRAINT gem_verify_deletion_requests_rejector_fk
    FOREIGN KEY (rejected_by_user_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL,
  CONSTRAINT gem_verify_deletion_requests_status_check
    CHECK (status IN ('requested','approved','rejected','executed','cancelled','failed')),
  CONSTRAINT gem_verify_deletion_requests_approval_separation_check
    CHECK (
      approved_by_user_id IS NULL OR
      requested_by_user_id IS NULL OR
      approved_by_user_id <> requested_by_user_id
    ),
  CONSTRAINT gem_verify_deletion_requests_rejection_separation_check
    CHECK (
      rejected_by_user_id IS NULL OR
      requested_by_user_id IS NULL OR
      rejected_by_user_id <> requested_by_user_id
    )
);

ALTER TABLE public.gem_verify_evidence_deletion_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.gem_verify_evidence_deletion_requests FROM anon, authenticated;

CREATE UNIQUE INDEX IF NOT EXISTS gem_verify_deletion_requests_one_active_idx
  ON public.gem_verify_evidence_deletion_requests (evidence_id)
  WHERE status IN ('requested','approved');

CREATE INDEX IF NOT EXISTS gem_verify_deletion_requests_status_requested_idx
  ON public.gem_verify_evidence_deletion_requests (status, requested_at ASC);

CREATE INDEX IF NOT EXISTS gem_verify_deletion_requests_requester_idx
  ON public.gem_verify_evidence_deletion_requests (requested_by_user_id)
  WHERE requested_by_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS gem_verify_deletion_requests_approver_idx
  ON public.gem_verify_evidence_deletion_requests (approved_by_user_id)
  WHERE approved_by_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS gem_verify_deletion_requests_rejector_idx
  ON public.gem_verify_evidence_deletion_requests (rejected_by_user_id)
  WHERE rejected_by_user_id IS NOT NULL;

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
    'deletion_approved',
    'deletion_rejected',
    'deletion_execution_blocked',
    'deleted'
  ));
