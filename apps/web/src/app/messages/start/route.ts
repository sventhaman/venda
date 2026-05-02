import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Starts (or resumes) a conversation with a seller about a listing.
// Form posts here with `listingId`; we redirect to /messages/{convoId}.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const listingId = String(formData.get("listingId") ?? "");
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const next = encodeURIComponent(`/messages/start?listingId=${listingId}`);
    return NextResponse.redirect(new URL(`/sign-in?error=Sign+in+to+message&next=${next}`, request.url));
  }

  const { data: listing, error: lErr } = await supabase
    .from("listings")
    .select("id, seller_id, vertical")
    .eq("id", listingId)
    .maybeSingle();
  if (lErr || !listing) return NextResponse.json({ error: "listing not found" }, { status: 404 });

  if (listing.seller_id === user.id) {
    return NextResponse.redirect(new URL(`/${listing.vertical}/${listingId}?error=cant+message+self`, request.url));
  }

  // Look for an existing thread between us and the seller about this listing.
  const { data: myConvos } = await supabase
    .from("conversation_participants")
    .select("conversation_id, conversations!inner(id, listing_id)")
    .eq("user_id", user.id);

  const matchingConvoIds = (myConvos ?? [])
    .filter((r: any) => r.conversations?.listing_id === listingId)
    .map((r: any) => r.conversation_id);

  if (matchingConvoIds.length > 0) {
    const { data: sellerInThese } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .in("conversation_id", matchingConvoIds)
      .eq("user_id", listing.seller_id);
    const existingId = sellerInThese?.[0]?.conversation_id;
    if (existingId) {
      return NextResponse.redirect(new URL(`/messages/${existingId}`, request.url));
    }
  }

  // No existing thread — create one and add both participants.
  const { data: convo, error: convoErr } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId })
    .select()
    .single();
  if (convoErr || !convo) {
    return NextResponse.json({ error: convoErr?.message ?? "create failed" }, { status: 500 });
  }

  const { error: partErr } = await supabase.from("conversation_participants").insert([
    { conversation_id: convo.id, user_id: user.id },
    { conversation_id: convo.id, user_id: listing.seller_id },
  ]);
  if (partErr) {
    await supabase.from("conversations").delete().eq("id", convo.id);
    return NextResponse.json({ error: partErr.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL(`/messages/${convo.id}`, request.url));
}
