create table if not exists public.gem_operator_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public."UserRole" not null,
  first_name text,
  last_name text,
  token_hash text not null unique,
  created_by_user_id text not null references public.users(id) on delete restrict,
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint gem_operator_invitations_role_check check (role in ('analyst'::public."UserRole", 'admin'::public."UserRole")),
  constraint gem_operator_invitations_token_hash_check check (length(token_hash) = 64)
);

create index if not exists gem_operator_invitations_email_idx
  on public.gem_operator_invitations (lower(email), created_at desc);
create index if not exists gem_operator_invitations_creator_idx
  on public.gem_operator_invitations (created_by_user_id, created_at desc);
create index if not exists gem_operator_invitations_expiry_idx
  on public.gem_operator_invitations (expires_at)
  where used_at is null and revoked_at is null;

alter table public.gem_operator_invitations enable row level security;

create or replace function public.gem_operator_invitation_status(
  p_token_hash text
)
returns table(
  valid boolean,
  masked_email text,
  invited_role text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.gem_operator_invitations%rowtype;
  local_part text;
  domain_part text;
begin
  if p_token_hash is null or length(p_token_hash) <> 64 then
    return query select false, null::text, null::text, null::timestamptz;
    return;
  end if;

  select * into invitation
  from public.gem_operator_invitations
  where token_hash = p_token_hash
    and used_at is null
    and revoked_at is null
    and expires_at > now();

  if not found then
    return query select false, null::text, null::text, null::timestamptz;
    return;
  end if;

  local_part := split_part(invitation.email, '@', 1);
  domain_part := split_part(invitation.email, '@', 2);

  return query select
    true,
    case
      when length(local_part) <= 2 then left(local_part, 1) || '***@' || domain_part
      else left(local_part, 2) || repeat('*', greatest(3, length(local_part) - 2)) || '@' || domain_part
    end,
    invitation.role::text,
    invitation.expires_at;
end;
$$;

create or replace function public.gem_consume_operator_invitation(
  p_token_hash text,
  p_password_hash text,
  p_first_name text default null,
  p_last_name text default null
)
returns table(ok boolean, user_id text, email text, role text)
language plpgsql
security definer
set search_path = public
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

  select * into invitation
  from public.gem_operator_invitations
  where token_hash = p_token_hash
    and used_at is null
    and revoked_at is null
    and expires_at > now()
  for update;

  if not found then
    return query select false, null::text, null::text, null::text;
    return;
  end if;

  if invitation.role not in ('analyst'::public."UserRole", 'admin'::public."UserRole") then
    return query select false, null::text, null::text, null::text;
    return;
  end if;

  if exists (select 1 from public.users where lower(email) = lower(invitation.email)) then
    update public.gem_operator_invitations
    set revoked_at = now(), metadata = metadata || jsonb_build_object('reason', 'email_already_registered')
    where id = invitation.id;
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

  update public.gem_operator_invitations
  set used_at = now(), token_hash = encode(digest(token_hash || ':' || gen_random_uuid()::text, 'sha256'), 'hex')
  where id = invitation.id;

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

revoke all on table public.gem_operator_invitations from public, anon, authenticated;
revoke all on function public.gem_operator_invitation_status(text) from public, authenticated;
revoke all on function public.gem_consume_operator_invitation(text, text, text, text) from public, authenticated;
grant execute on function public.gem_operator_invitation_status(text) to anon, service_role;
grant execute on function public.gem_consume_operator_invitation(text, text, text, text) to anon, service_role;

comment on table public.gem_operator_invitations is 'High-entropy, short-lived, one-time capabilities for onboarding GEM Verify analyst and administrator operators.';
comment on function public.gem_consume_operator_invitation(text, text, text, text) is 'Atomically consumes an operator invitation using only a SHA-256 capability digest and bcrypt password hash; no plaintext credential is accepted or stored.';
