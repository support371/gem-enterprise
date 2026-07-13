-- Release 3 post-migration hardening.
-- These SECURITY DEFINER functions exist only as database trigger handlers.
-- They must not be callable directly through PostgREST by public API roles.

REVOKE ALL ON FUNCTION public.gem_increment_session_version_on_password_change()
  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gem_increment_session_version_on_password_change()
  FROM anon;
REVOKE ALL ON FUNCTION public.gem_increment_session_version_on_password_change()
  FROM authenticated;

REVOKE ALL ON FUNCTION public.gem_audit_session_revocation_on_password_change()
  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gem_audit_session_revocation_on_password_change()
  FROM anon;
REVOKE ALL ON FUNCTION public.gem_audit_session_revocation_on_password_change()
  FROM authenticated;
