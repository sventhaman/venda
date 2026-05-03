import Link from "next/link";
import type { Listing } from "@venda/schema";
import { formatPrice, formatTimeAgo } from "@/lib/format";
import { CardFavoriteHeart } from "./card-favorite-heart";

// Portrait-tile card matching finn.no's Torget grid: image on top (3:4
// aspect), price + title + meta below. Hierarchy by font *weight*, not size:
//   - price 16px BOLD  (text-base font-bold)
//   - title 14px regular (text-sm)
//   - meta 12px mute (text-xs text-ink-mute)
// Subtle two-stop shadow + heart-favorite affordance top-right (finn signature).
export function ListingCard({
  listing,
  isSaved = false,
  signedIn = false,
}: {
  listing: Listing;
  isSaved?: boolean;
  signedIn?: boolean;
}) {
  const image = listing.images?.[0];
  const where =
    [listing.location?.city, listing.location?.region].filter(Boolean).join(", ") || "—";

  return (
    <Link
      href={`/${listing.vertical}/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-card transition hover:shadow-card-hover"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-fog">
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? listing.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage />
        )}
        <CardFavoriteHeart
          listingId={listing.id}
          initialSaved={isSaved}
          signedIn={signedIn}
        />
        {listing.agentCreated && (
          <span className="absolute left-2 top-2 rounded bg-white/95 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-accent backdrop-blur">
            via agent
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-0.5 px-3 py-3">
        <div className="text-base font-bold tabular-nums">{formatPrice(listing.price)}</div>
        <h3 className="line-clamp-2 text-sm text-ink group-hover:underline">
          {listing.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-ink-mute">
          <span className="truncate">{where}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">
            {formatTimeAgo(listing.publishedAt ?? listing.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center text-ink-mute/50">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}
