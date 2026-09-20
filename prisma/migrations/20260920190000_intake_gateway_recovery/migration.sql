CREATE OR REPLACE FUNCTION public.gem_create_public_intake(
  p_id text, p_event_id text, p_public_id text, p_kind "IntakeKind",
  p_queue text, p_user_id text, p_product_slug text, p_product_name text,
  p_product_sku text, p_product_category text, p_name text, p_email text,
  p_phone text, p_organization text, p_title text, p_jurisdiction text,
  p_subject text, p_message text, p_payload jsonb, p_consent_version text,
  p_privacy_version text, p_source text, p_ip_hash text, p_user_agent_hash text,
  p_now timestamptz
)
RETURNS SETOF public.intake_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_user_id text;
BEGIN
  SELECT id INTO resolved_user_id
  FROM public.users
  WHERE id = p_user_id
  LIMIT 1;

  INSERT INTO public.intake_submissions (
    id, public_id, kind, status, queue, user_id,
    product_slug, product_name, product_sku, product_category,
    name, email, phone, organization, title, jurisdiction,
    subject, message, payload, consent_version, consent_given_at,
    privacy_version, privacy_accepted_at, source, ip_hash,
    user_agent_hash, created_at, updated_at
  ) VALUES (
    p_id, p_public_id, p_kind, 'RECEIVED', p_queue, resolved_user_id,
    p_product_slug, p_product_name, p_product_sku, p_product_category,
    p_name, p_email, p_phone, p_organization, p_title, p_jurisdiction,
    p_subject, p_message, COALESCE(p_payload, '{}'::jsonb), p_consent_version, p_now,
    p_privacy_version, p_now, p_source, p_ip_hash,
    p_user_agent_hash, p_now, p_now
  );

  INSERT INTO public.intake_status_events (
    id, submission_id, from_status, to_status, actor_id,
    reason, metadata, created_at
  ) VALUES (
    p_event_id, p_id, NULL, 'RECEIVED', resolved_user_id,
    'Public submission recorded',
    jsonb_build_object('source', p_source, 'queue', p_queue),
    p_now
  );

  RETURN QUERY
  SELECT * FROM public.intake_submissions WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.gem_create_public_intake(
  text,text,text,"IntakeKind",text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,timestamptz
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.gem_create_public_intake(
  text,text,text,"IntakeKind",text,text,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,text,text,text,text,text,timestamptz
) TO service_role;
