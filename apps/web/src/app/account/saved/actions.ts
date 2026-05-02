"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Toggle a listing in the authed user's favorites. Returns the new state so
// the client can resolve any optimistic mismatch.
export async function toggleFavorite(
  listingId: string,
): Promise<{ ok: true; saved: boolean } | { ok: false; error: string }> {
  if (!listingId) return { ok: false, error: "listingId required" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: existing } = await supabase
    .from("listing_favorites")
    .select("listing_id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("listing_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/account/saved");
    return { ok: true, saved: false };
  }

  const { error } = await supabase
    .from("listing_favorites")
    .insert({ user_id: user.id, listing_id: listingId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/account/saved");
  return { ok: true, saved: true };
}
