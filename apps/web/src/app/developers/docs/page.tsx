export default function DocsPage() {
  const sections: Array<{ title: string; rows: Array<[string, string]> }> = [
    {
      title: "Listings",
      rows: [
        ["GET    /v1/listings", "Search across all 5 verticals"],
        ["GET    /v1/listings/:id", "Get a single listing with details"],
        ["POST   /v1/listings", "Create a listing (scope: listings:write)"],
        ["PATCH  /v1/listings/:id", "Update your listing"],
        ["DELETE /v1/listings/:id", "Delete your listing"],
      ],
    },
    {
      title: "Messages",
      rows: [
        ["GET    /v1/messages/conversations", "Your conversations, newest first"],
        ["GET    /v1/messages/conversations/:id/messages", "Messages in a thread"],
        ["POST   /v1/messages", "Send a message or start a thread"],
      ],
    },
    {
      title: "Profiles",
      rows: [
        ["GET    /v1/profiles", "Get me"],
        ["GET    /v1/profiles/:handle", "Get any profile by handle"],
        ["PATCH  /v1/profiles", "Update me"],
      ],
    },
    {
      title: "API keys (session only)",
      rows: [
        ["GET    /v1/api-keys", "List your keys"],
        ["POST   /v1/api-keys", "Mint a new key (plaintext returned once)"],
        ["DELETE /v1/api-keys/:id", "Revoke a key"],
      ],
    },
    {
      title: "MCP",
      rows: [
        ["GET  /mcp/tools", "List tools with input schemas"],
        ["POST /mcp/call", "{ name, arguments } → result"],
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">API reference</h1>
      <p className="mt-3 text-ink-mute">Auth: send either an <code>X-API-Key</code> or <code>Authorization: Bearer</code>.</p>

      {sections.map((s) => (
        <section key={s.title} className="mt-10">
          <h2 className="text-lg font-semibold">{s.title}</h2>
          <dl className="mt-4 divide-y divide-ink-line border-y border-ink-line">
            {s.rows.map(([endpoint, desc]) => (
              <div key={endpoint} className="grid grid-cols-2 gap-6 py-3 text-sm">
                <dt className="font-mono text-xs text-ink">{endpoint}</dt>
                <dd className="text-ink-mute">{desc}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
