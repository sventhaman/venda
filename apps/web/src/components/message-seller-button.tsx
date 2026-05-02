"use client";

import { useFormStatus } from "react-dom";

export function MessageSellerButton({ listingId }: { listingId: string }) {
  return (
    <form action="/messages/start" method="post">
      <input type="hidden" name="listingId" value={listingId} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-ink py-3 text-sm font-medium text-white hover:bg-ink-soft disabled:opacity-70"
    >
      {pending ? "Starting conversation…" : "Message seller"}
    </button>
  );
}
