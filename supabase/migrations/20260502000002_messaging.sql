-- ichiba: messaging.
-- Conversations are pinned to a listing (when buyer-seller) but can also be standalone.
-- Both humans and agents can send; we record `sent_by_agent` for transparency.

create table public.conversations (
  id                uuid primary key default extensions.uuid_generate_v4(),
  listing_id        uuid references public.listings(id) on delete set null,
  created_at        timestamptz not null default now(),
  last_message_at   timestamptz
);

create table public.conversation_participants (
  conversation_id   uuid not null references public.conversations(id) on delete cascade,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  joined_at         timestamptz not null default now(),
  last_read_at      timestamptz,
  primary key (conversation_id, user_id)
);

create index conversation_participants_user_idx on public.conversation_participants (user_id);

create table public.messages (
  id                uuid primary key default extensions.uuid_generate_v4(),
  conversation_id   uuid not null references public.conversations(id) on delete cascade,
  sender_id         uuid not null references public.profiles(id) on delete cascade,
  body              text not null check (char_length(body) between 1 and 10000),
  attachments       jsonb not null default '[]'::jsonb,
  sent_by_agent     boolean not null default false,
  read_at           timestamptz,
  created_at        timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at desc);
create index messages_sender_idx on public.messages (sender_id);

-- Bump last_message_at on the parent conversation whenever a message lands.
create or replace function public.messages_bump_conversation()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  update public.conversations
    set last_message_at = new.created_at
    where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_bump_trigger
  after insert on public.messages
  for each row execute function public.messages_bump_conversation();
