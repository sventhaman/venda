"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "listing-images";
const MAX_FILES = 12;
const MAX_SIZE = 10 * 1024 * 1024;

type UploadedImage = { url: string; path: string; name: string };

export function ImageUploader({ name = "images" }: { name?: string }) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const upload = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);
      if (images.length + fileArray.length > MAX_FILES) {
        setError(`You can upload up to ${MAX_FILES} images per listing.`);
        return;
      }

      setBusy(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("You need to be signed in to upload.");
          return;
        }

        const uploaded: UploadedImage[] = [];
        for (const file of fileArray) {
          if (file.size > MAX_SIZE) {
            setError(`${file.name} is larger than 10 MB.`);
            continue;
          }
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { contentType: file.type, upsert: false });
          if (upErr) {
            setError(upErr.message);
            continue;
          }
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
          uploaded.push({ url: data.publicUrl, path, name: file.name });
        }

        setImages((prev) => [...prev, ...uploaded]);
      } finally {
        setBusy(false);
      }
    },
    [images.length, supabase],
  );

  const remove = useCallback(
    async (path: string) => {
      await supabase.storage.from(BUCKET).remove([path]);
      setImages((prev) => prev.filter((i) => i.path !== path));
    },
    [supabase],
  );

  return (
    <div>
      {/* Hidden input the form submits — one URL per line, matches existing parser. */}
      <input type="hidden" name={name} value={images.map((i) => i.url).join("\n")} readOnly />

      {images.length > 0 && (
        <ul className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <li
              key={img.path}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(img.path)}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-xs text-ink shadow-sm transition hover:bg-white"
                aria-label={`Remove ${img.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
        }}
        className="rounded-xl border border-dashed border-ink-line bg-ink-fog/40 px-6 py-8 text-center"
      >
        <p className="text-sm text-ink-mute">
          Drop images here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-ink underline-offset-4 hover:underline"
          >
            choose files
          </button>
          .
        </p>
        <p className="mt-1 text-xs text-ink-mute">
          JPEG, PNG, WebP, or GIF · up to 10 MB · max {MAX_FILES} images
        </p>
        {busy && <p className="mt-2 text-xs text-accent">Uploading…</p>}
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
