-- Recovery readiness watch HTTP tracking.
-- Applying this migration to production remains an explicit owner-approved action.
-- The hourly pg_cron schedules are created separately from the reviewed runbook.

CREATE TABLE IF NOT EXISTS public.gem_recovery_watch_http_runs (
  request_id bigint PRIMARY KEY,
  requested_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON TABLE public.gem_recovery_watch_http_runs
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.gem_recovery_watch_assert_latest_http_result()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  latest_request public.gem_recovery_watch_http_runs%ROWTYPE;
  response_status integer;
  response_error text;
BEGIN
  SELECT * INTO latest_request
  FROM public.gem_recovery_watch_http_runs
  ORDER BY requested_at DESC
  LIMIT 1;

  IF latest_request.request_id IS NULL THEN
    RAISE EXCEPTION 'No recovery-watch pg_net request has been recorded';
  END IF;

  SELECT status_code, error_msg
  INTO response_status, response_error
  FROM net._http_response
  WHERE id = latest_request.request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pg_net response for recovery-watch request %',
      latest_request.request_id;
  END IF;

  IF response_status IS NULL OR response_error IS NOT NULL THEN
    RAISE EXCEPTION 'Recovery-watch request % failed before an HTTP response: %',
      latest_request.request_id,
      coalesce(response_error, 'missing status code');
  END IF;

  IF response_status < 200 OR response_status >= 300 THEN
    RAISE EXCEPTION 'Recovery-watch request % returned HTTP %',
      latest_request.request_id,
      response_status;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.gem_recovery_watch_assert_latest_http_result()
  FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.gem_recovery_watch_http_runs IS
  'Private request-id ledger for the canonical recovery readiness pg_net monitor.';

COMMENT ON FUNCTION public.gem_recovery_watch_assert_latest_http_result() IS
  'Fails the delayed cron checker when the latest recovery-watch pg_net request is missing, transport-failed, or non-2xx.';
