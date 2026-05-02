import { notFound } from "next/navigation";
import Link from "next/link";
import { getListing } from "@/lib/api";
import { formatPrice, formatTimeAgo } from "@/lib/format";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ vertical: string; id: string }>;
}) {
  const { vertical, id } = await params;
  const listing = await getListing(id);
  if (!listing || listing.vertical !== vertical) notFound();

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
            <form action="/messages/start" method="post" className="mt-6">
              <input type="hidden" name="listingId" value={listing.id} />
              <button
                type="submit"
                className="w-full rounded-full bg-ink py-3 text-sm font-medium text-white hover:bg-ink-soft"
              >
                Message seller
              </button>
            </form>
            <button className="mt-2 w-full rounded-full border border-ink-line py-3 text-sm hover:border-ink">
              Save
            </button>
            <div className="mt-6 border-t border-ink-line pt-4 text-xs text-ink-mute">
              ID: {listing.id}
            </div>
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
