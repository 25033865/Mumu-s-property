-- Accommodation availability enforcement
alter table public.accommodation_camps add column if not exists booked_rooms integer not null default 0;
alter table public.accommodation_camps add column if not exists available_rooms integer generated always as (greatest(capacity - booked_rooms, 0)) stored;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'accommodation_camps_booked_rooms_nonnegative'
      and conrelid = 'public.accommodation_camps'::regclass
  ) then
    alter table public.accommodation_camps
      add constraint accommodation_camps_booked_rooms_nonnegative check (booked_rooms >= 0);
  end if;
end $$;

create index if not exists accommodation_bookings_camp_status_checkout_idx
  on public.accommodation_bookings (camp_id, status, check_out);

create or replace function public.accommodation_reserved_rooms(
  p_status text,
  p_rooms integer,
  p_check_out date
)
returns integer
language sql
stable
as $$
  select case
    when p_status in ('Requested', 'Approved', 'Active', 'Cancellation Requested', 'Change Requested')
      and p_check_out > current_date
    then greatest(coalesce(p_rooms, 0), 0)
    else 0
  end;
$$;

create or replace function public.refresh_accommodation_camp_availability(p_camp_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_camp_id is null then
    return;
  end if;

  update public.accommodation_camps as camp
  set booked_rooms = coalesce((
    select sum(public.accommodation_reserved_rooms(booking.status, booking."Rooms", booking.check_out))
    from public.accommodation_bookings as booking
    where booking.camp_id = p_camp_id
  ), 0)
  where camp.id = p_camp_id;
end;
$$;

create or replace function public.refresh_all_accommodation_camp_availability()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  camp_record record;
begin
  for camp_record in select id from public.accommodation_camps loop
    perform public.refresh_accommodation_camp_availability(camp_record.id);
  end loop;
end;
$$;

create or replace function public.enforce_accommodation_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  camp_capacity integer;
  camp_name text;
  current_reserved integer;
  old_reserved integer := 0;
  new_reserved integer;
begin
  if new."Rooms" <= 0 then
    raise exception 'Number of rooms must be greater than zero';
  end if;

  if new.check_out <= new.check_in then
    raise exception 'Check-out date must be after check-in date';
  end if;

  new_reserved := public.accommodation_reserved_rooms(new.status, new."Rooms", new.check_out);

  if tg_op = 'UPDATE' then
    old_reserved := public.accommodation_reserved_rooms(old.status, old."Rooms", old.check_out);
    if new.camp_id = old.camp_id and new_reserved <= old_reserved then
      return new;
    end if;
  end if;

  if new_reserved = 0 then
    return new;
  end if;

  perform 1
  from public.accommodation_camps
  where id = new.camp_id
  for update;

  select capacity, name
  into camp_capacity, camp_name
  from public.accommodation_camps
  where id = new.camp_id;

  if camp_capacity is null then
    raise exception 'Accommodation camp not found';
  end if;

  if tg_op = 'UPDATE' then
    select coalesce(sum(public.accommodation_reserved_rooms(booking.status, booking."Rooms", booking.check_out)), 0)
    into current_reserved
    from public.accommodation_bookings as booking
    where booking.camp_id = new.camp_id
      and booking.id <> old.id;
  else
    select coalesce(sum(public.accommodation_reserved_rooms(booking.status, booking."Rooms", booking.check_out)), 0)
    into current_reserved
    from public.accommodation_bookings as booking
    where booking.camp_id = new.camp_id;
  end if;

  if current_reserved + new_reserved > camp_capacity then
    raise exception 'Only % rooms are available at %.', greatest(camp_capacity - current_reserved, 0), camp_name;
  end if;

  return new;
end;
$$;

create or replace function public.refresh_accommodation_availability_after_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_accommodation_camp_availability(old.camp_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.camp_id is distinct from new.camp_id then
    perform public.refresh_accommodation_camp_availability(old.camp_id);
  end if;

  perform public.refresh_accommodation_camp_availability(new.camp_id);
  return new;
end;
$$;

drop trigger if exists accommodation_capacity_before_write on public.accommodation_bookings;
create trigger accommodation_capacity_before_write
  before insert or update on public.accommodation_bookings
  for each row execute function public.enforce_accommodation_capacity();

drop trigger if exists accommodation_availability_after_write on public.accommodation_bookings;
create trigger accommodation_availability_after_write
  after insert or update or delete on public.accommodation_bookings
  for each row execute function public.refresh_accommodation_availability_after_write();

create or replace function public.release_due_accommodation_bookings()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  changed_count integer;
begin
  update public.accommodation_bookings
  set status = 'Completed',
      status_before_change = null,
      requested_check_out = null,
      updated_at = now()
  where status in ('Requested', 'Approved', 'Active', 'Cancellation Requested', 'Change Requested')
    and check_out <= current_date;

  get diagnostics changed_count = row_count;
  perform public.refresh_all_accommodation_camp_availability();
  return changed_count;
end;
$$;

create or replace function public.admin_update_accommodation_booking_status(
  p_booking_id uuid,
  p_status text
)
returns public.accommodation_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_booking public.accommodation_bookings;
begin
  if not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
    raise exception 'Only admins can update accommodation bookings';
  end if;

  if p_status not in ('Requested', 'Approved', 'Declined', 'Active', 'Completed', 'Cancellation Requested', 'Change Requested', 'Cancelled') then
    raise exception 'Invalid accommodation status';
  end if;

  update public.accommodation_bookings
  set status = p_status,
      status_before_change = case when p_status in ('Cancellation Requested', 'Change Requested') then status_before_change else null end,
      requested_check_out = case when p_status = 'Change Requested' then requested_check_out else null end,
      updated_at = now()
  where id = p_booking_id
  returning * into updated_booking;

  if updated_booking.id is null then
    raise exception 'Booking not found';
  end if;

  return updated_booking;
end;
$$;

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
  current_booking public.accommodation_bookings;
  updated_booking public.accommodation_bookings;
begin
  if p_action not in ('cancel', 'extend') then
    raise exception 'Invalid accommodation action';
  end if;

  select *
  into current_booking
  from public.accommodation_bookings
  where id = p_booking_id
    and user_id = auth.uid()
    and status in ('Requested', 'Approved', 'Active', 'Cancellation Requested', 'Change Requested')
  for update;

  if current_booking.id is null then
    raise exception 'Booking not found or cannot be changed';
  end if;

  if p_action = 'extend' then
    if p_requested_check_out is null then
      raise exception 'A new check-out date is required';
    end if;
    if p_requested_check_out <= current_booking.check_out then
      raise exception 'New check-out date must be after the current check-out date';
    end if;
  end if;

  update public.accommodation_bookings
  set status = case when p_action = 'cancel' then 'Cancellation Requested' else 'Change Requested' end,
      status_before_change = case
        when status in ('Cancellation Requested', 'Change Requested') then status_before_change
        else status
      end,
      requested_check_out = case when p_action = 'extend' then p_requested_check_out else null end,
      updated_at = now()
  where id = p_booking_id
  returning * into updated_booking;

  insert into public.notifications (type, booking_id, message)
  values (
    case when p_action = 'cancel' then 'booking_cancellation' else 'booking_change' end,
    updated_booking.id,
    case when p_action = 'cancel' then updated_booking.reference || ' cancellation requested' else updated_booking.reference || ' check-out change requested' end
  );

  return updated_booking;
end;
$$;

create or replace function public.review_accommodation_change(
  p_booking_id uuid,
  p_approved boolean
)
returns public.accommodation_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  current_booking public.accommodation_bookings;
  next_status text;
  updated_booking public.accommodation_bookings;
begin
  if not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
    raise exception 'Only admins can review accommodation changes';
  end if;

  select *
  into current_booking
  from public.accommodation_bookings
  where id = p_booking_id
  for update;

  if current_booking.id is null then
    raise exception 'Booking not found';
  end if;

  if current_booking.status not in ('Cancellation Requested', 'Change Requested') then
    raise exception 'Booking is not waiting for a cancellation or change review';
  end if;

  if current_booking.status = 'Cancellation Requested' then
    next_status := case when p_approved then 'Cancelled' else coalesce(current_booking.status_before_change, 'Approved') end;
    update public.accommodation_bookings
    set status = next_status,
        status_before_change = null,
        requested_check_out = null,
        updated_at = now()
    where id = p_booking_id
    returning * into updated_booking;
  else
    if p_approved and current_booking.requested_check_out is null then
      raise exception 'Requested check-out date is missing';
    end if;

    next_status := case when p_approved then coalesce(current_booking.status_before_change, 'Active') else coalesce(current_booking.status_before_change, 'Approved') end;
    update public.accommodation_bookings
    set status = next_status,
        check_out = case when p_approved then current_booking.requested_check_out else check_out end,
        status_before_change = null,
        requested_check_out = null,
        updated_at = now()
    where id = p_booking_id
    returning * into updated_booking;
  end if;

  update public.notifications
  set read_at = now()
  where booking_id = p_booking_id
    and read_at is null;

  return updated_booking;
end;
$$;

grant execute on function public.refresh_accommodation_camp_availability(uuid) to authenticated;
grant execute on function public.refresh_all_accommodation_camp_availability() to authenticated;
grant execute on function public.release_due_accommodation_bookings() to authenticated;
grant execute on function public.admin_update_accommodation_booking_status(uuid, text) to authenticated;
grant execute on function public.request_accommodation_change(uuid, text, date) to authenticated;
grant execute on function public.review_accommodation_change(uuid, boolean) to authenticated;

select public.release_due_accommodation_bookings();
select public.refresh_all_accommodation_camp_availability();

do $$
begin
  begin
    execute 'create extension if not exists pg_cron';
    begin
      execute 'select cron.unschedule(''release-due-accommodation-bookings'')';
    exception when others then
      null;
    end;
    execute 'select cron.schedule(''release-due-accommodation-bookings'', ''10 0 * * *'', ''select public.release_due_accommodation_bookings();'')';
  exception when others then
    raise notice 'pg_cron was not configured. The app still releases due bookings when the accommodation pages load.';
  end;
end $$;
