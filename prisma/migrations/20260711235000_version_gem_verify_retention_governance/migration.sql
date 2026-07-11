-- Versioned governance for GEM Verify retention policies.
-- No policy is activated by this migration and no evidence is deleted.

ALTER TABLE public.gem_verify_retention_policies
  DROP CONSTRAINT IF EXISTS gem_verify_retention_policies_document_type_key;

ALTER TABLE public.gem_verify_retention_policies
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS policy_name text,
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS approved_by_user_id text,
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS rejected_by_user_id text,
  ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS effective_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS superseded_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS review_due_at timestamp with time zone;

UPDATE public.gem_verify_retention_policies
SET status = CASE WHEN is_active THEN 'approved' ELSE 'draft' END,
    effective_at = CASE WHEN is_active THEN COALESCE(effective_at, created_at) ELSE effective_at END
WHERE status NOT IN ('draft','pending_approval','approved','rejected','superseded');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gem_verify_retention_policies_status_check'
  ) THEN
    ALTER TABLE public.gem_verify_retention_policies
      ADD CONSTRAINT gem_verify_retention_policies_status_check
      CHECK (status IN ('draft','pending_approval','approved','rejected','superseded'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gem_verify_retention_policies_version_check'
  ) THEN
    ALTER TABLE public.gem_verify_retention_policies
      ADD CONSTRAINT gem_verify_retention_policies_version_check
      CHECK (version > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gem_verify_retention_policies_separation_check'
  ) THEN
    ALTER TABLE public.gem_verify_retention_policies
      ADD CONSTRAINT gem_verify_retention_policies_separation_check
      CHECK (
        approved_by_user_id IS NULL OR
        created_by_user_id IS NULL OR
        approved_by_user_id <> created_by_user_id
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gem_verify_retention_policies_approver_fk'
  ) THEN
    ALTER TABLE public.gem_verify_retention_policies
      ADD CONSTRAINT gem_verify_retention_policies_approver_fk
      FOREIGN KEY (approved_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gem_verify_retention_policies_rejector_fk'
  ) THEN
    ALTER TABLE public.gem_verify_retention_policies
      ADD CONSTRAINT gem_verify_retention_policies_rejector_fk
      FOREIGN KEY (rejected_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS gem_verify_retention_policy_version_key
  ON public.gem_verify_retention_policies (lower(document_type), version);

CREATE UNIQUE INDEX IF NOT EXISTS gem_verify_retention_policy_one_active_key
  ON public.gem_verify_retention_policies (lower(document_type))
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS gem_verify_retention_policy_status_idx
  ON public.gem_verify_retention_policies (status, document_type, version DESC);

CREATE INDEX IF NOT EXISTS gem_verify_retention_policy_approver_idx
  ON public.gem_verify_retention_policies (approved_by_user_id)
  WHERE approved_by_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS gem_verify_retention_policy_rejector_idx
  ON public.gem_verify_retention_policies (rejected_by_user_id)
  WHERE rejected_by_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.gem_verify_retention_policy_events (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  policy_id text NOT NULL,
  actor_user_id text,
  action text NOT NULL,
  from_status text,
  to_status text,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT gem_verify_retention_policy_events_policy_fk
    FOREIGN KEY (policy_id)
    REFERENCES public.gem_verify_retention_policies(id)
    ON DELETE CASCADE,
  CONSTRAINT gem_verify_retention_policy_events_actor_fk
    FOREIGN KEY (actor_user_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL,
  CONSTRAINT gem_verify_retention_policy_events_action_check
    CHECK (action IN ('created','submitted','approved','rejected','superseded','deactivated'))
);

ALTER TABLE public.gem_verify_retention_policy_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.gem_verify_retention_policy_events FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS gem_verify_retention_policy_events_policy_created_idx
  ON public.gem_verify_retention_policy_events (policy_id, created_at DESC);

CREATE INDEX IF NOT EXISTS gem_verify_retention_policy_events_actor_created_idx
  ON public.gem_verify_retention_policy_events (actor_user_id, created_at DESC)
  WHERE actor_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.gem_verify_block_retention_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'GEM Verify retention policy events are append-only';
END;
$$;

REVOKE ALL ON FUNCTION public.gem_verify_block_retention_event_mutation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS gem_verify_retention_events_append_only
  ON public.gem_verify_retention_policy_events;
CREATE TRIGGER gem_verify_retention_events_append_only
BEFORE UPDATE OR DELETE ON public.gem_verify_retention_policy_events
FOR EACH ROW EXECUTE FUNCTION public.gem_verify_block_retention_event_mutation();
