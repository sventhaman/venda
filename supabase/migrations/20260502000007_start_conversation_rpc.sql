-- Starting a buyer↔seller conversation needs three writes that don't fit
-- cleanly into per-table RLS:
--   1. INSERT conversations
--   2. INSERT conversation_participants (me)
--   3. INSERT conversation_participants (seller — but RLS shouldn't normally
--      let me insert a row with someone else's user_id)
--
-- Doing this as a SECURITY DEFINER RPC keeps it atomic and avoids contorted
-- policies. The function uses auth.uid() so it can't be abused — a caller
-- can only ever start a thread as themselves with the seller of the listing
-- they pass in.

create or replace function public.start_conversation(_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  _user_id   uuid := auth.uid();
  _seller_id uuid;
  _convo_id  uuid;
begin
  if _user_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select seller_id into _seller_id
    from public.listings
    where id = _listing_id;

  if _seller_id is null then
    raise exception 'listing not found' using errcode = '42P01';
  end if;

  if _seller_id = _user_id then
    raise exception 'cannot start a conversation with yourself' using errcode = '42501';
  end if;

  select c.id into _convo_id
    from public.conversations c
    join public.conversation_participants p1
      on p1.conversation_id = c.id and p1.user_id = _user_id
    join public.conversation_participants p2
      on p2.conversation_id = c.id and p2.user_id = _seller_id
    where c.listing_id = _listing_id
    limit 1;

  if _convo_id is not null then
    return _convo_id;
  end if;

  insert into public.conversations (listing_id)
    values (_listing_id)
    returning id into _convo_id;

  insert into public.conversation_participants (conversation_id, user_id) values
    (_convo_id, _user_id),
    (_convo_id, _seller_id);

  return _convo_id;
end;
$$;

revoke execute on function public.start_conversation(uuid) from public, anon;
grant   execute on function public.start_conversation(uuid) to authenticated;
