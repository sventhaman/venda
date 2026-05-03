import { notFound } from "next/navigation";
import Link from "next/link";
import { VERTICALS, type Vertical } from "@ichiba/schema";
import { searchListings } from "@/lib/listings-server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ListingCard } from "@/components/listing-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SearchBar } from "@/components/search-bar";
import { SortControl } from "./sort-control";

const VERTICAL_TITLES: Record<Vertical, string> = {
  goods: "Marketplace",
  cars: "Cars",
  realestate: "Real estate",
  jobs: "Jobs",
  services: "Services",
};

export default async function VerticalPage({
  params,
  searchParams,
}: {
  params: Promise<{ vertical: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { vertical } = await params;
  if (!VERTICALS.includes(vertical as Vertical)) notFound();

  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const sort = sp.sort ?? "newest";

  const supabase = await createClient();
  // Per-vertical detail filters from the URL. Only the keys that match the
  // current vertical are read; everything else stays in the URL but is ignored
  // by the search.
  const v = vertical as Vertical;
  const details = {
    goods: v === "goods" ? { category: sp.category, condition: sp.condition } : undefined,
    cars:
      v === "cars"
        ? {
            fuelType: sp.fuelType,
            transmission: sp.transmission,
            bodyType: sp.bodyType,
          }
        : undefined,
    realestate:
      v === "realestate"
        ? { dealType: sp.dealType, propertyType: sp.propertyType }
        : undefined,
    jobs:
      v === "jobs"
        ? { employmentType: sp.employmentType, workArrangement: sp.workArrangement }
        : undefined,
    services:
      v === "services"
        ? { category: sp.category, pricingModel: sp.pricingModel }
        : undefined,
  };

  let result;
  try {
    result = await searchListings(supabase, {
      vertical,
      q: sp.q,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      city: sp.city,
      region: sp.region,
      country: sp.country,
      sort: sort as any,
      page,
      pageSize: 24,
      details,
    });
  } catch {
    result = { items: [], total: 0, page, pageSize: 24 };
  }

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  // Pre-fetch the user's saved listing ids that intersect this page's results,
  // so each card can render its heart in the correct state without a per-card
  // round trip. RLS gates favorites to the caller's own rows, so this is a
  // no-op for anon viewers.
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

  return (
    <div className="mx-auto max-w-page px-6 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-ink-mute">
        <Link href="/" className="hover:text-ink">ichiba</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{VERTICAL_TITLES[vertical as Vertical]}</span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">
        {VERTICAL_TITLES[vertical as Vertical]}
      </h1>

      <div className="mt-6 max-w-2xl">
        <SearchBar defaultValue={sp.q} action={`/${vertical}`} />
      </div>

      <div className="mt-10 flex gap-10">
        <FilterSidebar vertical={vertical as Vertical} selected={sp} />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3 border-b border-ink-line pb-3">
            <div className="text-sm text-ink-mute">
              <span className="font-medium text-ink tabular-nums">
                {result.total.toLocaleString()}
              </span>{" "}
              results
            </div>
            <SortControl current={sort} />
          </div>

          {result.items.length === 0 ? (
            <EmptyState vertical={vertical as Vertical} />
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
            <Pagination
              page={page}
              totalPages={totalPages}
              vertical={vertical}
              params={sp}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  vertical,
  params,
}: {
  page: number;
  totalPages: number;
  vertical: string;
  params: Record<string, string | undefined>;
}) {
  // Preserve all current search params on each page link — switching pages
  // shouldn't reset the active query, sort, or filters.
  const buildHref = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") qs.set(k, v);
    }
    qs.set("page", String(p));
    return `/${vertical}?${qs.toString()}`;
  };

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
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

function EmptyState({ vertical }: { vertical: Vertical }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="rounded-full bg-ink-fog p-4 text-ink-mute">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold">No listings yet</h2>
      <p className="mt-2 max-w-md text-sm text-ink-mute">
        Nothing in {VERTICAL_TITLES[vertical].toLowerCase()} matches yet. Be the first to
        post — or have your agent post one for you.
      </p>
      <Link
        href="/new"
        className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm text-white hover:bg-ink-soft"
      >
        Create a listing
      </Link>
    </div>
  );
}
