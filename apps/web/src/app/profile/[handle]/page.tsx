import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ListingCard } from "@/components/listing-card";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, handle, display_name, account_type, avatar_url, bio, country_code, is_verified, rating_avg, rating_count, created_at",
    )
    .eq("handle", handle)
    .maybeSingle();

  if (!profile) notFound();

  // Active listings authored by this seller, with embedded detail rows
  // (only the matching vertical's row is populated).
  const { data: rows } = await supabase
    .from("listings")
    .select(
      `*,
       listing_goods(*),
       listing_cars(*),
       listing_realestate(*),
       listing_jobs(*),
       listing_services(*)`.replace(/\s+/g, " "),
    )
    .eq("seller_id", profile.id)
    .eq("status", "active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(48);

  const items = (rows ?? []).map(rowToListing);
  const total = items.length;

  const me = await getCurrentUser();
  let savedIds = new Set<string>();
  if (me && items.length > 0) {
    const ids = items.map((i) => i.id);
    const { data } = await supabase
      .from("listing_favorites")
      .select("listing_id")
      .eq("user_id", me.id)
      .in("listing_id", ids);
    savedIds = new Set((data ?? []).map((r) => r.listing_id));
  }

  const initial =
    (profile.display_name ?? profile.handle ?? "?").trim().charAt(0).toUpperCase() || "?";
  const memberSince = new Date(profile.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
  const isSelf = me?.id === profile.id;

  return (
    <div className="mx-auto max-w-page px-6 py-10">
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-ink-fog text-3xl font-medium text-ink-mute">
            {initial}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {profile.display_name ?? `@${profile.handle}`}
            </h1>
            {profile.is_verified && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                Verified
              </span>
            )}
            {profile.account_type !== "personal" && (
              <span className="rounded-full bg-ink-fog px-2 py-0.5 text-xs uppercase tracking-widest text-ink-mute">
                {profile.account_type}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-ink-mute">@{profile.handle}</div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-mute">
            <span>Member since {memberSince}</span>
            {profile.country_code && <span>· {profile.country_code}</span>}
            {profile.rating_count > 0 && profile.rating_avg != null && (
              <span>
                · {Number(profile.rating_avg).toFixed(1)} from {profile.rating_count}{" "}
                {profile.rating_count === 1 ? "review" : "reviews"}
              </span>
            )}
          </div>
        </div>

        {isSelf && (
          <Link
            href="/account/edit"
            className="rounded-full border border-ink-line px-4 py-2 text-sm hover:border-ink"
          >
            Edit profile
          </Link>
        )}
      </header>

      {profile.bio && (
        <p className="mt-6 max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-ink-soft">
          {profile.bio}
        </p>
      )}

      <section className="mt-12">
        <div className="flex items-baseline justify-between border-b border-ink-line pb-3">
          <h2 className="text-lg font-semibold">
            {total === 1 ? "1 active listing" : `${total} active listings`}
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-ink-line bg-ink-fog/50 p-12 text-center text-ink-mute">
            {profile.display_name ?? `@${profile.handle}`} doesn&apos;t have any active
            listings right now.
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((listing) => (
              <li key={listing.id}>
                <ListingCard
                  listing={listing as any}
                  isSaved={savedIds.has(listing.id)}
                  signedIn={!!me}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function rowToListing(row: any) {
  const detailKey: Record<string, string> = {
    goods: "listing_goods",
    cars: "listing_cars",
    realestate: "listing_realestate",
    jobs: "listing_jobs",
    services: "listing_services",
  };
  const d = row[detailKey[row.vertical] ?? ""] ?? null;
  return {
    id: row.id,
    vertical: row.vertical,
    status: row.status,
    title: row.title,
    description: row.description ?? undefined,
    price:
      row.price_amount != null && row.price_currency
        ? { amount: Number(row.price_amount), currency: row.price_currency }
        : undefined,
    location: row.country_code
      ? {
          country: row.country_code,
          region: row.region ?? undefined,
          city: row.city ?? undefined,
          postalCode: row.postal_code ?? undefined,
        }
      : undefined,
    images: row.images ?? [],
    sellerId: row.seller_id,
    agentCreated: row.agent_created,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? null,
    expiresAt: row.expires_at ?? null,
    details: d ?? {},
  };
}
