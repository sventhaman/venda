import Link from "next/link";

// API reference + MCP overview for venda.
//
// Source of truth: the actual handlers in apps/api/src/routes and
// apps/api/src/mcp. If you add or change an endpoint or tool, update this page.

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  desc: string;
  scope?: string;
  auth?: "public" | "any" | "session";
};

const REST_SECTIONS: Array<{ title: string; intro?: string; endpoints: Endpoint[] }> = [
  {
    title: "Listings",
    intro:
      "Listings span all five verticals (goods, cars, realestate, jobs, services) and share a common shape with a vertical-specific `details` object.",
    endpoints: [
      { method: "GET", path: "/v1/listings", desc: "Search across all five verticals (paginated)", auth: "public" },
      { method: "GET", path: "/v1/listings/:id", desc: "Get a single listing with vertical-specific details", auth: "public" },
      { method: "POST", path: "/v1/listings", desc: "Create a listing", scope: "listings:write" },
      { method: "PATCH", path: "/v1/listings/:id", desc: "Update fields on a listing you own", scope: "listings:write" },
      { method: "DELETE", path: "/v1/listings/:id", desc: "Delete a listing you own", scope: "listings:write" },
    ],
  },
  {
    title: "Messages",
    intro:
      "Conversations are scoped to a (buyer, seller, listing) tuple — each listing has at most one thread per buyer. Start one with listingId; resume with conversationId.",
    endpoints: [
      { method: "GET", path: "/v1/messages/conversations", desc: "Your conversations, newest first", scope: "messages:read" },
      { method: "GET", path: "/v1/messages/conversations/:id/messages", desc: "Read messages in a thread you participate in", scope: "messages:read" },
      { method: "POST", path: "/v1/messages", desc: "Send a message (use conversationId or listingId)", scope: "messages:write" },
      { method: "POST", path: "/v1/messages/conversations/:id/read", desc: "Mark a thread read up to now (idempotent)", scope: "messages:write" },
    ],
  },
  {
    title: "Profiles",
    endpoints: [
      { method: "GET", path: "/v1/profiles", desc: "Your own full profile", scope: "profile:read" },
      { method: "GET", path: "/v1/profiles/:handle", desc: "Public profile by handle", auth: "public" },
      { method: "PATCH", path: "/v1/profiles", desc: "Update your displayName / avatar / bio / country", scope: "profile:write" },
    ],
  },
  {
    title: "API keys",
    intro:
      "Key management is a session-only flow — agents cannot mint or revoke keys. Use the dashboard at /developers/keys.",
    endpoints: [
      { method: "GET", path: "/v1/api-keys", desc: "List your keys", auth: "session" },
      { method: "POST", path: "/v1/api-keys", desc: "Mint a key (plaintext returned once)", auth: "session" },
      { method: "DELETE", path: "/v1/api-keys/:id", desc: "Revoke a key", auth: "session" },
    ],
  },
  {
    title: "MCP",
    intro:
      "Single endpoint speaking the Model Context Protocol over streamable-HTTP / JSON-RPC 2.0. Same auth as REST.",
    endpoints: [
      { method: "POST", path: "/mcp", desc: "JSON-RPC 2.0 (initialize, tools/list, tools/call, …)", auth: "any" },
      { method: "GET", path: "/mcp", desc: "405 — server-initiated streams not supported", auth: "public" },
    ],
  },
];

const MCP_TOOLS: Array<{ name: string; scope: string; desc: string }> = [
  { name: "search_listings", scope: "(public)", desc: "Full-text + filter search across all 5 verticals" },
  { name: "get_listing", scope: "(public)", desc: "One listing with vertical-specific details" },
  { name: "create_listing", scope: "listings:write", desc: "Post a listing in any vertical" },
  { name: "update_listing", scope: "listings:write", desc: "Edit fields on a listing you own" },
  { name: "delete_listing", scope: "listings:write", desc: "Permanently delete a listing you own" },
  { name: "list_my_conversations", scope: "messages:read", desc: "Inbox" },
  { name: "get_messages", scope: "messages:read", desc: "Read messages in a thread" },
  { name: "send_message", scope: "messages:write", desc: "Post into a thread; start one with listingId" },
  { name: "mark_thread_read", scope: "messages:write", desc: "Mark a thread read up to now" },
  { name: "get_my_profile", scope: "profile:read", desc: "Your own profile" },
  { name: "get_profile", scope: "(public)", desc: "Lookup a profile by handle" },
  { name: "update_my_profile", scope: "profile:write", desc: "Update displayName / avatar / bio / country" },
];

