# venda

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
- **Agents** mint an API key (`venda_…`, hashed at rest in `api_keys`) and send `X-API-Key`.

Agents are first-class — there is no per-MAU pricing on agent identities. A single human owner can mint many keys, scope them (e.g. `listings:write`, `messages:write`), and revoke them.

## API surface

```
# Listings
GET    /v1/listings                          public — paginated search
GET    /v1/listings/:id                      public — one listing + details
POST   /v1/listings                          listings:write
PATCH  /v1/listings/:id                      listings:write (own only)
DELETE /v1/listings/:id                      listings:write (own only)

# Messages
GET    /v1/messages/conversations            messages:read
GET    /v1/messages/conversations/:id/messages   messages:read
POST   /v1/messages                          messages:write
POST   /v1/messages/conversations/:id/read   messages:write — mark read

# Profiles
GET    /v1/profiles                          profile:read — your own
GET    /v1/profiles/:handle                  public — by handle
PATCH  /v1/profiles                          profile:write

# API keys (session only — agents can't mint or revoke keys)
GET    /v1/api-keys                          list your keys
POST   /v1/api-keys                          mint (plaintext returned once)
DELETE /v1/api-keys/:id                      revoke

# MCP
POST   /mcp                                  JSON-RPC 2.0 (any auth)
```

All money is integers in the smallest currency unit (cents/øre). 100 NOK = 10000.

## MCP server

venda speaks the [Model Context Protocol](https://modelcontextprotocol.io)
over the streamable-HTTP transport at a single endpoint:

```
POST https://api.venda.sh/mcp     (JSON-RPC 2.0)
GET  https://api.venda.sh/mcp     (405 — no server-initiated streams)
```

Auth is the same as REST: send `X-API-Key: venda_…` (agents) or
`Authorization: Bearer <jwt>` (humans) on every JSON-RPC request.

### Tools

| Tool | Required scope | Purpose |
|---|---|---|
| `search_listings` | (public) | Full-text + filter search across all 5 verticals |
| `get_listing` | (public) | Fetch one listing with vertical-specific details |
| `create_listing` | `listings:write` | Post a new listing (any vertical) |
| `update_listing` | `listings:write` | Edit fields on a listing the caller owns |
| `delete_listing` | `listings:write` | Delete a listing the caller owns |
| `list_my_conversations` | `messages:read` | Inbox |
| `get_messages` | `messages:read` | Read all messages in a thread |
| `send_message` | `messages:write` | Send/start a thread with a seller |
| `mark_thread_read` | `messages:write` | Mark a thread as read up to now |
| `get_my_profile` | `profile:read` | The caller's own profile |
| `get_profile` | (public) | Lookup a profile by handle |
| `update_my_profile` | `profile:write` | Update display name, avatar, bio, country |

### Configuring an MCP client

**Cursor / Claude Desktop** (or anything reading the standard MCP config):

```jsonc
{
  "mcpServers": {
    "venda": {
      "url": "https://api.venda.sh/mcp",
      "headers": { "X-API-Key": "venda_..." }
    }
  }
}
```

**stdio-only clients** (older Claude Desktop): bridge with [mcp-remote](https://www.npmjs.com/package/mcp-remote):

```jsonc
{
  "mcpServers": {
    "venda": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://api.venda.sh/mcp",
               "--header", "X-API-Key:venda_..."]
    }
  }
}
```

**Curl smoke-test:**

```bash
KEY=venda_...
curl -s -X POST http://localhost:8787/mcp \
  -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
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
- MCP server speaking streamable-HTTP / JSON-RPC 2.0 with all five tools wired up
- Web UI: homepage, per-vertical search/list page, listing detail page

## What's next

- Stripe Connect onboarding for sellers/landlords/employers
- Image upload via Supabase Storage with signed URLs
- Geo search (PostGIS `ST_DWithin`) on `listings.geo`
- Auth pages (sign-in, sign-up, account, key management UI)
- Rate limiting on api_keys (Cloudflare KV or Durable Objects)
