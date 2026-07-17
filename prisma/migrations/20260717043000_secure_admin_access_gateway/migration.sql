-- Route one-time administrator password setup through a controlled Edge Function.
-- The atomic mutation remains a SECURITY DEFINER function, but only service_role may
-- execute it. The browser-supplied capability hash and request ID must match the same
-- active authorization row before the owner password can change.

CREATE OR REPLACE FUNCTION public.gem_consume_admin_access_token_v2(
  p_token_hash text,
  p_request_id text,
  p_password_hash text
)
RETURNS TABLE(ok boolean, user_id text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  token_row public.admin_access_tokens%rowtype;
  user_row public.users%rowtype;
BEGIN
  IF p_token_hash IS NULL OR p_token_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  IF p_request_id IS NULL OR p_request_id !~ '^aar_[a-f0-9]{32}$' THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  IF p_password_hash IS NULL
     OR length(p_password_hash) <> 60
     OR p_password_hash !~ '^\$2[aby]\$' THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  SELECT token.* INTO token_row
  FROM public.admin_access_tokens token
  WHERE token.token_hash = p_token_hash
    AND token.request_id = p_request_id
    AND token.used_at IS NULL
    AND token.expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  SELECT account.* INTO user_row
  FROM public.users account
  WHERE account.id = token_row.user_id
  FOR UPDATE;

  IF NOT FOUND
     OR user_row.email <> 'admin@gemcybersecurityassist.com'
     OR user_row.role NOT IN ('admin', 'super_admin', 'internal')
     OR user_row.status <> 'active'
     OR NOT user_row."isActive"
     OR NOT user_row."isEmailVerified" THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  UPDATE public.users
  SET "passwordHash" = p_password_hash,
      "updatedAt" = now()
  WHERE id = user_row.id;

  UPDATE public.admin_access_tokens
  SET used_at = now(),
      run_secret = NULL
  WHERE id = token_row.id;

  DELETE FROM public.admin_access_tokens
  WHERE user_id = user_row.id
    AND id <> token_row.id;

  INSERT INTO public.audit_logs (
    id,
    "userId",
    action,
    resource,
    "resourceId",
    metadata,
    "createdAt"
  ) VALUES (
    gen_random_uuid()::text,
    user_row.id,
    'password_change',
    'user',
    user_row.id,
    jsonb_build_object(
      'flow', 'one_time_admin_access_v2',
      'boundary', 'gem-admin-access-gateway',
      'tokenId', token_row.id,
      'requestId', token_row.request_id
    ),
    now()
  );

  RETURN QUERY SELECT true, user_row.id, user_row.email;
END;
$function$;

REVOKE ALL ON FUNCTION public.gem_consume_admin_access_token_v2(text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gem_consume_admin_access_token_v2(text, text, text)
  TO service_role;
