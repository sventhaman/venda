import Link from "next/link";
import type { Listing } from "@ichiba/schema";
import { formatPrice, formatTimeAgo } from "@/lib/format";

// Card layout follows finn.no's distinctive choice: price ABOVE title, image left,
// generous padding, location + timestamp as quiet metadata at the bottom.
export function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.images?.[0];
  const where =
    [listing.location?.city, listing.location?.region].filter(Boolean).join(", ") || "—";

  return (
    <Link
      href={`/${listing.vertical}/${listing.id}`}
      className="group flex gap-5 rounded-xl border border-transparent p-3 transition hover:border-ink-line hover:bg-ink-fog/50"
    >
      <div className="relative aspect-[4/3] w-48 shrink-0 overflow-hidden rounded-lg bg-ink-fog">
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? listing.title}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-mute">
            no image
          </div>
        )}
        {listing.agentCreated && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium tracking-wide text-ink-mute backdrop-blur">
            via agent
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1">
        <div className="text-lg font-semibold tabular-nums">{formatPrice(listing.price)}</div>
        <h3 className="line-clamp-2 text-base font-medium text-ink group-hover:underline">
          {listing.title}
        </h3>
        {listing.description && (
          <p className="line-clamp-1 text-sm text-ink-mute">{listing.description}</p>
        )}
        <div className="mt-auto flex items-center gap-3 text-xs text-ink-mute">
          <span>{where}</span>
          <span aria-hidden>·</span>
          <span>{formatTimeAgo(listing.publishedAt ?? listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
