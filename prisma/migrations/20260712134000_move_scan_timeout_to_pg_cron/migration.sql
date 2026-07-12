-- Move GEM Verify stale scan enforcement into Supabase PostgreSQL.
-- This removes the Vercel cron dependency while preserving fail-closed behavior.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.gem_verify_fail_closed_stale_scans(
  p_max_jobs integer DEFAULT 25,
  p_stale_minutes integer DEFAULT 20
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job record;
  processed integer := 0;
  effective_max_jobs integer := GREATEST(1, LEAST(COALESCE(p_max_jobs, 25), 100));
  effective_stale_minutes integer := GREATEST(5, LEAST(COALESCE(p_stale_minutes, 20), 1440));
BEGIN
  FOR job IN
    SELECT s.id, s.evidence_id
    FROM public.gem_verify_evidence_scan_jobs s
    JOIN public.gem_verify_evidence_items e
      ON e.id = s.evidence_id
     AND e.scan_job_id = s.id
    WHERE s.status IN ('queued','submitted','running')
      AND COALESCE(s.started_at, s.requested_at) <
          now() - make_interval(mins => effective_stale_minutes)
    ORDER BY COALESCE(s.started_at, s.requested_at)
    FOR UPDATE OF s SKIP LOCKED
    LIMIT effective_max_jobs
  LOOP
    UPDATE public.gem_verify_evidence_scan_jobs
    SET status = 'error',
        last_error = 'scan_timeout',
        completed_at = now(),
        updated_at = now(),
        response_payload = response_payload || jsonb_build_object(
          'status', 'error',
          'reason', 'scan_timeout',
          'scheduler', 'supabase_pg_cron'
        )
    WHERE id = job.id
      AND status IN ('queued','submitted','running');

    IF FOUND THEN
      UPDATE public.gem_verify_evidence_items
      SET status = 'quarantined',
          quarantine_status = 'manual_hold',
          validation_status = 'needs_information',
          scan_completed_at = now(),
          scan_result = scan_result || jsonb_build_object(
            'status', 'error',
            'reason', 'scan_timeout',
            'scheduler', 'supabase_pg_cron'
          ),
          updated_at = now()
      WHERE id = job.evidence_id
        AND scan_job_id = job.id
        AND status = 'quarantined';

      INSERT INTO public.gem_verify_evidence_validations (
        evidence_id,
        check_type,
        status,
        details
      ) VALUES (
        job.evidence_id,
        'file_safety_scan_timeout',
        'manual_review',
        jsonb_build_object(
          'scanJobId', job.id,
          'timeoutMinutes', effective_stale_minutes,
          'scheduler', 'supabase_pg_cron'
        )
      );

      INSERT INTO public.gem_verify_evidence_access_events (
        evidence_id,
        action,
        purpose,
        result,
        metadata
      ) VALUES (
        job.evidence_id,
        'quarantine_changed',
        'scanner_timeout_fail_closed',
        'manual_hold',
        jsonb_build_object(
          'scanJobId', job.id,
          'timeoutMinutes', effective_stale_minutes,
          'scheduler', 'supabase_pg_cron'
        )
      );

      processed := processed + 1;
    END IF;
  END LOOP;

  RETURN processed;
END;
$$;

REVOKE ALL ON FUNCTION public.gem_verify_fail_closed_stale_scans(integer, integer)
  FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  existing_job_id bigint;
BEGIN
  SELECT jobid INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'gem_verify_stale_scan_fail_closed'
  LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'gem_verify_stale_scan_fail_closed',
    '*/10 * * * *',
    'SELECT public.gem_verify_fail_closed_stale_scans(25, 20);'
  );
END;
$$;
