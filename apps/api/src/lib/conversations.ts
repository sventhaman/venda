import type { SupabaseClient } from "@supabase/supabase-js";

// Inline equivalent of the start_conversation(uuid) RPC for agent callers.
// The RPC relies on auth.uid() to identify the caller, but agents go through
// the service-role client where auth.uid() is null — so we can't use the RPC
// for them. This helper does the same atomic flow (look up seller, reuse or
// create thread, add both participants) using the service-role client
// directly. Safe because it only ever wires the *given* userId (from the
// authenticated key's owner_user_id) into the participant list — never a
// client-supplied value.

export async function startOrFindConversation(
  supabase: SupabaseClient,
  buyerUserId: string,
  listingId: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data: listing, error: lErr } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .maybeSingle();
  if (lErr) return { ok: false, error: lErr.message };
  if (!listing) return { ok: false, error: "listing not found" };
  if (listing.seller_id === buyerUserId) {
    return { ok: false, error: "cannot start a conversation with yourself" };
  }

  // Reuse an existing thread if one already pairs us with the seller about
  // this listing.
  const { data: candidates } = await supabase
    .from("conversations")
    .select("id, conversation_participants!inner(user_id)")
    .eq("listing_id", listingId);

  for (const c of (candidates ?? []) as Array<{
    id: string;
    conversation_participants: Array<{ user_id: string }>;
  }>) {
    const userIds = c.conversation_participants.map((p) => p.user_id);
    if (userIds.includes(buyerUserId) && userIds.includes(listing.seller_id)) {
      return { ok: true, id: c.id };
    }
  }

  const { data: convo, error: convoErr } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId })
    .select()
    .single();
  if (convoErr || !convo) {
    return { ok: false, error: convoErr?.message ?? "could not create conversation" };
  }

  const { error: partErr } = await supabase.from("conversation_participants").insert([
    { conversation_id: convo.id, user_id: buyerUserId },
    { conversation_id: convo.id, user_id: listing.seller_id },
  ]);
  if (partErr) {
    // Roll back the empty conversation row.
    await supabase.from("conversations").delete().eq("id", convo.id);
    return { ok: false, error: partErr.message };
  }

  return { ok: true, id: convo.id };
}
