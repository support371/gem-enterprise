-- Create user_roles table for portal RBAC
create table if not exists public.user_roles (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  role       text not null check (role in ('admin', 'manager', 'analyst', 'viewer')),
  created_at timestamptz default now() not null,
  unique (user_id)
);

alter table public.user_roles enable row level security;

-- Users can read only their own role
create policy "users_read_own_role" on public.user_roles
  for select
  using (auth.uid() = user_id);

-- Only the service role (backend / admin SQL) can insert/update/delete
create policy "service_role_manages_roles" on public.user_roles
  for all
  using (auth.role() = 'service_role');

-- Index for fast lookup by user_id
create index if not exists user_roles_user_id_idx on public.user_roles (user_id);
