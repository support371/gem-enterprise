-- Release 3: canonical password recovery and complete session revocation.
-- The session version is incremented by database triggers whenever a password hash
-- changes. This covers direct resets, Supabase recovery, and the existing protected
-- administrator recovery RPC without replacing credential-changing logic.

ALTER TABLE "users"
  ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.gem_increment_session_version_on_password_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD."passwordHash" IS DISTINCT FROM NEW."passwordHash" THEN
    NEW."sessionVersion" := OLD."sessionVersion" + 1;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS gem_increment_session_version_on_password_change ON public.users;
CREATE TRIGGER gem_increment_session_version_on_password_change
BEFORE UPDATE OF "passwordHash" ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.gem_increment_session_version_on_password_change();

CREATE OR REPLACE FUNCTION public.gem_audit_session_revocation_on_password_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD."passwordHash" IS DISTINCT FROM NEW."passwordHash" THEN
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
      NEW.id,
      'password_change',
      'user',
      NEW.id,
      jsonb_build_object(
        'flow', 'database_password_change_trigger',
        'sessionsRevoked', true,
        'previousSessionVersion', OLD."sessionVersion",
        'sessionVersion', NEW."sessionVersion"
      ),
      now()
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS gem_audit_session_revocation_on_password_change ON public.users;
CREATE TRIGGER gem_audit_session_revocation_on_password_change
AFTER UPDATE OF "passwordHash" ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.gem_audit_session_revocation_on_password_change();
