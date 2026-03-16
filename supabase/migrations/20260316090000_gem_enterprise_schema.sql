begin;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'client',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entity_types (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.kyc_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  entity_type_id uuid references public.entity_types(id),
  status text not null,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.kyc_applications(id) on delete cascade,
  file_name text not null,
  file_path text,
  status text not null default 'uploaded',
  created_at timestamptz not null default now()
);

create table if not exists public.kyc_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.kyc_applications(id) on delete cascade,
  reviewer_id uuid references public.users(id),
  notes text,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.kyc_applications(id) on delete cascade,
  decision text not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_memberships (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text not null default 'viewer',
  created_at timestamptz not null default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  category text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  title text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id),
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

insert into public.entity_types (code,label) values
('individual','Individual'),('business','Business'),('trust','Trust'),('family-office','Family Office')
on conflict (code) do nothing;

insert into public.products (code,name) values
('cyber','Cybersecurity'),('financial','Financial'),('real-estate','Real Estate')
on conflict (code) do nothing;

commit;
