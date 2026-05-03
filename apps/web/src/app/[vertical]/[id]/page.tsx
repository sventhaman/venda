import { notFound } from "next/navigation";
import Link from "next/link";
import { getListing } from "@/lib/listings-server";
import { formatPrice, formatTimeAgo } from "@/lib/format";
import { MessageSellerButton } from "@/components/message-seller-button";
import { SaveButton } from "@/components/save-button";
import { DeleteListingButton } from "@/components/delete-listing-button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const VERTICAL_LABELS: Record<string, string> = {
  goods: "Marketplace",
  cars: "Cars",
  realestate: "Real estate",
  jobs: "Jobs",
  services: "Services",
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ vertical: string; id: string }>;
}) {
  const { vertical, id } = await params;
  const supabase = await createClient();

  const listing = await getListing(supabase, id);
  if (!listing || listing.vertical !== vertical) notFound();

  const user = await getCurrentUser();
  const isSeller = user?.id === listing.sellerId;

  let initialSaved = false;
  if (user) {
    const { data: fav } = await supabase
      .from("listing_favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", listing.id)
      .maybeSingle();
    initialSaved = !!fav;
  }

  const where = [listing.location?.city, listing.location?.region, listing.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-page px-6 py-6 md:py-8">
      {/* Breadcrumb (finn-style: blue links). Tightened to two levels. */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        <Link href={`/${listing.vertical}`} className="text-accent hover:underline">
          {VERTICAL_LABELS[listing.vertical] ?? listing.vertical}
        </Link>
        <span aria-hidden className="text-ink-mute">/</span>
        <span className="line-clamp-1 text-ink-mute">{listing.title}</span>
      </nav>

      {/* finn pattern: image LEFT, title + price + CTAs RIGHT (sticky-ish on desktop). */}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        <div>
          <Gallery images={listing.images} title={listing.title} />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{listing.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-mute">
              {where && <span>{where}</span>}
              {where && <span aria-hidden>·</span>}
              <span>Posted {formatTimeAgo(listing.publishedAt ?? listing.createdAt)}</span>
              {listing.agentCreated && (
                <>
                  <span aria-hidden>·</span>
                  <span className="rounded bg-accent-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-accent">
                    via agent
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3 border-y border-ink-line py-4">
            <div className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl">
              {formatPrice(listing.price)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isSeller ? (
              <>
                <Link
                  href={`/account/listings/${listing.id}/edit`}
                  className="block w-full rounded-md bg-ink py-3 text-center text-sm font-medium text-white hover:bg-ink-soft"
                >
                  Edit listing
                </Link>
                <DeleteListingButton
                  listingId={listing.id}
                  vertical={listing.vertical}
                  title={listing.title}
                  variant="block"
                />
                <div className="mt-2 text-center text-[11px] uppercase tracking-widest text-ink-mute">
                  This is your listing
                </div>
              </>
            ) : (
              <>
                <MessageSellerButton listingId={listing.id} />
                <SaveButton
                  listingId={listing.id}
                  initialSaved={initialSaved}
                  signedIn={!!user}
                />
              </>
            )}
          </div>

          <DetailsGrid listing={listing} />

          {listing.description && (
            <div className="border-t border-ink-line pt-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-ink-mute">
                Description
              </h2>
              <div className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-ink-soft">
                {listing.description}
              </div>
            </div>
          )}

          {isSeller && (
            <div className="text-xs text-ink-mute">ID: {listing.id}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Gallery({ images, title }: { images: { url: string; alt?: string }[]; title: string }) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-ink-fog text-ink-mute">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }
  const [hero, ...rest] = images;
  return (
    <div className="flex flex-col gap-2">
      <img
        src={hero!.url}
        alt={hero!.alt ?? title}
        className="aspect-[4/3] w-full rounded-lg object-cover"
      />
      {rest.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {rest.slice(0, 4).map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.alt ?? title}
              className="aspect-square w-full rounded object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DetailsGrid({ listing }: { listing: Awaited<ReturnType<typeof getListing>> }) {
  if (!listing) return null;
  const rows = detailRows(listing);
  if (rows.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-ink-line pt-5 text-sm">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-widest text-ink-mute">{label}</dt>
          <dd className="mt-0.5 font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function detailRows(listing: NonNullable<Awaited<ReturnType<typeof getListing>>>): [string, string][] {
  const d = listing.details as any;
  switch (listing.vertical) {
    case "goods":
      return [
        ["Category", d.category],
        ["Condition", d.condition],
        ...(d.brand ? ([["Brand", d.brand]] as [string, string][]) : []),
        ...(d.size ? ([["Size", d.size]] as [string, string][]) : []),
      ];
    case "cars":
      return [
        ["Make", d.make],
        ["Model", d.model],
        ["Year", String(d.year)],
        ["Mileage", d.mileageKm ? `${d.mileageKm.toLocaleString()} km` : "—"],
        ["Fuel", d.fuelType],
        ["Transmission", d.transmission],
        ["Body", d.bodyType],
      ];
    case "realestate":
      return [
        ["Type", `${d.dealType} · ${d.propertyType}`],
        ["Living area", d.livingAreaSqm ? `${d.livingAreaSqm} m²` : "—"],
        ["Bedrooms", d.bedrooms ? String(d.bedrooms) : "—"],
        ["Year built", d.yearBuilt ? String(d.yearBuilt) : "—"],
        ["Energy", d.energyRating ?? "—"],
      ];
    case "jobs":
      return [
        ["Company", d.companyName],
        ["Type", d.employmentType],
        ["Arrangement", d.workArrangement],
        ["Experience", d.experienceLevel ?? "—"],
      ];
    case "services":
      return [
        ["Category", d.category],
        ["Pricing", d.pricingModel],
        ["Remote", d.remoteAvailable ? "yes" : "no"],
      ];
  }
}
