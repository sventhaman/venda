import Link from "next/link";
import { SearchBar } from "@/components/search-bar";

const VERTICALS = [
  { slug: "goods", label: "Marketplace", sub: "Used clothes, furniture, anything" },
  { slug: "cars", label: "Cars", sub: "Buy or sell" },
  { slug: "realestate", label: "Real estate", sub: "Buy, sell, or rent" },
  { slug: "jobs", label: "Jobs", sub: "Find or post" },
  { slug: "services", label: "Services", sub: "Hire or offer" },
];

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
      </section>

      <section className="grid gap-3 pb-16 sm:grid-cols-2 lg:grid-cols-5">
        {VERTICALS.map((v) => (
          <Link
            key={v.slug}
            href={`/${v.slug}`}
            className="rounded-2xl border border-ink-line p-6 transition hover:border-ink hover:bg-ink-fog/50"
          >
            <div className="text-base font-semibold">{v.label}</div>
            <div className="mt-1 text-sm text-ink-mute">{v.sub}</div>
            <div className="mt-6 flex items-center text-sm text-accent">
              Browse
              <span aria-hidden className="ml-1 transition group-hover:translate-x-0.5">→</span>
            </div>
          </Link>
        ))}
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
              Mint an API key, point your agent at it, and you're trading.
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
curl https://api.ichiba.com/v1/listings?q=tesla+model+3&vertical=cars

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
