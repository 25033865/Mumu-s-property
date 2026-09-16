create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'client')) default 'client',
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

drop policy if exists "Users can read their own role" on public.user_roles;
create policy "Users can read their own role"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- After creating an admin in Supabase Authentication, run:
-- insert into public.user_roles (user_id, role)
-- values ('AUTH_USER_UUID', 'admin');

create extension if not exists pgcrypto;

create sequence if not exists public.service_request_reference_seq start 2000;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default ('RFQ-' || lpad(nextval('public.service_request_reference_seq')::text, 4, '0')),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  category text not null,
  requirements text not null,
  location text not null,
  required_by date,
  urgency text not null check (urgency in ('Low', 'Medium', 'High')),
  status text not null check (status in ('Submitted', 'Under Review', 'Quotation Sent', 'Approved', 'In Progress', 'Completed')) default 'Submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_requests add column if not exists requester_name text;
alter table public.service_requests add column if not exists company_name text;

update public.service_requests as requests
set
  requester_name = coalesce(
    nullif(trim(concat_ws(' ', users.raw_user_meta_data ->> 'first_name', users.raw_user_meta_data ->> 'last_name')), ''),
    users.email
  ),
  company_name = nullif(users.raw_user_meta_data ->> 'company', '')
from auth.users as users
where requests.user_id = users.id
  and requests.requester_name is null;

create table if not exists public.service_request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null,
  file_name text not null,
  content_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.service_requests enable row level security;
alter table public.service_request_files enable row level security;

drop policy if exists "Users can read their company" on public.companies;
create policy "Users can read their company"
  on public.companies for select to authenticated
  using (id in (select company_id from public.profiles where user_id = auth.uid()));

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
  on public.profiles for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Clients can create their requests" on public.service_requests;
create policy "Clients can create their requests"
  on public.service_requests for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Clients can read their requests" on public.service_requests;
create policy "Clients can read their requests"
  on public.service_requests for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admins can read all requests" on public.service_requests;
create policy "Admins can read all requests"
  on public.service_requests for select to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can update all requests" on public.service_requests;
create policy "Admins can update all requests"
  on public.service_requests for update to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Users can create files for their requests" on public.service_request_files;
create policy "Users can create files for their requests"
  on public.service_request_files for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can read their request files" on public.service_request_files;
create policy "Users can read their request files"
  on public.service_request_files for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admins can read all request files" on public.service_request_files;
create policy "Admins can read all request files"
  on public.service_request_files for select to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

insert into storage.buckets (id, name, public)
values ('service-request-files', 'service-request-files', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload their request files" on storage.objects;
create policy "Users can upload their request files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'service-request-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can read their request files from storage" on storage.objects;
create policy "Users can read their request files from storage"
  on storage.objects for select to authenticated
  using (bucket_id = 'service-request-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Admins can read request files from storage" on storage.objects;
create policy "Admins can read request files from storage"
  on storage.objects for select to authenticated
  using (bucket_id = 'service-request-files' and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