const SCOPES: Array<{ value: string; covers: string }> = [
  { value: "listings:read", covers: "Reserved — search/get listings is currently public" },
  { value: "listings:write", covers: "create / update / delete listings" },
  { value: "messages:read", covers: "List conversations, read messages" },
  { value: "messages:write", covers: "Send messages, start threads, mark read" },
  { value: "profile:read", covers: "Read the key owner's full profile" },
  { value: "profile:write", covers: "Update the key owner's profile" },
];

const VERTICAL_DETAILS: Array<{ vertical: string; required: string; enums: Array<[string, string[]]> }> = [
  {
    vertical: "goods",
    required: "category, condition",
    enums: [
      ["category", ["clothing", "furniture", "electronics", "appliances", "sports_outdoors", "toys_games", "books_media", "home_garden", "tools", "kids_baby", "art_collectibles", "other"]],
      ["condition", ["new", "like_new", "good", "fair", "for_parts"]],
    ],
  },
  {
    vertical: "cars",
    required: "make, model, year, fuelType, transmission, bodyType",
    enums: [
      ["fuelType", ["petrol", "diesel", "hybrid", "phev", "electric", "lpg", "other"]],
      ["transmission", ["manual", "automatic", "semi_auto"]],
      ["bodyType", ["sedan", "hatchback", "wagon", "suv", "coupe", "convertible", "pickup", "van", "minivan", "other"]],
      ["drivetrain", ["fwd", "rwd", "awd", "4wd"]],
    ],
  },
  {
    vertical: "realestate",
    required: "dealType, propertyType",
    enums: [
      ["dealType", ["sale", "rent_long", "rent_short"]],
      ["propertyType", ["apartment", "house", "townhouse", "cabin", "plot", "commercial", "room", "other"]],
      ["ownership", ["freehold", "shared", "leasehold", "cooperative", "other"]],
    ],
  },
  {
    vertical: "jobs",
    required: "companyName, employmentType, workArrangement",
    enums: [
      ["employmentType", ["full_time", "part_time", "contract", "temporary", "internship", "freelance", "volunteer"]],
      ["workArrangement", ["onsite", "remote", "hybrid"]],
      ["experienceLevel", ["entry", "mid", "senior", "lead", "executive"]],
      ["salaryPeriod", ["hour", "month", "year"]],
    ],
  },
  {
    vertical: "services",
    required: "category, pricingModel",
    enums: [
      ["category", ["home_repair", "cleaning", "moving", "tutoring", "design", "development", "writing", "marketing", "consulting", "health_wellness", "events", "transportation", "other"]],
      ["pricingModel", ["hourly", "fixed", "daily", "project", "quote_only"]],
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">API reference</h1>
      <p className="mt-3 max-w-prose text-sm text-ink-mute">
        venda exposes the same data through two surfaces: a conventional REST API
        and a Model Context Protocol (MCP) server. AI agents typically use MCP
        because it self-describes; everyone else uses REST. Same auth, same data.
      </p>

      <SectionHeading id="auth">Authentication</SectionHeading>
      <div className="mt-3 space-y-3 text-sm text-ink-soft">
        <p>
          Two ways to authenticate, both supported on every endpoint:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Agents</strong> — mint an API key from{" "}
            <Link href="/developers/keys" className="text-accent hover:underline">
              /developers/keys
            </Link>{" "}
            and send <Code>X-API-Key: venda_…</Code> on every request.
          </li>
          <li>
            <strong>Humans</strong> — sign in at <Link href="/sign-in" className="text-accent hover:underline">/sign-in</Link> and call from a browser; the Supabase session JWT is forwarded as <Code>Authorization: Bearer …</Code>.
          </li>
        </ul>
        <p>
          Public endpoints (search listings, get listing, get profile) accept
          requests without any auth header. Each scoped endpoint below lists the
          scope an API key must include.
        </p>
      </div>

      <SectionHeading id="rest">REST</SectionHeading>
      <p className="mt-3 max-w-prose text-sm text-ink-mute">
        Base URL: <Code>https://api.venda.sh</Code> (production) or <Code>http://localhost:8787</Code> (dev).
        All bodies are JSON. Money is always an integer in the smallest currency unit (cents/øre).
      </p>

      {REST_SECTIONS.map((s) => (
        <section key={s.title} className="mt-8">
          <h3 className="text-base font-semibold">{s.title}</h3>
          {s.intro && <p className="mt-1.5 max-w-prose text-sm text-ink-mute">{s.intro}</p>}
          <dl className="mt-4 divide-y divide-ink-line border-y border-ink-line">
            {s.endpoints.map((e) => (
              <div key={`${e.method} ${e.path}`} className="grid grid-cols-1 gap-2 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6">
                <dt className="font-mono text-xs">
                  <span className={methodColor(e.method)}>{e.method}</span>{" "}
                  <span className="text-ink">{e.path}</span>
                </dt>
                <dd className="text-ink-soft">
                  {e.desc}
                  {e.scope && (
                    <span className="ml-2 inline-block rounded-full bg-ink-fog px-2 py-0.5 text-[11px] text-ink-mute">
                      scope: {e.scope}
                    </span>
                  )}
                  {e.auth === "public" && (
                    <span className="ml-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                      public
                    </span>
                  )}
                  {e.auth === "session" && (
                    <span className="ml-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                      session only
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <SectionHeading id="mcp">MCP</SectionHeading>
      <p className="mt-3 max-w-prose text-sm text-ink-mute">
        Configure your MCP client (Claude Desktop, Cursor, mcp-remote) to point at{" "}
        <Code>https://api.venda.sh/mcp</Code> with header <Code>X-API-Key: venda_…</Code>. Then call:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-ink-fog p-4 text-xs leading-relaxed">
{`POST /mcp                 (JSON-RPC 2.0)
  initialize             -> protocol + serverInfo + instructions
  tools/list             -> [ { name, description, inputSchema }, ... ]
  tools/call             -> { content, isError? }
                            params: { name, arguments }`}
      </pre>

      <h3 className="mt-8 text-base font-semibold">Tools</h3>
      <dl className="mt-4 divide-y divide-ink-line border-y border-ink-line">
        {MCP_TOOLS.map((t) => (
          <div key={t.name} className="grid grid-cols-1 gap-2 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6">
            <dt className="font-mono text-xs text-ink">{t.name}</dt>
            <dd className="text-ink-soft">
              {t.desc}
              <span className="ml-2 inline-block rounded-full bg-ink-fog px-2 py-0.5 text-[11px] text-ink-mute">
                {t.scope}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <SectionHeading id="scopes">Scopes</SectionHeading>
      <p className="mt-3 max-w-prose text-sm text-ink-mute">
        Each API key carries a set of scopes. Mint with the minimum the agent
        needs — keys can always be revoked from the dashboard.
      </p>
      <dl className="mt-4 divide-y divide-ink-line border-y border-ink-line">
        {SCOPES.map((s) => (
          <div key={s.value} className="grid grid-cols-1 gap-2 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6">
            <dt className="font-mono text-xs text-ink">{s.value}</dt>
            <dd className="text-ink-soft">{s.covers}</dd>
          </div>
        ))}
      </dl>

      <SectionHeading id="schema">Vertical detail shapes</SectionHeading>
      <p className="mt-3 max-w-prose text-sm text-ink-mute">
        Every listing has a vertical-specific <Code>details</Code> object. Required
        fields per vertical, plus the enums you'll trip over otherwise:
      </p>
      <div className="mt-6 space-y-8">
        {VERTICAL_DETAILS.map((v) => (
          <section key={v.vertical}>
            <h3 className="text-base font-semibold">{v.vertical}</h3>
            <p className="mt-1 text-sm text-ink-mute">
              <strong>Required:</strong> {v.required}
            </p>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-sm">
              {v.enums.map(([field, values]) => (
                <div key={field} className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-4">
                  <dt className="font-mono text-xs text-ink">{field}</dt>
                  <dd className="font-mono text-xs text-ink-mute">
                    {values.map((val, i) => (
                      <span key={val}>
                        {val}
                        {i < values.length - 1 && <span className="text-ink-line"> · </span>}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <SectionHeading id="examples">Examples</SectionHeading>

      <h3 className="mt-6 text-base font-semibold">Search via REST</h3>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-fog p-4 text-xs">
{`curl -s "https://api.venda.sh/v1/listings?q=tesla&vertical=cars&minPrice=20000000"`}
      </pre>

      <h3 className="mt-6 text-base font-semibold">Search via MCP</h3>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-fog p-4 text-xs leading-relaxed">
{`curl -s -X POST https://api.venda.sh/mcp \\
  -H "X-API-Key: venda_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0", "id": 1, "method": "tools/call",
    "params": {
      "name": "search_listings",
      "arguments": { "q": "tesla", "vertical": "cars" }
    }
  }'`}
      </pre>

      <h3 className="mt-6 text-base font-semibold">Create a goods listing</h3>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-fog p-4 text-xs leading-relaxed">
{`curl -s -X POST https://api.venda.sh/v1/listings \\
  -H "X-API-Key: venda_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "vertical": "goods",
    "status": "active",
    "title": "Vintage leather jacket",
    "description": "Worn lightly, size 38, smoke-free home.",
    "price": { "amount": 150000, "currency": "NOK" },
    "location": { "country": "NO", "city": "Oslo" },
    "images": [{ "url": "https://example.com/jacket.jpg" }],
    "details": {
      "category": "clothing",
      "condition": "good",
      "shippingAvailable": true
    }
  }'`}
      </pre>

      <SectionHeading id="errors">Errors</SectionHeading>
      <ul className="mt-3 space-y-2 text-sm text-ink-soft">
        <li><Code>400</Code> — body validation failed; the response includes the field-level errors and (for enum mismatches) the full set of valid values</li>
        <li><Code>401</Code> — missing or invalid API key / bearer token</li>
        <li><Code>403</Code> — authenticated but missing the required scope, or trying to act on something you don't own</li>
        <li><Code>404</Code> — not found (or not yours, for owner-scoped resources)</li>
        <li><Code>429</Code> — per-API-key rate limit exceeded; <Code>Retry-After</Code> header tells you when to retry</li>
      </ul>

      <SectionHeading id="rate-limits">Rate limits</SectionHeading>
      <p className="mt-3 max-w-prose text-sm text-ink-soft">
        Each API key has a sliding-window per-minute limit (default 120 req/min,
        configurable when you mint the key). Every authenticated response carries:
      </p>
      <ul className="mt-3 space-y-1 text-sm text-ink-soft">
        <li><Code>X-RateLimit-Limit</Code> — your configured ceiling</li>
        <li><Code>X-RateLimit-Remaining</Code> — requests left in the current window</li>
        <li><Code>X-RateLimit-Reset</Code> — unix seconds when the window rolls over</li>
      </ul>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-14 border-t border-ink-line pt-10 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-ink-fog px-1.5 py-0.5 font-mono text-[12px] text-ink">
      {children}
    </code>
  );
}

function methodColor(m: Endpoint["method"]) {
  switch (m) {
    case "GET": return "text-emerald-700";
    case "POST": return "text-blue-700";
    case "PATCH": return "text-amber-700";
    case "DELETE": return "text-rose-700";
  }
}
