"use client";

import { useState, useTransition } from "react";
import { mintApiKey } from "./actions";

const SCOPES: Array<{ value: string; label: string; hint: string }> = [
  { value: "listings:read", label: "Read listings", hint: "Search and fetch listings" },
  { value: "listings:write", label: "Write listings", hint: "Create, update, delete listings" },
  { value: "messages:read", label: "Read messages", hint: "List conversations and messages" },
  { value: "messages:write", label: "Write messages", hint: "Send messages, start threads" },
  { value: "profile:read", label: "Read profile", hint: "Read the owner's profile" },
  { value: "profile:write", label: "Write profile", hint: "Update the owner's profile" },
];

type Created = { plaintext: string; prefix: string; label: string };

export function NewKeyDialog() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function close() {
    setOpen(false);
    setCreated(null);
    setError(null);
    setCopied(false);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    const res = await mintApiKey(formData);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCreated(res);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-soft"
      >
        Create new key
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={close}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-ink-line bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {created ? (
          <PlaintextReveal created={created} onClose={close} copied={copied} setCopied={setCopied} />
        ) : (
          <form
            action={(fd) => startTransition(() => handleSubmit(fd))}
            className="flex flex-col gap-5"
          >
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Create API key</h2>
              <p className="mt-1 text-sm text-ink-mute">
                Used by an agent to authenticate with the ichiba API and MCP server.
              </p>
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Label</span>
              <input
                name="label"
                required
                maxLength={80}
                placeholder="e.g. Local dev, Production agent"
                className="rounded-lg border border-ink-line px-3 py-2 text-base focus:border-ink focus:outline-none"
              />
            </label>

            <fieldset className="flex flex-col gap-2 text-sm">
              <legend className="mb-1 font-medium">Scopes</legend>
              <div className="grid grid-cols-1 gap-1.5">
                {SCOPES.map((s) => (
                  <label key={s.value} className="flex cursor-pointer items-start gap-2 rounded-lg border border-ink-line px-3 py-2 hover:bg-ink-fog/40">
                    <input
                      type="checkbox"
                      name="scopes"
                      value={s.value}
                      defaultChecked
                      className="mt-0.5 h-4 w-4 rounded border-ink-line"
                    />
                    <span className="flex-1">
                      <span className="font-medium">{s.label}</span>
                      <span className="ml-1 text-xs text-ink-mute">{s.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Rate limit (req/min)</span>
                <input
                  name="rateLimitPerMinute"
                  type="number"
                  defaultValue={120}
                  min={1}
                  max={10000}
                  className="rounded-lg border border-ink-line px-3 py-2 text-base focus:border-ink focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Expires</span>
                <input
                  name="expiresAt"
                  type="date"
                  className="rounded-lg border border-ink-line px-3 py-2 text-base focus:border-ink focus:outline-none"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-ink-line px-5 py-2.5 text-sm hover:border-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-soft disabled:opacity-50"
              >
                {pending ? "Creating…" : "Create key"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PlaintextReveal({
  created,
  onClose,
  copied,
  setCopied,
}: {
  created: Created;
  onClose: () => void;
  copied: boolean;
  setCopied: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Save this key now</h2>
        <p className="mt-1 text-sm text-ink-mute">
          This is the only time the full key will be shown. Copy and store it somewhere
          safe — anyone with this string can act as your agent.
        </p>
      </div>

      <div className="rounded-xl bg-ink p-4 font-mono text-xs leading-relaxed text-white">
        <div className="break-all">{created.plaintext}</div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-mute">{created.label} · {created.prefix}…</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(created.plaintext);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="rounded-full border border-ink-line px-4 py-2 text-sm hover:border-ink"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-ink-soft"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
