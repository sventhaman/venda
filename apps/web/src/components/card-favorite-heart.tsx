"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/account/saved/actions";

// Small heart button that lives top-right of a listing-card image. Click to
// toggle favorite. Anon viewers get bounced to sign-in. Optimistic flip,
// reverts on server error.
//
// Stops propagation + prevents default so clicks don't navigate the parent
// <Link> wrapping the card.
export function CardFavoriteHeart({
  listingId,
  initialSaved,
  signedIn,
}: {
  listingId: string;
  initialSaved: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!signedIn) {
      router.push("/sign-in?error=Sign+in+to+save+listings");
      return;
    }

    setSaved((s) => !s);
    startTransition(async () => {
      const res = await toggleFavorite(listingId);
      if (!res.ok) setSaved((s) => !s);
      else setSaved(res.saved);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm backdrop-blur transition hover:bg-white"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={saved ? "text-accent" : "text-ink"}
        aria-hidden
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
