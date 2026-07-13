-- Release 3: canonical password recovery and complete session revocation.
-- Additive user field plus replacement of the existing protected administrator
-- password-consumption RPC. No existing password, token, or session data is exposed.

ALTER TABLE "users"
  ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.gem_consume_admin_access_token(
  p_token_hash text,
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
  next_session_version integer;
BEGIN
  IF p_token_hash IS NULL OR length(p_token_hash) <> 64 THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  IF p_password_hash IS NULL OR length(p_password_hash) < 50 OR p_password_hash NOT LIKE '$2%' THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  SELECT * INTO token_row
  FROM public.admin_access_tokens
  WHERE token_hash = p_token_hash
    AND used_at IS NULL
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  SELECT * INTO user_row
  FROM public.users
  WHERE id = token_row.user_id
  FOR UPDATE;

  IF NOT FOUND
     OR user_row.email <> 'admin@gemcybersecurityassist.com'
     OR user_row.role NOT IN ('admin','super_admin','internal')
     OR user_row.status <> 'active'
     OR NOT user_row."isActive"
     OR NOT user_row."isEmailVerified" THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text;
    RETURN;
  END IF;

  next_session_version := user_row."sessionVersion" + 1;

  UPDATE public.users
  SET "passwordHash" = p_password_hash,
      "sessionVersion" = next_session_version,
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
      'flow', 'one_time_admin_access',
      'tokenId', token_row.id,
      'sessionsRevoked', true,
      'sessionVersion', next_session_version
    ),
    now()
  );

  RETURN QUERY SELECT true, user_row.id, user_row.email;
END;
$function$;
