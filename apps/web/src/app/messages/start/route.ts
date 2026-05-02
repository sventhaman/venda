import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Starts (or resumes) a conversation with a seller about a listing. Two modes
// based on the `Accept` / `X-Requested-With` headers:
//   • plain form POST → 307 redirect to /messages/{convoId}  (no-JS fallback)
//   • `Accept: application/json` (fetch from a client component) → JSON {id}
//     so the caller can router.push() and avoid the full-page reload latency.
export async function POST(request: NextRequest) {
  const wantsJson =
    request.headers.get("accept")?.includes("application/json") ||
    request.headers.get("x-requested-with") === "fetch";

  let listingId = "";
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    listingId = String(body.listingId ?? "");
  } else {
    const formData = await request.formData();
    listingId = String(formData.get("listingId") ?? "");
  }
  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (wantsJson) {
      return NextResponse.json({ error: "not signed in" }, { status: 401 });
    }
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

  if (wantsJson) return NextResponse.json({ id: convoId });
  return NextResponse.redirect(new URL(`/messages/${convoId}`, request.url));
}
