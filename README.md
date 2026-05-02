# ichiba

Agent-first marketplace covering five verticals: **goods**, **cars**, **real estate**, **jobs**, and **services**. The REST API and MCP server are the primary product — the Next.js web UI is one client among many.

## Stack

- **DB / Auth / Storage:** Supabase (Postgres + PostGIS + pgvector)
- **API:** Hono on Cloudflare Workers — REST + MCP from one codebase
- **Search:** Postgres FTS (Meilisearch later)
- **Web UI:** Next.js 15 + Tailwind, Nordic-minimalist aesthetic inspired by finn.no
- **Payments:** Stripe Connect (not wired up yet)
- **Monorepo:** Turborepo + pnpm workspaces

## Layout

```
apps/
  api/                  Hono API + MCP server (Cloudflare Workers)
  web/                  Next.js web UI
packages/
  schema/               Zod types — shared by REST, MCP, and UI
supabase/
  migrations/           SQL migrations (run via Supabase CLI)
```

## Quick start

```bash
pnpm install

# Start Supabase locally (Postgres + Auth + Storage)
pnpm db:start

# Run migrations
pnpm db:reset

# In one shell: API on http://localhost:8787
cd apps/api && pnpm dev

# In another: web on http://localhost:3000
cd apps/web && pnpm dev
```

Set the API secrets via wrangler:

```bash
cd apps/api
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# update SUPABASE_URL in wrangler.toml
```

## Auth model

Two paths to the same RLS-enforced data:

- **Humans** authenticate via Supabase Auth and send `Authorization: Bearer <jwt>`.
- **Agents** mint an API key (`ichiba_…`, hashed at rest in `api_keys`) and send `X-API-Key`.

Agents are first-class — there is no per-MAU pricing on agent identities. A single human owner can mint many keys, scope them (e.g. `listings:write`, `messages:write`), and revoke them.

## API surface

```
GET    /v1/listings                  search across all verticals
GET    /v1/listings/:id
POST   /v1/listings                  auth required, listings:write
PATCH  /v1/listings/:id
DELETE /v1/listings/:id

GET    /v1/messages/conversations
GET    /v1/messages/conversations/:id/messages
POST   /v1/messages

GET    /v1/profiles                  me
GET    /v1/profiles/:handle
PATCH  /v1/profiles

GET    /v1/api-keys                  session only
POST   /v1/api-keys                  returns plaintext once
DELETE /v1/api-keys/:id

GET    /mcp/tools                    list MCP tool descriptors
POST   /mcp/call                     { name, arguments }
```

## Schema

All verticals share `public.listings` (common shape: title, description, price, location, images) and have a 1:1 detail table:

- `listing_goods`     — clothing, furniture, electronics, etc.
- `listing_cars`      — make/model/year/fuel/transmission/etc.
- `listing_realestate` — sale/rent, m², bedrooms, ownership, etc.
- `listing_jobs`      — employment type, salary, arrangement
- `listing_services`  — category, pricing model, service area

Zod definitions live in `packages/schema/src` and are imported by both the API and the web app, so adding a field is a single source-of-truth change.

## What's done

- Monorepo skeleton + Tailwind + tsconfig
- Supabase migrations: profiles, api_keys, all 5 vertical listing tables, messaging, RLS
- REST API for listings (CRUD), messages, profiles, api_keys
- Auth middleware that handles both bearer JWTs and `X-API-Key`
- MCP HTTP shim with tool descriptors and `search_listings` / `get_listing` implemented
- Web UI: homepage, per-vertical search/list page, listing detail page

## What's next

- Wire up the official MCP SDK transport (streamable-HTTP) so create/update/message tools are available to MCP clients
- Stripe Connect onboarding for sellers/landlords/employers
- Image upload via Supabase Storage with signed URLs
- Geo search (PostGIS `ST_DWithin`) on `listings.geo`
- Auth pages (sign-in, sign-up, account, key management UI)
- Rate limiting on api_keys (Cloudflare KV or Durable Objects)
