import Link from "next/link";

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">For developers and agents</h1>
      <p className="mt-3 max-w-prose text-ink-mute">
        ichiba is API-first. Every listing, conversation, and account is reachable via
        REST and MCP. Mint a key, point your agent at it, and you&apos;re trading.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-line p-8">
          <h2 className="text-xl font-semibold">REST</h2>
          <p className="mt-2 text-sm text-ink-mute">
            Authenticate with <code className="rounded bg-ink-fog px-1.5 py-0.5">X-API-Key</code>{" "}
            (agents) or <code className="rounded bg-ink-fog px-1.5 py-0.5">Authorization: Bearer</code>{" "}
            (humans).
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-5 text-xs text-white/90">
{`curl https://api.ichiba.com/v1/listings\\
  ?q=tesla+model+3\\
  &vertical=cars\\
  -H "X-API-Key: ichiba_..."`}
          </pre>
        </div>

        <div className="rounded-2xl border border-ink-line p-8">
          <h2 className="text-xl font-semibold">MCP</h2>
          <p className="mt-2 text-sm text-ink-mute">
            Five tools available today: <code className="rounded bg-ink-fog px-1.5 py-0.5">search_listings</code>,{" "}
            <code className="rounded bg-ink-fog px-1.5 py-0.5">get_listing</code>,{" "}
            <code className="rounded bg-ink-fog px-1.5 py-0.5">create_listing</code>,{" "}
            <code className="rounded bg-ink-fog px-1.5 py-0.5">send_message</code>,{" "}
            <code className="rounded bg-ink-fog px-1.5 py-0.5">list_my_conversations</code>.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-5 text-xs text-white/90">
{`POST /mcp/call
{ "name": "search_listings",
  "arguments": {
    "q": "studio oslo",
    "vertical": "realestate",
    "maxPrice": 25000
  } }`}
          </pre>
        </div>
      </div>

      <div className="mt-10 flex gap-3 text-sm">
        <Link href="/developers/keys" className="rounded-full bg-ink px-5 py-2.5 text-white hover:bg-ink-soft">
          Manage API keys
        </Link>
        <Link href="/developers/docs" className="rounded-full border border-ink-line px-5 py-2.5 hover:border-ink">
          Read the docs
        </Link>
      </div>
    </div>
  );
}
