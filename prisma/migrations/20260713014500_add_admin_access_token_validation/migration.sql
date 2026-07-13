CREATE OR REPLACE FUNCTION public.gem_validate_admin_access_token(
  p_token_hash text
)
RETURNS TABLE(
  valid boolean,
  expires_at timestamptz,
  request_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  token_row public.admin_access_tokens%rowtype;
BEGIN
  IF p_token_hash IS NULL OR length(p_token_hash) <> 64 THEN
    RETURN QUERY SELECT false, NULL::timestamptz, NULL::text;
    RETURN;
  END IF;

  SELECT token.* INTO token_row
  FROM public.admin_access_tokens token
  JOIN public.users account ON account.id = token.user_id
  WHERE token.token_hash = p_token_hash
    AND token.used_at IS NULL
    AND token.expires_at > now()
    AND account.email = 'admin@gemcybersecurityassist.com'
    AND account.role IN ('admin', 'super_admin', 'internal')
    AND account.status = 'active'
    AND account."isActive" = true
    AND account."isEmailVerified" = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::timestamptz, NULL::text;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, token_row.expires_at, token_row.request_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.gem_validate_admin_access_token(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gem_validate_admin_access_token(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.gem_validate_admin_access_token(text) TO anon;
