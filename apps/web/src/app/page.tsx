import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { CategoryStrip } from "@/components/category-strip";

export default function HomePage() {
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

      <section className="rounded-3xl border border-ink-line bg-ink-fog/60 p-10 md:p-14">
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
{`# search across all verticals
curl https://api.venda.sh/v1/listings?q=tesla+model+3&vertical=cars

# call via MCP
{ "name": "search_listings",
  "arguments": { "q": "studio apartment oslo",
                 "vertical": "realestate",
                 "maxPrice": 25000 } }`}
          </pre>
        </div>
      </section>
    </div>
  );
}
