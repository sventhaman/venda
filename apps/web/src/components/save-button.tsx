"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/account/saved/actions";

export function SaveButton({
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
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!signedIn) {
      router.push(`/sign-in?error=Sign+in+to+save+listings&next=/${encodeURIComponent(`?next=back`)}`);
      return;
    }

    setError(null);
    // Optimistic flip — server action confirms or reverts.
    setSaved((s) => !s);
    startTransition(async () => {
      const res = await toggleFavorite(listingId);
      if (!res.ok) {
        setSaved((s) => !s); // revert
        setError(res.error);
        return;
      }
      setSaved(res.saved); // align with server truth
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? "Saved" : "Save listing"}
        className={
          saved
            ? "flex w-full items-center justify-center gap-2 rounded-full border border-ink bg-ink-fog py-3 text-sm font-medium text-ink hover:bg-ink-line"
            : "flex w-full items-center justify-center gap-2 rounded-full border border-ink-line py-3 text-sm hover:border-ink"
        }
      >
        <Heart filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
