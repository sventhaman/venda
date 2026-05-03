"use client";

import { useState, useTransition } from "react";
import { revokeApiKey } from "./actions";

export function RevokeKeyButton({
  keyId,
  label,
  prefix,
}: {
  keyId: string;
  label: string;
  prefix: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    const fd = new FormData();
    fd.set("id", keyId);
    startTransition(() => revokeApiKey(fd));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-ink-line px-4 py-1.5 text-xs hover:border-red-500 hover:text-red-600"
      >
        Revoke
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="revoke-key-title"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-ink-line bg-white p-7 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="revoke-key-title" className="text-lg font-semibold">
              Revoke this API key?
            </h2>
            <p className="mt-2 text-sm text-ink-mute">
              Any agent or script currently authenticating with this key will start
              getting <code className="rounded bg-ink-fog px-1 py-0.5">401 Unauthorized</code>{" "}
              on its next request. This can&apos;t be undone — mint a fresh key if you
              need to restore access.
            </p>

            <div className="mt-4 rounded-lg bg-ink-fog px-3 py-2 text-xs">
              <div className="font-medium text-ink">{label}</div>
              <div className="mt-0.5 font-mono text-ink-mute">{prefix}…</div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
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
                {pending ? "Revoking…" : "Revoke key"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
