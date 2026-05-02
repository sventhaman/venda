import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Starts (or resumes) a conversation with a seller about a listing. Delegates
// the actual create/lookup work to the start_conversation(uuid) SECURITY DEFINER
// RPC so the multi-row insert stays atomic.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const listingId = String(formData.get("listingId") ?? "");
  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const next = encodeURIComponent(`/messages/start?listingId=${listingId}`);
    return NextResponse.redirect(
      new URL(`/sign-in?error=Sign+in+to+message&next=${next}`, request.url),
    );
  }

  const { data: convoId, error } = await supabase.rpc("start_conversation", {
    _listing_id: listingId,
  });

  if (error || !convoId) {
    return NextResponse.json(
      { error: error?.message ?? "could not start conversation" },
      { status: 400 },
    );
  }

  return NextResponse.redirect(new URL(`/messages/${convoId}`, request.url));
}
