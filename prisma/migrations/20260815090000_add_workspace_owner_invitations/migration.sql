create table if not exists public.gem_workspace_owner_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  last_name text,
  organization_name text not null,
  organization_slug text not null,
  workspace_name text not null,
  workspace_slug text not null,
  project_name text,
  project_slug text,
  project_summary text,
  token_hash text not null unique,
  created_by_user_id text not null references public.users(id) on delete restrict,
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint gem_workspace_owner_invitations_token_hash_check check (length(token_hash) = 64),
  constraint gem_workspace_owner_invitations_email_check check (length(email) between 3 and 254),
  constraint gem_workspace_owner_invitations_organization_check check (length(organization_name) between 2 and 120),
  constraint gem_workspace_owner_invitations_workspace_check check (length(workspace_name) between 2 and 120)
);

create index if not exists gem_workspace_owner_invitations_email_idx
  on public.gem_workspace_owner_invitations (lower(email), created_at desc);
create index if not exists gem_workspace_owner_invitations_creator_idx
  on public.gem_workspace_owner_invitations (created_by_user_id, created_at desc);
create index if not exists gem_workspace_owner_invitations_expiry_idx
  on public.gem_workspace_owner_invitations (expires_at)
  where used_at is null and revoked_at is null;

alter table public.gem_workspace_owner_invitations enable row level security;

