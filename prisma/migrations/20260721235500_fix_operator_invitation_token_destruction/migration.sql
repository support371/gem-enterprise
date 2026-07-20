create or replace function public.gem_consume_operator_invitation(
  p_token_hash text,
  p_password_hash text,
  p_first_name text default null,
  p_last_name text default null
)
returns table(ok boolean, user_id text, email text, role text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  invitation public.gem_operator_invitations%rowtype;
  new_user_id text;
  normalized_first_name text;
  normalized_last_name text;
begin
  if p_token_hash is null or length(p_token_hash) <> 64 then
    return query select false, null::text, null::text, null::text;
    return;
  end if;

  if p_password_hash is null or length(p_password_hash) < 50 or p_password_hash not like '$2%' then
    return query select false, null::text, null::text, null::text;
    return;
  end if;

  normalized_first_name := nullif(left(trim(coalesce(p_first_name, '')), 80), '');
  normalized_last_name := nullif(left(trim(coalesce(p_last_name, '')), 80), '');

  select gi.* into invitation
  from public.gem_operator_invitations gi
  where gi.token_hash = p_token_hash
    and gi.used_at is null
    and gi.revoked_at is null
    and gi.expires_at > now()
  for update;

  if not found then
    return query select false, null::text, null::text, null::text;
    return;
  end if;

  if invitation.role not in ('analyst'::public."UserRole", 'admin'::public."UserRole") then
    return query select false, null::text, null::text, null::text;
    return;
  end if;

  if exists (
    select 1
    from public.users existing_user
    where lower(existing_user.email) = lower(invitation.email)
  ) then
    update public.gem_operator_invitations gi
    set revoked_at = now(),
        metadata = gi.metadata || jsonb_build_object('reason', 'email_already_registered')
    where gi.id = invitation.id;
    return query select false, null::text, null::text, null::text;
    return;
  end if;

  new_user_id := gen_random_uuid()::text;

  insert into public.users (
    id, email, "passwordHash", role, status, "isActive", "isEmailVerified", "createdAt", "updatedAt", "sessionVersion"
  ) values (
    new_user_id,
    lower(invitation.email),
    p_password_hash,
    invitation.role,
    'active'::public."UserStatus",
    true,
    true,
    now(),
    now(),
    0
  );

  insert into public.user_profiles (
    id, "userId", "firstName", "lastName", "displayName", preferences, "updatedAt"
  ) values (
    gen_random_uuid()::text,
    new_user_id,
    normalized_first_name,
    normalized_last_name,
    nullif(trim(concat_ws(' ', normalized_first_name, normalized_last_name)), ''),
    jsonb_build_object(
      'operatorInvitationId', invitation.id,
      'operatorIdentityVerifiedByAdmin', true
    ),
    now()
  );

  update public.gem_operator_invitations gi
  set used_at = now(),
      token_hash = encode(
        extensions.digest(
          convert_to(gi.token_hash || ':' || gen_random_uuid()::text, 'UTF8'),
          'sha256'
        ),
        'hex'
      )
  where gi.id = invitation.id;

  insert into public.audit_logs (
    id, "userId", action, resource, "resourceId", metadata, "createdAt"
  ) values (
    gen_random_uuid()::text,
    new_user_id,
    'account_created',
    'user',
    new_user_id,
    jsonb_build_object(
      'flow', 'one_time_operator_invitation',
      'invitationId', invitation.id,
      'role', invitation.role,
      'invitedByUserId', invitation.created_by_user_id,
      'emailVerificationMethod', 'administrator_controlled_invitation'
    ),
    now()
  );

  return query select true, new_user_id, lower(invitation.email), invitation.role::text;
end;
$$;

revoke all on function public.gem_consume_operator_invitation(text, text, text, text) from public, authenticated;
grant execute on function public.gem_consume_operator_invitation(text, text, text, text) to anon, service_role;
