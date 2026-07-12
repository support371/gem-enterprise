-- Atomically consume a one-time administrator setup token.
-- The application sends only a SHA-256 token digest and bcrypt password hash.
-- Plaintext credentials are never accepted by this function.

create or replace function public.gem_consume_admin_access_token(
  p_token_hash text,
  p_password_hash text
)
returns table(ok boolean, user_id text, email text)
language plpgsql
security definer
set search_path = public
as $$
declare
  token_row public.admin_access_tokens%rowtype;
  user_row public.users%rowtype;
begin
  if p_token_hash is null or length(p_token_hash) <> 64 then
    return query select false, null::text, null::text;
    return;
  end if;

  if p_password_hash is null or length(p_password_hash) < 50 or p_password_hash not like '$2%' then
    return query select false, null::text, null::text;
    return;
  end if;

  select * into token_row
  from public.admin_access_tokens
  where token_hash = p_token_hash
    and used_at is null
    and expires_at > now()
  for update;

  if not found then
    return query select false, null::text, null::text;
    return;
  end if;

  select * into user_row
  from public.users
  where id = token_row.user_id
  for update;

  if not found
     or user_row.email <> 'admin@gemcybersecurityassist.com'
     or user_row.role not in ('admin','super_admin','internal')
     or user_row.status <> 'active'
     or not user_row."isActive"
     or not user_row."isEmailVerified" then
    return query select false, null::text, null::text;
    return;
  end if;

  update public.users
  set "passwordHash" = p_password_hash,
      "updatedAt" = now()
  where id = user_row.id;

  update public.admin_access_tokens
  set used_at = now(),
      run_secret = null
  where id = token_row.id;

  delete from public.admin_access_tokens
  where user_id = user_row.id
    and id <> token_row.id;

  insert into public.audit_logs (
    id,
    "userId",
    action,
    resource,
    "resourceId",
    metadata,
    "createdAt"
  ) values (
    gen_random_uuid()::text,
    user_row.id,
    'password_change',
    'user',
    user_row.id,
    jsonb_build_object(
      'flow', 'one_time_admin_access',
      'tokenId', token_row.id
    ),
    now()
  );

  return query select true, user_row.id, user_row.email;
end;
$$;

revoke all on function public.gem_consume_admin_access_token(text, text)
from public, authenticated;
grant execute on function public.gem_consume_admin_access_token(text, text)
to anon, service_role;

comment on function public.gem_consume_admin_access_token(text, text) is
'Atomically consumes an unexpired high-entropy administrator access token and stores a precomputed bcrypt password hash. The function never accepts plaintext credentials and returns no password or token data.';
