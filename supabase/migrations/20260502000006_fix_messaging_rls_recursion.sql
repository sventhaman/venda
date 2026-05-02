-- The original policies on conversation_participants, conversations, and messages
-- did EXISTS checks against conversation_participants from inside policies on
-- those same tables, causing "infinite recursion detected in policy". The fix
-- is a SECURITY DEFINER helper function that bypasses RLS for the membership
-- lookup — the standard Supabase pattern for self-referential auth checks.

create or replace function public.is_conversation_participant(_conversation_id uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.conversation_participants
    where conversation_id = _conversation_id
      and user_id = auth.uid()
  );
$$;

-- Lock the function down so anon can't RPC it, but authenticated must keep
-- EXECUTE — policies are evaluated as the calling role, so the helper has to
-- be callable by authenticated for the policy itself to work. The function
-- only checks membership against the caller's own auth.uid() and returns a
-- boolean, so it's safe to call from RPC too.
revoke execute on function public.is_conversation_participant(uuid) from public, anon;
grant   execute on function public.is_conversation_participant(uuid) to authenticated;

drop policy if exists "participants self read"          on public.conversation_participants;
drop policy if exists "conversations participants read" on public.conversations;
drop policy if exists "messages read participants"      on public.messages;
drop policy if exists "messages insert participants"    on public.messages;

create policy "participants read"
  on public.conversation_participants for select
  using (
    user_id = (select auth.uid())
    or public.is_conversation_participant(conversation_id)
  );

create policy "conversations read"
  on public.conversations for select
  using (public.is_conversation_participant(id));

create policy "messages read"
  on public.messages for select
  using (public.is_conversation_participant(conversation_id));

create policy "messages insert"
  on public.messages for insert
  with check (
    sender_id = (select auth.uid())
    and public.is_conversation_participant(conversation_id)
  );
