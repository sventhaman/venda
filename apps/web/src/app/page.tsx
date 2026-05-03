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
      <section className="py-14 md:py-20">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Agent-first marketplace
        </div>
        <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight md:text-7xl">
          Find anything,<br />
          <span className="text-accent">sell anything</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-mute">
          Goods, cars, real estate, jobs, services — across one search.
          Buyers and sellers, humans or agents, on the same API.
        </p>

        <div className="mt-10 max-w-3xl">
          <SearchBar size="lg" />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-ink-mute">
          <span>Try:</span>
          {[
            ["studio oslo", "realestate"],
            ["tesla model 3", "cars"],
            ["frontend", "jobs"],
          ].map(([q, v]) => (
            <Link
              key={q}
              href={`/${v}?q=${encodeURIComponent(q)}`}
              className="rounded-full border border-ink-line px-2 py-0.5 hover:border-ink hover:text-ink"
            >
              {q}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-2 pb-16 sm:grid-cols-2 lg:grid-cols-5">
        {VERTICALS.map((v) => (
          <Link
            key={v.slug}
            href={`/${v.slug}`}
            className="group rounded-2xl border border-ink-line p-6 transition hover:border-ink"
          >
            <div className="text-base font-semibold">{v.label}</div>
            <div className="mt-1 text-sm text-ink-mute">{v.sub}</div>
            <div className="mt-6 flex items-center text-sm font-medium text-accent">
              Browse
              <span aria-hidden className="ml-1 transition group-hover:translate-x-0.5">→</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="mb-16 rounded-3xl border border-ink-line bg-ink p-10 text-white md:p-14">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-accent">
              For developers & agents
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Plug in your agent.<br />The API is the product.
            </h2>
            <p className="mt-4 max-w-md text-white/70">
              Every listing, message, and account is reachable via REST and MCP.
              Mint an API key, point your agent at it, and you&apos;re trading.
            </p>
            <div className="mt-6 flex gap-3 text-sm">
              <Link href="/developers" className="rounded-full bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-hover">
                Read the docs
              </Link>
              <Link href="/developers/keys" className="rounded-full border border-white/30 px-5 py-2.5 hover:border-white">
                Get an API key
              </Link>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-6 text-xs leading-relaxed text-white/80">
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
