import type { Listing, ListingSearchResult } from "@ichiba/schema";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export async function searchListings(params: Record<string, string | number | undefined>): Promise<ListingSearchResult> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const r = await fetch(`${API_BASE}/v1/listings?${qs.toString()}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`search failed: ${r.status}`);
  return r.json();
}

export async function getListing(id: string): Promise<Listing | null> {
  const r = await fetch(`${API_BASE}/v1/listings/${id}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`get failed: ${r.status}`);
  return r.json();
}
