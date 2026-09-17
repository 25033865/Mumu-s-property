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

create sequence if not exists public.quote_reference_seq start 1200;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default ('QT-' || lpad(nextval('public.quote_reference_seq')::text, 4, '0')),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  valid_until date,
  notes text,
  status text not null check (status in ('Awaiting approval', 'Approved', 'Declined')) default 'Awaiting approval',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid references public.service_requests(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  name text not null,
  document_type text not null check (document_type in ('Quote', 'Delivery', 'Compliance', 'Contract', 'Other')),
  path text not null unique,
  content_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.accommodation_camps (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now()
);

create sequence if not exists public.accommodation_reference_seq start 100;

create table if not exists public.accommodation_bookings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default ('AC-' || lpad(nextval('public.accommodation_reference_seq')::text, 3, '0')),
  user_id uuid not null references auth.users(id) on delete cascade,
  camp_id uuid not null references public.accommodation_camps(id),
  guest_name text not null,
  beds integer not null check (beds > 0),
  check_in date not null,
  check_out date not null,
  status text not null check (status in ('Requested', 'Approved', 'Declined', 'Active', 'Completed', 'Cancellation Requested', 'Change Requested', 'Cancelled')) default 'Requested',
  status_before_change text,
  requested_check_out date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accommodation_dates_valid check (check_out > check_in)
);

alter table public.accommodation_bookings drop constraint if exists accommodation_bookings_status_check;
alter table public.accommodation_bookings add constraint accommodation_bookings_status_check check (status in ('Requested', 'Approved', 'Declined', 'Active', 'Completed', 'Cancellation Requested', 'Change Requested', 'Cancelled'));
alter table public.accommodation_bookings add column if not exists requested_check_out date;
alter table public.accommodation_bookings add column if not exists status_before_change text;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  booking_id uuid references public.accommodation_bookings(id) on delete cascade,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

insert into public.accommodation_camps (name, capacity)
values
  ('North Camp', 60),
  ('Onverwacht Lodge', 40),
  ('South Camp', 48)
on conflict (name) do nothing;

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.service_requests enable row level security;
alter table public.service_request_files enable row level security;
alter table public.quotes enable row level security;
alter table public.documents enable row level security;
alter table public.accommodation_camps enable row level security;
alter table public.accommodation_bookings enable row level security;
alter table public.notifications enable row level security;

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

drop policy if exists "Clients can read their quotes" on public.quotes;
create policy "Clients can read their quotes"
  on public.quotes for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admins can read all quotes" on public.quotes;
create policy "Admins can read all quotes"
  on public.quotes for select to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can create quotes" on public.quotes;
create policy "Admins can create quotes"
  on public.quotes for insert to authenticated
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Clients can update their quote decisions" on public.quotes;

create or replace function public.respond_to_quote(
  p_quote_id uuid,
  p_status text
)
returns public.quotes
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_quote public.quotes;
begin
  if p_status not in ('Approved', 'Declined') then
    raise exception 'Invalid quote response';
  end if;

  update public.quotes
  set status = p_status,
      updated_at = now()
  where id = p_quote_id
    and user_id = auth.uid()
    and status = 'Awaiting approval'
  returning * into updated_quote;

  if updated_quote.id is null then
    raise exception 'Quote not found or already decided';
  end if;

  return updated_quote;
end;
$$;

grant execute on function public.respond_to_quote(uuid, text) to authenticated;

drop policy if exists "Authenticated users can read camps" on public.accommodation_camps;
create policy "Authenticated users can read camps"
  on public.accommodation_camps for select to authenticated
  using (true);

drop policy if exists "Clients can create accommodation bookings" on public.accommodation_bookings;
create policy "Clients can create accommodation bookings"
  on public.accommodation_bookings for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Clients can read their accommodation bookings" on public.accommodation_bookings;
create policy "Clients can read their accommodation bookings"
  on public.accommodation_bookings for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admins can read all accommodation bookings" on public.accommodation_bookings;
create policy "Admins can read all accommodation bookings"
  on public.accommodation_bookings for select to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can update accommodation bookings" on public.accommodation_bookings;
create policy "Admins can update accommodation bookings"
  on public.accommodation_bookings for update to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can read notifications" on public.notifications;
create policy "Admins can read notifications"
  on public.notifications for select to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can update notifications" on public.notifications;
create policy "Admins can update notifications"
  on public.notifications for update to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

create or replace function public.request_accommodation_change(
  p_booking_id uuid,
  p_action text,
  p_requested_check_out date default null
)
returns public.accommodation_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_booking public.accommodation_bookings;
begin
  if p_action not in ('cancel', 'extend') then
    raise exception 'Invalid accommodation action';
  end if;
  if p_action = 'extend' and p_requested_check_out is null then
    raise exception 'A new check-out date is required';
  end if;

  update public.accommodation_bookings
  set status = case when p_action = 'cancel' then 'Cancellation Requested' else 'Change Requested' end,
      status_before_change = status,
      requested_check_out = case when p_action = 'extend' then p_requested_check_out else null end,
      updated_at = now()
  where id = p_booking_id
    and user_id = auth.uid()
    and status in ('Requested', 'Approved', 'Active', 'Change Requested')
  returning * into updated_booking;

  if updated_booking.id is null then
    raise exception 'Booking not found or cannot be changed';
  end if;

  insert into public.notifications (type, booking_id, message)
  values (
    case when p_action = 'cancel' then 'booking_cancellation' else 'booking_change' end,
    updated_booking.id,
    case when p_action = 'cancel' then updated_booking.reference || ' cancellation requested' else updated_booking.reference || ' check-out change requested' end
  );
  return updated_booking;
end;
$$;

grant execute on function public.request_accommodation_change(uuid, text, date) to authenticated;

drop policy if exists "Clients can read their documents" on public.documents;
create policy "Clients can read their documents"
  on public.documents for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admins can read all documents" on public.documents;
create policy "Admins can read all documents"
  on public.documents for select to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Admins can create documents" on public.documents;
create policy "Admins can create documents"
  on public.documents for insert to authenticated
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

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
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

drop policy if exists "Admins can upload documents" on storage.objects;
create policy "Admins can upload documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

drop policy if exists "Clients can read their documents from storage" on storage.objects;
create policy "Clients can read their documents from storage"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Admins can read documents from storage" on storage.objects;
create policy "Admins can read documents from storage"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents' and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));
