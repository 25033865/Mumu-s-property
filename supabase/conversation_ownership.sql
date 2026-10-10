-- Apply after user_roles.sql in the Supabase SQL editor.
begin;

alter table public.message_threads
  add column if not exists assigned_admin_id uuid references auth.users(id) on delete set null,
  add column if not exists status text not null default 'open' check (status in ('open', 'resolved'));

-- Do not allow clients to create a pre-assigned or resolved thread.
create or replace function public.initialize_conversation()
returns trigger language plpgsql set search_path = public as $$
begin
  new.assigned_admin_id := null;
  new.status := 'open';
  return new;
end;
$$;
drop trigger if exists initialize_conversation on public.message_threads;
create trigger initialize_conversation before insert on public.message_threads
for each row execute function public.initialize_conversation();

create or replace function public.support_admins()
returns table (user_id uuid, name text)
language sql security definer set search_path = public as $$
  select r.user_id, coalesce(nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''), 'Support admin')
  from public.user_roles r left join public.profiles p on p.user_id = r.user_id
  where r.role = 'admin' and exists (
    select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.manage_conversation(
  p_thread_id uuid, p_action text, p_expected_owner uuid, p_target_admin uuid default null
)
returns public.message_threads
language plpgsql security definer set search_path = public as $$
declare conversation public.message_threads;
begin
  if not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
    raise exception 'Admin access required';
  end if;
  -- Claims, handoffs and sends all lock the same row: only one wins.
  select * into conversation from public.message_threads where id = p_thread_id for update;
  if not found then raise exception 'Conversation not found'; end if;
  if conversation.assigned_admin_id is distinct from p_expected_owner then
    raise exception 'This conversation has changed. Refresh and try again.';
  end if;
  if p_action = 'claim' then
    if conversation.assigned_admin_id is not null or conversation.status <> 'open' then
      raise exception 'This conversation is already assigned or resolved';
    end if;
    conversation.assigned_admin_id := auth.uid();
  elsif p_action = 'reopen' then
    if conversation.status <> 'resolved' then raise exception 'Conversation is already open'; end if;
    conversation.status := 'open';
    conversation.assigned_admin_id := null;
  else
    if conversation.assigned_admin_id is distinct from auth.uid() or conversation.status <> 'open' then
      raise exception 'Only the assigned admin can manage this conversation';
    end if;
    if p_action = 'release' then conversation.assigned_admin_id := null;
    elsif p_action = 'resolve' then
      conversation.status := 'resolved';
      conversation.assigned_admin_id := null;
    elsif p_action = 'transfer' then
      if p_target_admin is null or not exists (
        select 1 from public.user_roles where user_id = p_target_admin and role = 'admin'
      ) then raise exception 'Choose an active admin'; end if;
      conversation.assigned_admin_id := p_target_admin;
    else raise exception 'Invalid conversation action'; end if;
  end if;
  update public.message_threads set assigned_admin_id = conversation.assigned_admin_id,
    status = conversation.status where id = p_thread_id returning * into conversation;
  return conversation;
end;
$$;

-- Enforce ownership even for requests made outside the UI. Taking a row lock
-- serializes a send against a concurrent transfer, release or resolve.
create or replace function public.enforce_conversation_sender()
returns trigger language plpgsql security definer set search_path = public as $$
declare conversation public.message_threads;
begin
  select * into conversation from public.message_threads where id = new.thread_id for update;
  if new.sender_id is distinct from auth.uid() then raise exception 'Invalid message sender'; end if;
  if new.sender_role = 'admin' then
    if conversation.status <> 'open' or conversation.assigned_admin_id is distinct from auth.uid()
      or not exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin') then
      raise exception 'Take this conversation before replying. Only its assigned admin can reply.';
    end if;
  elsif new.sender_role = 'client' and conversation.client_id = auth.uid() then
    if conversation.status = 'resolved' then
      update public.message_threads set status = 'open', assigned_admin_id = null where id = new.thread_id;
    end if;
  else raise exception 'Invalid message sender'; end if;
  return new;
end;
$$;
drop trigger if exists enforce_conversation_sender on public.messages;
create trigger enforce_conversation_sender before insert on public.messages
for each row execute function public.enforce_conversation_sender();

revoke all on function public.support_admins() from public;
revoke all on function public.manage_conversation(uuid, text, uuid, uuid) from public;
grant execute on function public.support_admins() to authenticated;
grant execute on function public.manage_conversation(uuid, text, uuid, uuid) to authenticated;
-- Ownership can only be changed through the locked, authorized RPC.
revoke update on public.message_threads from authenticated, anon;
alter table public.message_threads replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.message_threads;
exception when duplicate_object then null;
end $$;
commit;
