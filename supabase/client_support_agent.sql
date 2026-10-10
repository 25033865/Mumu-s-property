-- Apply after conversation_ownership.sql. Clients only get the first name
-- of the admin assigned to their own conversation.
begin;

create or replace function public.client_support_agent(p_thread_id uuid)
returns table (status text, is_assigned boolean, first_name text)
language sql
security definer
set search_path = public
as $$
  select
    t.status,
    coalesce(r.role = 'admin', false),
    case when r.role = 'admin' then
      coalesce(nullif(trim(p.first_name), ''), 'a support agent')
    else null end
  from public.message_threads t
  left join public.user_roles r on r.user_id = t.assigned_admin_id
  left join public.profiles p on p.user_id = r.user_id
  where t.id = p_thread_id and t.client_id = auth.uid();
$$;

revoke all on function public.client_support_agent(uuid) from public;
grant execute on function public.client_support_agent(uuid) to authenticated;

commit;