create or replace function public.gem_workspace_owner_invitation_status(
  p_token_hash text
)
returns table(
  valid boolean,
  masked_email text,
  organization_name text,
  workspace_name text,
  project_name text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.gem_workspace_owner_invitations%rowtype;
  local_part text;
  domain_part text;
begin
  if p_token_hash is null or length(p_token_hash) <> 64 then
    return query select false, null::text, null::text, null::text, null::text, null::timestamptz;
    return;
  end if;

  select gi.* into invitation
  from public.gem_workspace_owner_invitations gi
  where gi.token_hash = p_token_hash
    and gi.used_at is null
    and gi.revoked_at is null
    and gi.expires_at > now();

  if not found then
    return query select false, null::text, null::text, null::text, null::text, null::timestamptz;
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
    invitation.organization_name,
    invitation.workspace_name,
    invitation.project_name,
    invitation.expires_at;
end;
$$;

create or replace function public.gem_consume_workspace_owner_invitation(
  p_token_hash text,
  p_password_hash text,
  p_first_name text default null,
  p_last_name text default null
)
returns table(
  ok boolean,
  user_id text,
  email text,
  organization_id text,
  workspace_id text,
  project_id text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  invitation public.gem_workspace_owner_invitations%rowtype;
  new_user_id text := gen_random_uuid()::text;
  new_organization_id text := gen_random_uuid()::text;
  new_workspace_id text := gen_random_uuid()::text;
  new_role_id text := gen_random_uuid()::text;
  new_membership_id text := gen_random_uuid()::text;
  new_project_id text := null;
  normalized_first_name text;
  normalized_last_name text;
begin
  if p_token_hash is null or length(p_token_hash) <> 64 then
    return query select false, null::text, null::text, null::text, null::text, null::text;
    return;
  end if;

  if p_password_hash is null or length(p_password_hash) < 50 or p_password_hash not like '$2%' then
    return query select false, null::text, null::text, null::text, null::text, null::text;
    return;
  end if;

  normalized_first_name := nullif(left(trim(coalesce(p_first_name, '')), 80), '');
  normalized_last_name := nullif(left(trim(coalesce(p_last_name, '')), 80), '');

  select gi.* into invitation
  from public.gem_workspace_owner_invitations gi
  where gi.token_hash = p_token_hash
    and gi.used_at is null
    and gi.revoked_at is null
    and gi.expires_at > now()
  for update;

  if not found then
    return query select false, null::text, null::text, null::text, null::text, null::text;
    return;
  end if;

  if exists (
    select 1 from public.users existing_user
    where lower(existing_user.email) = lower(invitation.email)
  ) or exists (
    select 1 from public.tokmetric_organizations existing_organization
    where existing_organization.slug = invitation.organization_slug
  ) then
    update public.gem_workspace_owner_invitations gi
    set revoked_at = now(),
        metadata = gi.metadata || jsonb_build_object('reason', 'account_or_organization_already_exists')
    where gi.id = invitation.id;
    return query select false, null::text, null::text, null::text, null::text, null::text;
    return;
  end if;

  insert into public.users (
    id, email, "passwordHash", role, status, "isActive", "isEmailVerified", "createdAt", "updatedAt", "sessionVersion"
  ) values (
    new_user_id,
    lower(invitation.email),
    p_password_hash,
    'client'::public."UserRole",
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
      'workspaceOwnerInvitationId', invitation.id,
      'emailVerificationMethod', 'administrator_controlled_invitation'
    ),
    now()
  );

  insert into public.tokmetric_organizations (
    id, name, slug, status, "createdAt", "updatedAt"
  ) values (
    new_organization_id, invitation.organization_name, invitation.organization_slug, 'active', now(), now()
  );

  insert into public.tokmetric_workspaces (
    id, "organizationId", name, slug, "createdAt", "updatedAt"
  ) values (
    new_workspace_id, new_organization_id, invitation.workspace_name, invitation.workspace_slug, now(), now()
  );

  insert into public.tokmetric_roles (
    id, "workspaceId", name, description, "createdAt", "updatedAt"
  ) values (
    new_role_id,
    new_workspace_id,
    'Organization Owner',
    'Owns this organization workspace without GEM platform-administrator authority.',
    now(),
    now()
  );

  insert into public.tokmetric_permissions (id, "roleId", action, scope, "createdAt")
  select gen_random_uuid()::text, new_role_id, permission.action, permission.scope, now()
  from (values
    ('view', 'workspace'),
    ('view', 'members'),
    ('manage', 'members'),
    ('view', 'requests'),
    ('manage', 'requests'),
    ('view', 'documents'),
    ('view', 'support'),
    ('manage', 'support'),
    ('view', 'approvals'),
    ('manage', 'projects'),
    ('manage', 'weekly_updates')
  ) as permission(action, scope);

  insert into public.tokmetric_workspace_members (
    id, "workspaceId", "userId", "roleId", status, "createdAt", "updatedAt"
  ) values (
    new_membership_id, new_workspace_id, new_user_id, new_role_id, 'active', now(), now()
  );

  if invitation.project_name is not null and invitation.project_slug is not null then
    new_project_id := gen_random_uuid()::text;
    insert into public.organization_projects (
      id, "workspaceId", "ownerUserId", name, slug, summary, status, progress, "createdAt", "updatedAt"
    ) values (
      new_project_id,
      new_workspace_id,
      new_user_id,
      invitation.project_name,
      invitation.project_slug,
      coalesce(invitation.project_summary, 'Project workspace setup is in progress.'),
      'PLANNED'::public."OrganizationProjectStatus",
      0,
      now(),
      now()
    );
  end if;

  update public.gem_workspace_owner_invitations gi
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
    'admin_action'::public."AuditAction",
    'organization_workspace',
    new_workspace_id,
    jsonb_build_object(
      'operation', 'workspace_owner_invitation_accepted',
      'flow', 'one_time_workspace_owner_invitation',
      'invitationId', invitation.id,
      'organizationId', new_organization_id,
      'workspaceId', new_workspace_id,
      'projectId', new_project_id,
      'ownerUserId', new_user_id,
      'ownerPlatformRole', 'client',
      'invitedByUserId', invitation.created_by_user_id,
      'privilegeEscalation', false
    ),
    now()
  );

  return query select true, new_user_id, lower(invitation.email), new_organization_id, new_workspace_id, new_project_id;
end;
$$;

revoke all on table public.gem_workspace_owner_invitations from public, anon, authenticated;
revoke all on function public.gem_workspace_owner_invitation_status(text) from public, anon, authenticated;
revoke all on function public.gem_consume_workspace_owner_invitation(text, text, text, text) from public, anon, authenticated;
grant execute on function public.gem_workspace_owner_invitation_status(text) to service_role;
grant execute on function public.gem_consume_workspace_owner_invitation(text, text, text, text) to service_role;

comment on table public.gem_workspace_owner_invitations is
  'High-entropy, short-lived, one-time capabilities that atomically create a client-owned organization workspace.';
comment on function public.gem_consume_workspace_owner_invitation(text, text, text, text) is
  'Atomically creates one client account, organization, workspace, owner role, membership, optional project, and audit event from a single-use capability.';
