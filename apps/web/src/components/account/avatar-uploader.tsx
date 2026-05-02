"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "listing-images";
const MAX_SIZE = 4 * 1024 * 1024;

// Avatars live in the same bucket as listing photos under {uid}/avatar/...
// Same RLS already restricts writes to the uploader's own folder, so no
// migration is needed and a single bucket keeps the Storage surface small.
export function AvatarUploader({
  current,
  displayName,
  name = "avatarUrl",
}: {
  current?: string | null;
  displayName?: string | null;
  name?: string;
}) {
  const [url, setUrl] = useState<string | null>(current ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError("Image larger than 4 MB");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not signed in");
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/avatar/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        setError(upErr.message);
        return;
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setUrl(data.publicUrl);
    } finally {
      setBusy(false);
    }
  }

  const initial = (displayName ?? "").trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-5">
      <input type="hidden" name={name} value={url ?? ""} readOnly />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="group relative h-20 w-20 overflow-hidden rounded-full border border-ink-line bg-ink-fog focus:outline-none"
        aria-label="Change avatar"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-medium text-ink-mute">
            {initial}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] uppercase tracking-widest text-white opacity-0 transition group-hover:opacity-100">
          Change
        </span>
      </button>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-full border border-ink-line px-4 py-1.5 text-sm hover:border-ink"
        >
          {busy ? "Uploading…" : url ? "Replace" : "Upload"}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => setUrl(null)}
            className="ml-2 text-xs text-ink-mute hover:text-red-600"
          >
            Remove
          </button>
        )}
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <p className="mt-1 text-xs text-ink-mute">JPEG / PNG / WebP, up to 4 MB.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) upload(e.target.files[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
