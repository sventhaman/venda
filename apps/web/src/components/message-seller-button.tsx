"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function MessageSellerButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const r = await fetch("/messages/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: JSON.stringify({ listingId }),
      });

      if (r.status === 401) {
        router.push(
          `/sign-in?error=Sign+in+to+message&next=${encodeURIComponent(`/messages/start?listingId=${listingId}`)}`,
        );
        return;
      }
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setError(j.error ?? "Could not start conversation");
        return;
      }
      const { id } = (await r.json()) as { id: string };
      // router.push for client navigation — no full page reload, the
      // /messages/[id] loading skeleton appears instantly.
      router.push(`/messages/${id}`);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="w-full rounded-md bg-accent py-3 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-70"
      >
        {pending ? "Starting conversation…" : "Message seller"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
