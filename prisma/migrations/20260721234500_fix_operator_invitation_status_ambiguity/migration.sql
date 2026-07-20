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

  select gi.* into invitation
  from public.gem_operator_invitations gi
  where gi.token_hash = p_token_hash
    and gi.used_at is null
    and gi.revoked_at is null
    and gi.expires_at > now();

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

revoke all on function public.gem_operator_invitation_status(text) from public, authenticated;
grant execute on function public.gem_operator_invitation_status(text) to anon, service_role;
