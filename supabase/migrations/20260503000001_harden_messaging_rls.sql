-- The previous "participants insert authenticated" policy let any authed
-- user insert any (conversation_id, user_id) pair, allowing them to join
-- arbitrary threads by hitting PostgREST directly. Lock direct inserts on
-- conversation_participants and conversations down — only the SECURITY
-- DEFINER start_conversation(uuid) RPC can create them, and it pins the
-- caller to the listing's seller.

drop policy if exists "participants insert authenticated" on public.conversation_participants;
drop policy if exists "participants update own"            on public.conversation_participants;

create policy "participants update own row"
  on public.conversation_participants for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "conversations insert authenticated" on public.conversations;

drop policy if exists "messages insert" on public.messages;
create policy "messages insert"
  on public.messages for insert
  with check (
    sender_id = (select auth.uid())
    and public.is_conversation_participant(conversation_id)
  );

revoke insert on table public.conversations            from authenticated;
revoke insert on table public.conversation_participants from authenticated;
