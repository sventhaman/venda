import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { CategoryStrip } from "@/components/category-strip";
import { ListingCard } from "@/components/listing-card";
import { searchListings } from "@/lib/listings-server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  // Mirror finn.no's "Populære annonser" — a 12-tile grid of recent listings
  // mixed across all five verticals. Helps the homepage feel like a marketplace
  // instead of an empty landing page, and gives a buyer something to click on
  // before they've decided which vertical they want.
  const supabase = await createClient();
  const user = await getCurrentUser();
  const [{ items: recent, total }, savedSet] = await Promise.all([
    searchListings(supabase, { pageSize: 12, sort: "newest" }),
    user
      ? supabase
          .from("listing_favorites")
          .select("listing_id")
          .eq("user_id", user.id)
          .then(({ data }) => new Set((data ?? []).map((r) => r.listing_id as string)))
      : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="mx-auto max-w-page px-6">
      <section className="py-16 md:py-24">
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          The marketplace<br />for humans <span className="text-ink-mute">and agents</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-mute">
          Buy and sell goods, cars, real estate. Find jobs and services. Connect through the
          web — or wire your agent directly into our API and MCP server.
        </p>

        <div className="mt-10 max-w-2xl">
          <SearchBar />
        </div>

        <div className="mt-10 max-w-3xl">
          <CategoryStrip />
        </div>
      </section>

      {recent.length > 0 && (
        <section className="pb-20">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Recent listings</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {recent.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                signedIn={!!user}
                isSaved={savedSet.has(l.id)}
              />
            ))}
          </div>
          {total > recent.length && (
            <div className="mt-10 flex justify-center">
              <Link
                href="/search"
                className="rounded-full border border-ink-line px-7 py-3 text-sm font-medium hover:border-ink hover:bg-ink-fog/60"
              >
                Show more ({total} listings)
              </Link>
            </div>
          )}
        </section>
      )}

      <section className="mb-20 rounded-3xl border border-ink-line bg-ink-fog/60 p-10 md:p-14">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-ink-mute">
              For developers & agents
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Plug in your agent.<br />The API is the product.
            </h2>
            <p className="mt-4 max-w-md text-ink-mute">
              Every listing, message, and account is reachable via REST and MCP.
              Mint an API key, point your agent at it, and you&apos;re trading.
            </p>
            <div className="mt-6 flex gap-3 text-sm">
              <Link href="/developers" className="rounded-full bg-ink px-5 py-2.5 text-white hover:bg-ink-soft">
                Read the docs
              </Link>
              <Link href="/developers/keys" className="rounded-full border border-ink-line px-5 py-2.5 hover:border-ink">
                Get an API key
              </Link>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-2xl bg-ink p-6 text-xs leading-relaxed text-white/90">
{`# search across all verticals (REST, public)
curl "https://api.venda.sh/v1/listings?q=tesla+model+3&vertical=cars"

# same search over MCP (JSON-RPC 2.0)
curl -X POST https://api.venda.sh/mcp \\
  -H "X-API-Key: venda_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0", "id": 1, "method": "tools/call",
    "params": {
      "name": "search_listings",
      "arguments": {
        "q": "studio apartment oslo",
        "vertical": "realestate",
        "maxPrice": 2500000
      }
    }
  }'`}
          </pre>
        </div>
      </section>
    </div>
  );
}
