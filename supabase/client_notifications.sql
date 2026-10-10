-- Apply after user_roles.sql. This inbox is separate from admin booking alerts.
begin;

create table if not exists public.client_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('message', 'quote', 'request', 'booking', 'document')),
  title text not null,
  body text not null,
  target_path text not null check (target_path in (
    '/portal/messages', '/portal/quotes', '/portal/requests', '/portal/accommodation', '/portal/documents'
  )),
  message_id uuid unique references public.messages(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists client_notifications_inbox_idx
  on public.client_notifications (user_id, created_at desc, id desc);
create index if not exists client_notifications_unread_idx
  on public.client_notifications (user_id) where read_at is null;
alter table public.client_notifications enable row level security;
drop policy if exists "Clients read their own notifications" on public.client_notifications;
create policy "Clients read their own notifications"
  on public.client_notifications for select to authenticated using (user_id = auth.uid());
revoke all on public.client_notifications from anon, authenticated;
grant select on public.client_notifications to authenticated;

create or replace function public.mark_client_notification_read(
  p_notification_id uuid default null, p_before timestamptz default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in to update notifications'; end if;
  if p_notification_id is null and p_before is null then raise exception 'Choose notifications to mark read'; end if;
  update public.client_notifications set read_at = now()
  where user_id = auth.uid() and read_at is null and (
    (p_notification_id is not null and id = p_notification_id)
    or (p_notification_id is null and created_at <= p_before)
  );
end;
$$;
revoke all on function public.mark_client_notification_read(uuid, timestamptz) from public;
grant execute on function public.mark_client_notification_read(uuid, timestamptz) to authenticated;

create or replace function public.notify_client_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  recipient uuid;
  notification_kind text;
  notification_title text;
  notification_body text;
  destination text;
  source_message uuid;
begin
  if tg_table_name = 'messages' then
    if tg_op = 'UPDATE' then
      if new.sender_role = 'admin' and new.read_at is not null then
        update public.client_notifications set read_at = coalesce(read_at, new.read_at)
        where message_id = new.id;
      end if;
      return new;
    end if;
    if new.sender_role <> 'admin' then return new; end if;
    select client_id into recipient from public.message_threads where id = new.thread_id;
    notification_kind := 'message';
    notification_title := 'New support reply';
    notification_body := left(new.text, 180);
    destination := '/portal/messages';
    source_message := new.id;
  elsif tg_table_name = 'quotes' then
    if tg_op = 'UPDATE' then
      if new.status is not distinct from old.status and new.amount is not distinct from old.amount
        and new.notes is not distinct from old.notes and new.valid_until is not distinct from old.valid_until then return new; end if;
      -- Do not notify clients about their own approval/decline action.
      if auth.uid() = new.user_id then return new; end if;
      notification_title := 'Quotation updated';
    else notification_title := 'New quotation'; end if;
    recipient := new.user_id; notification_kind := 'quote';
    notification_body := new.reference || ' · ' || new.status;
    destination := '/portal/quotes';
  elsif tg_table_name = 'service_requests' then
    if new.status is not distinct from old.status then return new; end if;
    recipient := new.user_id; notification_kind := 'request';
    notification_title := 'RFQ status updated';
    notification_body := new.reference || ' · ' || new.status;
    destination := '/portal/requests';
  elsif tg_table_name = 'accommodation_bookings' then
    if new.status is not distinct from old.status or auth.uid() = new.user_id then return new; end if;
    recipient := new.user_id; notification_kind := 'booking';
    notification_title := 'Booking status updated';
    notification_body := new.reference || ' · ' || new.status;
    destination := '/portal/accommodation';
  elsif tg_table_name = 'documents' then
    recipient := new.user_id; notification_kind := 'document';
    notification_title := 'Document ready';
    notification_body := left(new.name, 180);
    destination := '/portal/documents';
  else return new; end if;

  if recipient is not null then
    insert into public.client_notifications (user_id, kind, title, body, target_path, message_id)
    values (recipient, notification_kind, notification_title, notification_body, destination, source_message)
    on conflict (message_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists notify_client_message on public.messages;
create trigger notify_client_message after insert or update of read_at on public.messages
  for each row execute function public.notify_client_activity();
drop trigger if exists notify_client_quote on public.quotes;
create trigger notify_client_quote after insert or update on public.quotes
  for each row execute function public.notify_client_activity();
drop trigger if exists notify_client_request on public.service_requests;
create trigger notify_client_request after update of status on public.service_requests
  for each row execute function public.notify_client_activity();
drop trigger if exists notify_client_booking on public.accommodation_bookings;
create trigger notify_client_booking after update of status on public.accommodation_bookings
  for each row execute function public.notify_client_activity();
drop trigger if exists notify_client_document on public.documents;
create trigger notify_client_document after insert on public.documents
  for each row execute function public.notify_client_activity();

-- Include existing unread support replies without adding old business events.
insert into public.client_notifications (user_id, kind, title, body, target_path, message_id, created_at)
select t.client_id, 'message', 'New support reply', left(m.text, 180), '/portal/messages', m.id, m.created_at
from public.messages m join public.message_threads t on t.id = m.thread_id
where m.sender_role = 'admin' and m.read_at is null
on conflict (message_id) do nothing;

alter table public.client_notifications replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.client_notifications;
exception when duplicate_object then null;
end $$;
commit;
