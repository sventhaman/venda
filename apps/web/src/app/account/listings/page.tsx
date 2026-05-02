import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatTimeAgo } from "@/lib/format";
import { deleteListing, updateListingStatus } from "./actions";

type ListingRow = {
  id: string;
  vertical: string;
  status: string;
  title: string;
  price_amount: number | null;
  price_currency: string | null;
  city: string | null;
  region: string | null;
  images: Array<{ url: string }> | null;
  agent_created: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

const STATUSES: Array<[string, string]> = [
  ["all", "All"],
  ["active", "Active"],
  ["paused", "Paused"],
  ["draft", "Draft"],
  ["sold", "Sold"],
  ["expired", "Expired"],
  ["removed", "Removed"],
];

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+see+your+listings");

  const { status: statusFilter = "all", error } = await searchParams;

  let query = supabase
    .from("listings")
    .select("id, vertical, status, title, price_amount, price_currency, city, region, images, agent_created, created_at, updated_at, published_at")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") query = query.eq("status", statusFilter);

  const { data: listings } = await query;

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My listings</h1>
          <p className="mt-2 text-sm text-ink-mute">
            Edit, pause, or delete anything you&apos;ve posted.
          </p>
        </div>
        <Link
          href="/new"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-soft"
        >
          New listing
        </Link>
      </div>

      <nav className="mt-6 flex flex-wrap gap-1.5 border-b border-ink-line pb-3 text-sm">
        {STATUSES.map(([value, label]) => (
          <Link
            key={value}
            href={value === "all" ? "/account/listings" : `/account/listings?status=${value}`}
            className={
              statusFilter === value
                ? "rounded-full bg-ink px-3 py-1 text-white"
                : "rounded-full px-3 py-1 text-ink-mute hover:bg-ink-fog"
            }
          >
            {label}
          </Link>
        ))}
      </nav>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!listings || listings.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-ink-line bg-ink-fog/50 p-12 text-center text-ink-mute">
          {statusFilter === "all"
            ? "You haven't posted anything yet."
            : `No listings with status "${statusFilter}".`}
          <div className="mt-5">
            <Link
              href="/new"
              className="rounded-full bg-ink px-5 py-2 text-sm text-white hover:bg-ink-soft"
            >
              Create your first listing
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-ink-line border-y border-ink-line">
          {listings.map((l) => (
            <Row key={l.id} listing={l as ListingRow} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ listing: l }: { listing: ListingRow }) {
  const where = [l.city, l.region].filter(Boolean).join(", ");
  const image = l.images?.[0]?.url;
  const price = l.price_amount != null && l.price_currency
    ? formatPrice({ amount: Number(l.price_amount), currency: l.price_currency as any })
    : "—";

  return (
    <li className="grid grid-cols-[5rem_1fr_auto] items-center gap-4 py-4">
      <Link href={`/${l.vertical}/${l.id}`} className="block">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="aspect-[4/3] w-20 rounded-md object-cover" />
        ) : (
          <div className="aspect-[4/3] w-20 rounded-md bg-ink-fog" />
        )}
      </Link>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${l.vertical}/${l.id}`}
            className="truncate font-medium hover:underline"
          >
            {l.title}
          </Link>
          <StatusBadge status={l.status} />
          {l.agent_created && (
            <span className="rounded-full bg-ink-fog px-2 py-0.5 text-[10px] uppercase tracking-widest text-ink-mute">
              via agent
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-ink-mute">
          <span className="capitalize">{l.vertical}</span>
          <span aria-hidden>·</span>
          <span>{price}</span>
          {where && (
            <>
              <span aria-hidden>·</span>
              <span>{where}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{formatTimeAgo(l.published_at ?? l.created_at)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5 text-xs">
        <Link
          href={`/account/listings/${l.id}/edit`}
          className="rounded-full border border-ink-line px-3 py-1 hover:border-ink"
        >
          Edit
        </Link>

        {l.status === "active" && (
          <form action={updateListingStatus}>
            <input type="hidden" name="id" value={l.id} />
            <input type="hidden" name="status" value="paused" />
            <button
              type="submit"
              className="rounded-full border border-ink-line px-3 py-1 hover:border-ink"
            >
              Pause
            </button>
          </form>
        )}

        {(l.status === "paused" || l.status === "draft" || l.status === "expired") && (
          <form action={updateListingStatus}>
            <input type="hidden" name="id" value={l.id} />
            <input type="hidden" name="status" value="active" />
            <button
              type="submit"
              className="rounded-full bg-ink px-3 py-1 text-white hover:bg-ink-soft"
            >
              Publish
            </button>
          </form>
        )}

        <form action={deleteListing}>
          <input type="hidden" name="id" value={l.id} />
          <input type="hidden" name="vertical" value={l.vertical} />
          <button
            type="submit"
            className="rounded-full border border-ink-line px-3 py-1 text-ink-mute hover:border-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const base = "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest";
  switch (status) {
    case "active":
      return <span className={`${base} bg-emerald-50 text-emerald-700`}>Active</span>;
    case "paused":
      return <span className={`${base} bg-amber-50 text-amber-700`}>Paused</span>;
    case "draft":
      return <span className={`${base} bg-ink-fog text-ink-mute`}>Draft</span>;
    case "sold":
      return <span className={`${base} bg-ink-fog text-ink-mute`}>Sold</span>;
    case "expired":
      return <span className={`${base} bg-ink-fog text-ink-mute`}>Expired</span>;
    default:
      return <span className={`${base} bg-ink-fog text-ink-mute`}>{status}</span>;
  }
}
