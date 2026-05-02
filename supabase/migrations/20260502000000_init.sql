-- ichiba: initial schema
-- Profiles, account types, agent api_keys.

create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "postgis"   with schema extensions;
create extension if not exists "pgcrypto"  with schema extensions;
create extension if not exists "vector"    with schema extensions;

-- Account types: humans (personal/business) vs agents.
create type account_type as enum ('personal', 'business', 'agent');

-- Each auth.users row gets a public profile.
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  handle          text unique not null check (handle ~ '^[a-z0-9_-]{3,40}$'),
  display_name    text not null,
  account_type    account_type not null default 'personal',
  avatar_url      text,
  bio             text,
  country_code    char(2),
  is_verified     boolean not null default false,
  rating_avg      numeric(3,2),
  rating_count    int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index profiles_handle_idx on public.profiles (handle);

-- Auto-create profile on signup. Handle defaults to derived value; user can change later.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, handle, display_name, account_type)
  values (
    new.id,
    coalesce(
      lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_-]', '', 'g')),
      'user_' || substr(new.id::text, 1, 8)
    ) || '_' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'User'),
    coalesce((new.raw_user_meta_data->>'account_type')::account_type, 'personal')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Agent API keys. The product is agent-first; a single human owner can mint many keys.
-- We store only a hash of the key. The plaintext is shown to the user once at creation.
create table public.api_keys (
  id                      uuid primary key default extensions.uuid_generate_v4(),
  owner_user_id           uuid not null references auth.users(id) on delete cascade,
  label                   text not null,
  prefix                  text not null,           -- first ~8 chars, displayable
  key_hash                text not null unique,    -- sha256 of full key
  scopes                  text[] not null default '{}',
  rate_limit_per_minute   int not null default 120,
  expires_at              timestamptz,
  last_used_at            timestamptz,
  created_at              timestamptz not null default now(),
  revoked_at              timestamptz
);

create index api_keys_owner_idx on public.api_keys (owner_user_id) where revoked_at is null;
create index api_keys_hash_idx on public.api_keys (key_hash);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
