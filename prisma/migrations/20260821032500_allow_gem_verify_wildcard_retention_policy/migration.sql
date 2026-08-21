-- Keep GEM Verify retention-policy validation aligned with the evidence gateway,
-- which supports a standalone '*' fallback policy. This does not create or
-- activate a policy; it only permits administrators to draft one.

CREATE OR REPLACE FUNCTION public.gem_verify_create_retention_policy(
  p_actor_user_id text,
  p_document_type text,
  p_policy_name text,
  p_purpose text,
  p_retention_days integer,
  p_legal_basis text,
  p_jurisdiction text DEFAULT NULL::text,
  p_review_due_at timestamp with time zone DEFAULT NULL::timestamp with time zone
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role text;
  v_document_type text;
  v_next_version integer;
  v_policy public.gem_verify_retention_policies%ROWTYPE;
BEGIN
  SELECT role::text INTO v_role
  FROM public.users
  WHERE id = p_actor_user_id
    AND "isActive" = true
    AND status = 'active';

  IF v_role IS NULL OR v_role NOT IN ('admin','super_admin','internal') THEN
    RAISE EXCEPTION 'FORBIDDEN:Administrator access is required';
  END IF;

  v_document_type := lower(regexp_replace(trim(p_document_type), '[ -]+', '_', 'g'));
  IF v_document_type <> '*' AND v_document_type !~ '^[a-z0-9_][a-z0-9_*_-]{1,79}$' THEN
    RAISE EXCEPTION 'INVALID_DOCUMENT_TYPE:Document type is invalid';
  END IF;
  IF char_length(trim(p_policy_name)) < 3 OR char_length(trim(p_policy_name)) > 120 THEN
    RAISE EXCEPTION 'INVALID_POLICY_NAME:Policy name is invalid';
  END IF;
  IF char_length(trim(p_purpose)) < 10 OR char_length(trim(p_purpose)) > 1000 THEN
    RAISE EXCEPTION 'INVALID_PURPOSE:Policy purpose is invalid';
  END IF;
  IF p_retention_days < 1 OR p_retention_days > 3650 THEN
    RAISE EXCEPTION 'INVALID_RETENTION_DAYS:Retention days are invalid';
  END IF;
  IF char_length(trim(p_legal_basis)) < 10 OR char_length(trim(p_legal_basis)) > 1000 THEN
    RAISE EXCEPTION 'INVALID_LEGAL_BASIS:Legal basis is invalid';
  END IF;
  IF p_review_due_at IS NOT NULL AND p_review_due_at <= now() THEN
    RAISE EXCEPTION 'INVALID_REVIEW_DATE:Policy review date must be in the future';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('gem-verify-retention:' || v_document_type));

  SELECT COALESCE(max(version), 0) + 1 INTO v_next_version
  FROM public.gem_verify_retention_policies
  WHERE lower(document_type) = v_document_type;

  INSERT INTO public.gem_verify_retention_policies (
    document_type,
    version,
    policy_name,
    purpose,
    retention_days,
    legal_basis,
    jurisdiction,
    status,
    is_active,
    created_by_user_id,
    review_due_at
  ) VALUES (
    v_document_type,
    v_next_version,
    trim(p_policy_name),
    trim(p_purpose),
    p_retention_days,
    trim(p_legal_basis),
    nullif(trim(p_jurisdiction), ''),
    'draft',
    false,
    p_actor_user_id,
    p_review_due_at
  ) RETURNING * INTO v_policy;

  INSERT INTO public.gem_verify_retention_policy_events (
    policy_id, actor_user_id, action, to_status, metadata
  ) VALUES (
    v_policy.id,
    p_actor_user_id,
    'created',
    'draft',
    jsonb_build_object(
      'documentType', v_document_type,
      'version', v_next_version,
      'gateway', 'supabase_edge'
    )
  );

  RETURN jsonb_build_object(
    'policy', to_jsonb(v_policy),
    'viewerRole', v_role,
    'activated', false,
    'nextAction', 'submit_for_independent_approval'
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.gem_verify_create_retention_policy(
  text,text,text,text,integer,text,text,timestamptz
) FROM PUBLIC, anon, authenticated;
