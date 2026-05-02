-- ichiba: Row Level Security.
-- Both human (auth.uid()) and agent (api_key middleware sets a JWT claim mapping to owner)
-- paths funnel through auth.uid(), so policies remain unified.

alter table public.profiles                 enable row level security;
alter table public.api_keys                 enable row level security;
alter table public.listings                 enable row level security;
alter table public.listing_goods            enable row level security;
alter table public.listing_cars             enable row level security;
alter table public.listing_realestate       enable row level security;
alter table public.listing_jobs             enable row level security;
alter table public.listing_services         enable row level security;
alter table public.listing_favorites        enable row level security;
alter table public.conversations            enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages                 enable row level security;

-- Profiles: anyone can read; owner can update.
create policy "profiles read all"
  on public.profiles for select
  using (true);

create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id);

-- API keys: only the owner can see or manage their keys.
create policy "api_keys owner only"
  on public.api_keys for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

-- Listings: anyone can read active listings; sellers can read/manage their own at any status.
create policy "listings read public"
  on public.listings for select
  using (status = 'active' or auth.uid() = seller_id);

create policy "listings insert own"
  on public.listings for insert
  with check (auth.uid() = seller_id);

create policy "listings update own"
  on public.listings for update
  using (auth.uid() = seller_id);

create policy "listings delete own"
  on public.listings for delete
  using (auth.uid() = seller_id);

-- Per-vertical detail tables follow the parent's visibility/ownership.
create policy "listing_goods read public"
  on public.listing_goods for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_goods.listing_id
      and (l.status = 'active' or l.seller_id = auth.uid())
  ));

create policy "listing_goods write own"
  on public.listing_goods for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_goods.listing_id and l.seller_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_goods.listing_id and l.seller_id = auth.uid()
  ));

create policy "listing_cars read public"
  on public.listing_cars for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_cars.listing_id
      and (l.status = 'active' or l.seller_id = auth.uid())
  ));

create policy "listing_cars write own"
  on public.listing_cars for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_cars.listing_id and l.seller_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_cars.listing_id and l.seller_id = auth.uid()
  ));

create policy "listing_realestate read public"
  on public.listing_realestate for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_realestate.listing_id
      and (l.status = 'active' or l.seller_id = auth.uid())
  ));

create policy "listing_realestate write own"
  on public.listing_realestate for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_realestate.listing_id and l.seller_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_realestate.listing_id and l.seller_id = auth.uid()
  ));

create policy "listing_jobs read public"
  on public.listing_jobs for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_jobs.listing_id
      and (l.status = 'active' or l.seller_id = auth.uid())
  ));

create policy "listing_jobs write own"
  on public.listing_jobs for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_jobs.listing_id and l.seller_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_jobs.listing_id and l.seller_id = auth.uid()
  ));

create policy "listing_services read public"
  on public.listing_services for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_services.listing_id
      and (l.status = 'active' or l.seller_id = auth.uid())
  ));

create policy "listing_services write own"
  on public.listing_services for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_services.listing_id and l.seller_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_services.listing_id and l.seller_id = auth.uid()
  ));

-- Favorites: each user manages their own.
create policy "favorites own"
  on public.listing_favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Messaging: conversations and messages visible only to participants.
create policy "conversations participants read"
  on public.conversations for select
  using (exists (
    select 1 from public.conversation_participants p
    where p.conversation_id = conversations.id and p.user_id = auth.uid()
  ));

create policy "conversations insert authenticated"
  on public.conversations for insert
  with check (auth.uid() is not null);

create policy "participants self read"
  on public.conversation_participants for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.conversation_participants me
      where me.conversation_id = conversation_participants.conversation_id
        and me.user_id = auth.uid()
    )
  );

create policy "participants insert authenticated"
  on public.conversation_participants for insert
  with check (auth.uid() is not null);

create policy "participants update own"
  on public.conversation_participants for update
  using (user_id = auth.uid());

create policy "messages read participants"
  on public.messages for select
  using (exists (
    select 1 from public.conversation_participants p
    where p.conversation_id = messages.conversation_id and p.user_id = auth.uid()
  ));

create policy "messages insert participants"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversation_participants p
      where p.conversation_id = messages.conversation_id and p.user_id = auth.uid()
    )
  );
