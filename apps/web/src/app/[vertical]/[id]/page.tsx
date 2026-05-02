import { notFound } from "next/navigation";
import Link from "next/link";
import { getListing } from "@/lib/api";
import { formatPrice, formatTimeAgo } from "@/lib/format";
import { MessageSellerButton } from "@/components/message-seller-button";
import { SaveButton } from "@/components/save-button";
import { createClient } from "@/lib/supabase/server";
import { deleteListing } from "@/app/account/listings/actions";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ vertical: string; id: string }>;
}) {
  const { vertical, id } = await params;
  const listing = await getListing(id);
  if (!listing || listing.vertical !== vertical) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSeller = user?.id === listing.sellerId;

  // Has the current user already saved this listing? RLS limits the favorites
  // table to (auth.uid() = user_id), so this is a no-op for anon.
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
    <div className="mx-auto max-w-page px-6 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-ink-mute">
        <Link href="/" className="hover:text-ink">ichiba</Link>
        <span aria-hidden>/</span>
        <Link href={`/${listing.vertical}`} className="hover:text-ink capitalize">
          {listing.vertical}
        </Link>
        <span aria-hidden>/</span>
        <span className="line-clamp-1 text-ink">{listing.title}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <Gallery images={listing.images} title={listing.title} />

          <h1 className="mt-8 text-3xl font-semibold tracking-tight">{listing.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-ink-mute">
            <span>{where || "—"}</span>
            <span aria-hidden>·</span>
            <span>{formatTimeAgo(listing.publishedAt ?? listing.createdAt)}</span>
            {listing.agentCreated && (
              <>
                <span aria-hidden>·</span>
                <span className="rounded-full bg-ink-fog px-2 py-0.5 text-[10px] tracking-wide">
                  posted via agent
                </span>
              </>
            )}
          </div>

          <DetailsGrid listing={listing} />

          {listing.description && (
            <div className="mt-10 max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-ink-soft">
              {listing.description}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-ink-line p-6">
            <div className="text-3xl font-semibold tabular-nums">{formatPrice(listing.price)}</div>

            {isSeller ? (
              <>
                <Link
                  href={`/account/listings/${listing.id}/edit`}
                  className="mt-6 block w-full rounded-full bg-ink py-3 text-center text-sm font-medium text-white hover:bg-ink-soft"
                >
                  Edit listing
                </Link>
                <form action={deleteListing} className="mt-2">
                  <input type="hidden" name="id" value={listing.id} />
                  <input type="hidden" name="vertical" value={listing.vertical} />
                  <button
                    type="submit"
                    className="w-full rounded-full border border-ink-line py-3 text-sm text-ink-mute hover:border-red-500 hover:text-red-600"
                  >
                    Delete listing
                  </button>
                </form>
                <div className="mt-3 text-center text-[10px] uppercase tracking-widest text-ink-mute">
                  This is your listing
                </div>
              </>
            ) : (
              <>
                <div className="mt-6">
                  <MessageSellerButton listingId={listing.id} />
                </div>
                <div className="mt-2">
                  <SaveButton
                    listingId={listing.id}
                    initialSaved={initialSaved}
                    signedIn={!!user}
                  />
                </div>
              </>
            )}

            {isSeller && (
              <div className="mt-6 border-t border-ink-line pt-4 text-xs text-ink-mute">
                ID: {listing.id}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Gallery({ images, title }: { images: { url: string; alt?: string }[]; title: string }) {
  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full rounded-2xl bg-ink-fog flex items-center justify-center text-ink-mute">
        no image
      </div>
    );
  }
  const [hero, ...rest] = images;
  return (
    <div className="grid grid-cols-4 gap-2">
      <img
        src={hero!.url}
        alt={hero!.alt ?? title}
        className="col-span-4 aspect-[4/3] w-full rounded-2xl object-cover md:col-span-3"
      />
      <div className="hidden flex-col gap-2 md:flex">
        {rest.slice(0, 3).map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={img.alt ?? title}
            className="h-full w-full flex-1 rounded-xl object-cover"
          />
        ))}
      </div>
    </div>
  );
}

function DetailsGrid({ listing }: { listing: Awaited<ReturnType<typeof getListing>> }) {
  if (!listing) return null;
  const rows = detailRows(listing);
  if (rows.length === 0) return null;
  return (
    <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-ink-line pt-6 text-sm md:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-wide text-ink-mute">{label}</dt>
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
