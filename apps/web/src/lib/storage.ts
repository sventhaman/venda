// listing-images is the only Storage bucket today; the public URL has a
// stable shape we can reverse to derive the bucket path. Kept here so both
// the create/update/delete actions and any future cleanup jobs can share it.

export const LISTING_IMAGES_BUCKET = "listing-images";

const PUBLIC_URL_MARKER = `/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/`;

/**
 * Extract the bucket-relative path from a Supabase Storage public URL.
 * Returns null if the URL doesn't match (e.g. it's an external image link).
 */
export function pathFromPublicUrl(url: string): string | null {
  const idx = url.indexOf(PUBLIC_URL_MARKER);
  if (idx === -1) return null;
  const tail = url.slice(idx + PUBLIC_URL_MARKER.length);
  // Strip query string / fragment if present.
  const clean = tail.split(/[?#]/)[0]!;
  if (!clean) return null;
  try {
    return decodeURIComponent(clean);
  } catch {
    return clean;
  }
}

export function pathsFromImages(
  images: Array<{ url?: string }> | null | undefined,
): string[] {
  if (!images) return [];
  return images
    .map((i) => (i.url ? pathFromPublicUrl(i.url) : null))
    .filter((p): p is string => !!p);
}

export function diffRemovedPaths(
  oldImages: Array<{ url?: string }> | null | undefined,
  newImages: Array<{ url?: string }> | null | undefined,
): string[] {
  const newUrlSet = new Set((newImages ?? []).map((i) => i.url).filter(Boolean));
  const removed = (oldImages ?? []).filter((i) => i.url && !newUrlSet.has(i.url));
  return pathsFromImages(removed);
}
