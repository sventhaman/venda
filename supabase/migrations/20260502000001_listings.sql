-- ichiba: listings + per-vertical detail tables.
-- Single canonical `listings` table holds the common shape; one detail table per vertical
-- holds typed fields. This keeps queries fast for cross-vertical search and clean
-- when filtering by vertical-specific attributes.

create type vertical as enum ('goods', 'cars', 'realestate', 'jobs', 'services');
create type listing_status as enum ('draft', 'active', 'paused', 'sold', 'expired', 'removed');
create type currency_code as enum ('NOK', 'USD', 'EUR', 'GBP', 'SEK', 'DKK');

create table public.listings (
  id              uuid primary key default extensions.uuid_generate_v4(),
  vertical        vertical not null,
  status          listing_status not null default 'draft',
  title           text not null check (char_length(title) between 3 and 200),
  description     text check (char_length(description) <= 20000),
  price_amount    bigint check (price_amount >= 0),
  price_currency  currency_code,
  country_code    char(2),
  region          text,
  city            text,
  postal_code     text,
  geo             extensions.geography(point, 4326),
  images          jsonb not null default '[]'::jsonb,
  seller_id       uuid not null references public.profiles(id) on delete cascade,
  agent_created   boolean not null default false,
  -- Full-text search vector kept in sync via trigger.
  search          tsvector,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz,
  expires_at      timestamptz
);

create index listings_vertical_status_idx on public.listings (vertical, status, published_at desc);
create index listings_seller_idx on public.listings (seller_id);
create index listings_geo_idx on public.listings using gist (geo);
create index listings_search_idx on public.listings using gin (search);
create index listings_country_region_idx on public.listings (country_code, region);

create or replace function public.listings_update_search()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.search :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.city, '') || ' ' || coalesce(new.region, '')), 'C');
  new.updated_at := now();
  return new;
end;
$$;

create trigger listings_search_trigger
  before insert or update on public.listings
  for each row execute function public.listings_update_search();

-- Per-vertical detail tables. Each row 1:1 with public.listings.
-- We use cascade delete so detail rows die with the parent listing.

create type goods_condition as enum ('new', 'like_new', 'good', 'fair', 'for_parts');

create table public.listing_goods (
  listing_id          uuid primary key references public.listings(id) on delete cascade,
  category            text not null,
  condition           goods_condition not null,
  brand               text,
  size                text,
  color               text,
  shipping_available  boolean not null default false,
  pickup_only         boolean not null default false
);

create type fuel_type as enum ('petrol', 'diesel', 'hybrid', 'phev', 'electric', 'lpg', 'other');
create type transmission as enum ('manual', 'automatic', 'semi_auto');
create type body_type as enum ('sedan','hatchback','wagon','suv','coupe','convertible','pickup','van','minivan','other');
create type drivetrain as enum ('fwd','rwd','awd','4wd');

create table public.listing_cars (
  listing_id            uuid primary key references public.listings(id) on delete cascade,
  make                  text not null,
  model                 text not null,
  year                  int not null,
  mileage_km            int,
  fuel_type             fuel_type not null,
  transmission          transmission not null,
  body_type             body_type not null,
  drivetrain            drivetrain,
  engine_power_hp       int,
  engine_size_cc        int,
  exterior_color        text,
  interior_color        text,
  vin                   text,
  registration_number   text,
  first_registration    date,
  number_of_owners      int,
  has_service_history   boolean,
  accident_free         boolean
);

create index listing_cars_make_model_year_idx on public.listing_cars (make, model, year);

create type property_deal_type as enum ('sale', 'rent_long', 'rent_short');
create type property_type as enum ('apartment','house','townhouse','cabin','plot','commercial','room','other');
create type ownership_type as enum ('freehold','shared','leasehold','cooperative','other');

create table public.listing_realestate (
  listing_id              uuid primary key references public.listings(id) on delete cascade,
  deal_type               property_deal_type not null,
  property_type           property_type not null,
  ownership               ownership_type,
  living_area_sqm         numeric,
  plot_area_sqm           numeric,
  bedrooms                int,
  bathrooms               int,
  rooms                   int,
  year_built              int,
  energy_rating           text,
  floor                   int,
  has_elevator            boolean,
  has_balcony             boolean,
  has_garden              boolean,
  has_parking             boolean,
  furnished               boolean,
  monthly_costs_amount    bigint,
  monthly_costs_currency  currency_code,
  deposit_amount          bigint,
  deposit_currency        currency_code,
  available_from          date,
  minimum_stay_months     int
);

create index listing_realestate_deal_type_idx on public.listing_realestate (deal_type, property_type);

create type employment_type as enum ('full_time','part_time','contract','temporary','internship','freelance','volunteer');
create type work_arrangement as enum ('onsite','remote','hybrid');
create type experience_level as enum ('entry','mid','senior','lead','executive');
create type salary_period as enum ('hour','month','year');

create table public.listing_jobs (
  listing_id              uuid primary key references public.listings(id) on delete cascade,
  company_name            text not null,
  employment_type         employment_type not null,
  work_arrangement        work_arrangement not null,
  experience_level        experience_level,
  industry                text,
  function                text,
  salary_min_amount       bigint,
  salary_max_amount       bigint,
  salary_currency         currency_code,
  salary_period           salary_period,
  application_url         text,
  application_deadline    date,
  start_date              date,
  requirements            text[],
  benefits                text[]
);

create index listing_jobs_arrangement_idx on public.listing_jobs (work_arrangement, employment_type);

create type pricing_model as enum ('hourly','fixed','daily','project','quote_only');

create table public.listing_services (
  listing_id              uuid primary key references public.listings(id) on delete cascade,
  category                text not null,
  pricing_model           pricing_model not null,
  rate_amount             bigint,
  rate_currency           currency_code,
  remote_available        boolean not null default false,
  service_area            text[],
  response_time_hours     int,
  years_of_experience     int,
  credentials             text[]
);

-- Favorites.
create table public.listing_favorites (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  listing_id   uuid not null references public.listings(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index listing_favorites_listing_idx on public.listing_favorites (listing_id);
