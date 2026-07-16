-- TokMetric Custom GPT bearer credential registry.
-- Plaintext bearer values are never stored. The production gateway compares
-- SHA-256 hashes and binds each credential to one actor and one workspace.

create table if not exists public.tokmetric_gpt_credentials (
  id text primary key,
  token_hash text not null unique,
  actor_user_id text not null references public.users(id) on delete restrict,
  workspace_id text not null references public.tokmetric_workspaces(id) on delete restrict,
  label text not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz,
  last_used_at timestamptz
);

create index if not exists tokmetric_gpt_credentials_status_idx
  on public.tokmetric_gpt_credentials(status);

create index if not exists tokmetric_gpt_credentials_workspace_idx
  on public.tokmetric_gpt_credentials(workspace_id);

alter table public.tokmetric_gpt_credentials enable row level security;

comment on table public.tokmetric_gpt_credentials is
  'Server-side TokMetric Custom GPT bearer credential registry. Stores SHA-256 hashes only; no plaintext bearer tokens.';
