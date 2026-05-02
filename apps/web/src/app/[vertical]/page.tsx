import { notFound } from "next/navigation";
import Link from "next/link";
import { VERTICALS, type Vertical } from "@ichiba/schema";
import { searchListings } from "@/lib/api";
import { ListingCard } from "@/components/listing-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SearchBar } from "@/components/search-bar";

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

  let result;
  try {
    result = await searchListings({
      vertical,
      q: sp.q,
      minPrice: sp.minPrice,
      maxPrice: sp.maxPrice,
      city: sp.city,
      region: sp.region,
      country: sp.country,
      sort,
      page,
      pageSize: 24,
    });
  } catch {
    result = { items: [], total: 0, page, pageSize: 24 };
  }

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

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
        <FilterSidebar vertical={vertical as Vertical} />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between border-b border-ink-line pb-3">
            <div className="text-sm text-ink-mute">
              <span className="font-medium text-ink tabular-nums">
                {result.total.toLocaleString()}
              </span>{" "}
              results
            </div>
            <SortControl current={sort} vertical={vertical} />
          </div>

          {result.items.length === 0 ? (
            <EmptyState vertical={vertical as Vertical} />
          ) : (
            <ul className="divide-y divide-ink-line">
              {result.items.map((listing) => (
                <li key={listing.id} className="py-3 first:pt-5">
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} vertical={vertical} />}
        </div>
      </div>
    </div>
  );
}

function SortControl({ current, vertical }: { current: string; vertical: string }) {
  const opts: Array<[string, string]> = [
    ["newest", "Newest"],
    ["oldest", "Oldest"],
    ["price_asc", "Price: low → high"],
    ["price_desc", "Price: high → low"],
  ];
  return (
    <form action={`/${vertical}`} className="text-sm">
      <label className="mr-2 text-ink-mute">Sort</label>
      <select
        name="sort"
        defaultValue={current}
        className="rounded border border-ink-line bg-white px-2 py-1 text-sm focus:border-ink focus:outline-none"
      >
        {opts.map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>
    </form>
  );
}

function Pagination({ page, totalPages, vertical }: { page: number; totalPages: number; vertical: string }) {
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <nav className="mt-10 flex items-center justify-center gap-2 text-sm">
      {pages.map((p) => (
        <a
          key={p}
          href={`/${vertical}?page=${p}`}
          className={
            p === page
              ? "rounded-full bg-ink px-3 py-1.5 text-white"
              : "rounded-full border border-ink-line px-3 py-1.5 text-ink-mute hover:border-ink hover:text-ink"
          }
        >
          {p}
        </a>
      ))}
    </nav>
  );
}

function EmptyState({ vertical }: { vertical: Vertical }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="text-5xl">🪷</div>
      <h2 className="mt-4 text-xl font-semibold">No listings yet</h2>
      <p className="mt-2 max-w-md text-sm text-ink-mute">
        ichiba is just getting started. Be the first to post in {VERTICAL_TITLES[vertical]} —
        or have your agent post one for you.
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
