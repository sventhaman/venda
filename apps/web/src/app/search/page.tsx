import Link from "next/link";
import { searchListings } from "@/lib/listings-server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ListingCard } from "@/components/listing-card";
import { SearchBar } from "@/components/search-bar";

// Cross-vertical search. The homepage SearchBar posts here when the user
// doesn't specify a vertical; /[vertical] keeps its own scoped search.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Number(sp.page ?? 1);
  const sort = (sp.sort ?? "relevance") as any;

  const supabase = await createClient();

  let result;
  try {
    result = await searchListings(supabase, {
      q,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      country: sp.country,
      region: sp.region,
      city: sp.city,
      sort: sort === "relevance" ? "newest" : sort,
      page,
      pageSize: 24,
    });
  } catch {
    result = { items: [], total: 0, page, pageSize: 24 };
  }

  const user = await getCurrentUser();
  let savedIds = new Set<string>();
  if (user && result.items.length > 0) {
    const ids = result.items.map((i) => i.id);
    const { data } = await supabase
      .from("listing_favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .in("listing_id", ids);
    savedIds = new Set((data ?? []).map((r) => r.listing_id));
  }

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="mx-auto max-w-page px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight">
        {q ? `Results for "${q}"` : "All listings"}
      </h1>

      <div className="mt-6 max-w-2xl">
        <SearchBar defaultValue={q} action="/search" />
      </div>

      <div className="mt-8 flex items-baseline justify-between border-b border-ink-line pb-3">
        <div className="text-sm text-ink-mute">
          <span className="font-medium text-ink tabular-nums">
            {result.total.toLocaleString()}
          </span>{" "}
          {result.total === 1 ? "result" : "results"}
        </div>
      </div>

      {result.items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="rounded-full bg-ink-fog p-4 text-ink-mute">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold">No matches</h2>
          <p className="mt-2 max-w-md text-sm text-ink-mute">
            {q
              ? `Nothing matched "${q}" yet. Try a broader query, or browse a vertical directly.`
              : "Browse a vertical to see what's available."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            {(["goods", "cars", "realestate", "jobs", "services"] as const).map((v) => (
              <Link
                key={v}
                href={`/${v}`}
                className="rounded-full border border-ink-line px-4 py-1.5 hover:border-ink"
              >
                {v}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {result.items.map((listing) => (
            <li key={listing.id}>
              <ListingCard
                listing={listing}
                isSaved={savedIds.has(listing.id)}
                signedIn={!!user}
              />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} q={q} />
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  q,
}: {
  page: number;
  totalPages: number;
  q: string;
}) {
  const buildHref = (p: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    qs.set("page", String(p));
    return `/search?${qs.toString()}`;
  };
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <nav className="mt-10 flex items-center justify-center gap-2 text-sm" aria-label="Pagination">
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          aria-current={p === page ? "page" : undefined}
          className={
            p === page
              ? "rounded-full bg-ink px-3 py-1.5 text-white"
              : "rounded-full border border-ink-line px-3 py-1.5 text-ink-mute hover:border-ink hover:text-ink"
          }
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
