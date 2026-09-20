-- One private document per authenticated user; revisions prevent stale devices
-- from silently replacing newer data. No financial data is public.
create table public.finance_documents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.finance_documents enable row level security;
revoke all on public.finance_documents from anon, authenticated;
grant select, insert, update on public.finance_documents to authenticated;
create policy "Read own finances" on public.finance_documents
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Insert own finances" on public.finance_documents
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own finances" on public.finance_documents
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Atomic writes derive ownership from the verified session; RLS also applies.
create function public.save_finance_document(p_state jsonb, p_revision bigint, p_user_id uuid)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare v_user uuid := auth.uid(); v_revision bigint;
begin
  if v_user is null or v_user is distinct from p_user_id then raise exception 'Authentication required'; end if;
  if p_revision is null or p_revision < 0 then raise exception 'Invalid revision'; end if;
  if p_state is null or jsonb_typeof(p_state) is distinct from 'object'
    or jsonb_typeof(p_state->'accounts') is distinct from 'array'
    or jsonb_typeof(p_state->'transactions') is distinct from 'array'
    or jsonb_typeof(p_state->'budgets') is distinct from 'array'
    or jsonb_typeof(p_state->'goals') is distinct from 'array'
    or jsonb_typeof(p_state->'plan') is distinct from 'object'
    or jsonb_typeof(p_state->'settings') is distinct from 'object'
  then raise exception 'Invalid finance document'; end if;
  if p_revision = 0 then
    insert into public.finance_documents(user_id, state) values (v_user, p_state)
      on conflict (user_id) do nothing returning revision into v_revision;
  else
    update public.finance_documents set state = p_state, revision = revision + 1, updated_at = now()
      where user_id = v_user and revision = p_revision returning revision into v_revision;
  end if;
  if v_revision is null then raise exception 'FINANCE_CONFLICT'; end if;
  return v_revision;
end;
$$;
revoke all on function public.save_finance_document(jsonb, bigint, uuid) from public, anon;
grant execute on function public.save_finance_document(jsonb, bigint, uuid) to authenticated;
