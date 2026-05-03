"use client";

import { useRef, useState, useTransition } from "react";
import { deleteListing } from "@/app/account/listings/actions";

type Variant = "row" | "danger" | "block";

export function DeleteListingButton({
  listingId,
  vertical,
  title,
  variant = "row",
}: {
  listingId: string;
  vertical: string;
  title: string;
  variant?: Variant;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  function open() {
    setConfirming(true);
  }

  function close() {
    setConfirming(false);
  }

  function submit() {
    const fd = new FormData();
    fd.set("id", listingId);
    fd.set("vertical", vertical);
    startTransition(() => deleteListing(fd));
  }

  // Three button styles depending on context: small pill in the dashboard row,
  // full-width sidebar button on the listing detail page (when seller), or
  // outlined danger button on the edit page's Danger zone.
  let trigger: React.ReactNode;
  if (variant === "row") {
    trigger = (
      <button
        type="button"
        onClick={open}
        className="rounded-full border border-ink-line px-3 py-1 text-xs text-ink-mute hover:border-red-500 hover:text-red-600"
      >
        Delete
      </button>
    );
  } else if (variant === "block") {
    trigger = (
      <button
        type="button"
        onClick={open}
        className="w-full rounded-full border border-ink-line py-3 text-sm text-ink-mute hover:border-red-500 hover:text-red-600"
      >
        Delete listing
      </button>
    );
  } else {
    trigger = (
      <button
        type="button"
        onClick={open}
        className="rounded-full border border-red-500 px-5 py-2 text-sm text-red-700 hover:bg-red-50"
      >
        Delete listing permanently
      </button>
    );
  }

  return (
    <>
      {trigger}
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-listing-title"
        >
          <div
            ref={dialogRef}
            className="w-full max-w-md rounded-2xl border border-ink-line bg-white p-7 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-listing-title" className="text-lg font-semibold">
              Delete this listing?
            </h2>
            <p className="mt-2 text-sm text-ink-mute">
              <span className="text-ink">&ldquo;{title}&rdquo;</span> will be permanently
              removed. Conversations about it stay in your inbox but lose the listing
              context.
            </p>
            <p className="mt-2 text-sm text-ink-mute">This can&apos;t be undone.</p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="rounded-full border border-ink-line px-5 py-2 text-sm hover:border-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                autoFocus
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {pending ? "Deleting…" : "Delete listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
