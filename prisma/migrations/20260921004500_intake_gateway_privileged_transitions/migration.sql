CREATE OR REPLACE FUNCTION public.gem_transition_intake(
  p_id text,
  p_event_id text,
  p_expected_status text,
  p_next_status text,
  p_actor_id text,
  p_reason text,
  p_metadata jsonb,
  p_assignment_supplied boolean,
  p_assigned_to_id text,
  p_now timestamptz
)
RETURNS TABLE(outcome text, current_status text, submission jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_status "IntakeSubmissionStatus";
  next_status "IntakeSubmissionStatus";
  resolved_actor_id text;
  resolved_assigned_to_id text;
BEGIN
  SELECT status INTO existing_status
  FROM public.intake_submissions
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'not_found'::text, NULL::text, NULL::jsonb;
    RETURN;
  END IF;

  IF existing_status::text <> p_expected_status THEN
    RETURN QUERY
    SELECT 'conflict'::text, existing_status::text, NULL::jsonb;
    RETURN;
  END IF;

  BEGIN
    next_status := p_next_status::"IntakeSubmissionStatus";
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN QUERY
    SELECT 'invalid_transition'::text, existing_status::text, NULL::jsonb;
    RETURN;
  END;

  IF NOT (
    (existing_status = 'RECEIVED' AND next_status IN ('TRIAGE', 'CLOSED')) OR
    (existing_status = 'TRIAGE' AND next_status IN ('NEEDS_INFORMATION', 'QUALIFIED', 'DECLINED', 'CLOSED')) OR
    (existing_status = 'NEEDS_INFORMATION' AND next_status IN ('TRIAGE', 'DECLINED', 'CLOSED')) OR
    (existing_status = 'QUALIFIED' AND next_status IN ('NEEDS_INFORMATION', 'APPROVED', 'DECLINED', 'CLOSED')) OR
    (existing_status = 'APPROVED' AND next_status IN ('CONVERTED', 'CLOSED')) OR
    (existing_status = 'DECLINED' AND next_status = 'CLOSED') OR
    (existing_status = 'CONVERTED' AND next_status = 'CLOSED')
  ) THEN
    RETURN QUERY
    SELECT 'invalid_transition'::text, existing_status::text, NULL::jsonb;
    RETURN;
  END IF;

  SELECT id INTO resolved_actor_id
  FROM public.users
  WHERE id = p_actor_id
  LIMIT 1;

  IF p_assignment_supplied THEN
    SELECT id INTO resolved_assigned_to_id
    FROM public.users
    WHERE id = p_assigned_to_id
    LIMIT 1;
  END IF;

  UPDATE public.intake_submissions
  SET
    status = next_status,
    assigned_to_id = CASE
      WHEN p_assignment_supplied THEN resolved_assigned_to_id
      ELSE assigned_to_id
    END,
    updated_at = p_now
  WHERE id = p_id;

  INSERT INTO public.intake_status_events (
    id,
    submission_id,
    from_status,
    to_status,
    actor_id,
    reason,
    metadata,
    created_at
  ) VALUES (
    p_event_id,
    p_id,
    existing_status,
    next_status,
    resolved_actor_id,
    p_reason,
    COALESCE(p_metadata, '{}'::jsonb) ||
      jsonb_build_object(
        'gatewayActorId', p_actor_id,
        'assignmentSupplied', p_assignment_supplied,
        'requestedAssignedToId', p_assigned_to_id
      ),
    p_now
  );

  RETURN QUERY
  SELECT 'updated'::text, next_status::text, to_jsonb(s)
  FROM public.intake_submissions s
  WHERE s.id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.gem_transition_intake(
  text,text,text,text,text,text,jsonb,boolean,text,timestamptz
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.gem_transition_intake(
  text,text,text,text,text,text,jsonb,boolean,text,timestamptz
) TO service_role;
