import Link from "next/link";
import type { Listing } from "@ichiba/schema";
import { formatPrice, formatTimeAgo } from "@/lib/format";

// finn.no card hierarchy: price is the dominant element, title clamped to two
// lines, location + age as quiet metadata. Persimmon "via agent" badge is the
// only color on the card so the eye finds it immediately.
export function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.images?.[0];
  const where =
    [listing.location?.city, listing.location?.region].filter(Boolean).join(", ") || "—";

  return (
    <Link
      href={`/${listing.vertical}/${listing.id}`}
      className="group flex gap-5 rounded-xl p-3 transition hover:bg-ink-fog/60"
    >
      <div className="relative aspect-[4/3] w-48 shrink-0 overflow-hidden rounded-lg bg-ink-fog">
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? listing.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage />
        )}
        {listing.agentCreated && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-accent-ink backdrop-blur">
            via agent
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1">
        <div className="text-2xl font-semibold tracking-tight tabular-nums">
          {formatPrice(listing.price)}
        </div>
        <h3 className="line-clamp-2 text-base font-medium text-ink-soft group-hover:text-ink">
          {listing.title}
        </h3>
        <div className="mt-auto flex items-center gap-2 text-xs text-ink-mute">
          <span>{where}</span>
          <span aria-hidden>·</span>
          <span>{formatTimeAgo(listing.publishedAt ?? listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center text-ink-mute/60">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}
