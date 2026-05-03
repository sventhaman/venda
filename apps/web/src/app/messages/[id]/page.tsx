import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Thread } from "./thread";
import { formatPrice } from "@/lib/format";
import type { Currency } from "@venda/schema";
import type { SentMessage } from "./actions";

type ParticipantProfile = {
  id: string;
  handle: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type ParticipantRow = {
  user_id: string;
  // Supabase typegen would model joined relations as a possibly-null object;
  // for our query (`!inner`) it's always present.
  profiles: ParticipantProfile;
};

type ListingSnapshot = {
  id: string;
  title: string;
  vertical: string;
  price_amount: number | null;
  price_currency: Currency | null;
  images: Array<{ url: string }> | null;
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+view+messages");
  const supabase = await createClient();

  const { data: convo } = await supabase
    .from("conversations")
    .select("id, listing_id, created_at, last_message_at")
    .eq("id", id)
    .maybeSingle();
  if (!convo) notFound();

  const [participantsRes, messagesRes, listingRes] = await Promise.all([
    supabase
      .from("conversation_participants")
      .select("user_id, profiles!inner(id, handle, display_name, avatar_url)")
      .eq("conversation_id", id),
    supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, sent_by_agent, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
    convo.listing_id
      ? supabase
          .from("listings")
          .select("id, title, vertical, price_amount, price_currency, images")
          .eq("id", convo.listing_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const participants = (participantsRes.data ?? []) as unknown as ParticipantRow[];
  const messages = (messagesRes.data ?? []) as SentMessage[];
  const listing = (listingRes.data ?? null) as ListingSnapshot | null;

  const other = participants.find((p) => p.user_id !== user.id)?.profiles ?? null;
  const otherName = other?.display_name ?? other?.handle ?? "Unknown";

  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .eq("user_id", user.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-4 flex items-center gap-2 text-sm text-ink-mute">
        <Link href="/messages" className="hover:text-ink">Messages</Link>
        <span aria-hidden>/</span>
        <span className="truncate text-ink">{otherName}</span>
      </div>

      <header className="flex items-center gap-4 border-b border-ink-line pb-4">
        <Avatar url={other?.avatar_url ?? null} name={otherName} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{otherName}</div>
          {other?.handle && <div className="text-xs text-ink-mute">@{other.handle}</div>}
        </div>
      </header>

      {listing && <ListingRefCard listing={listing} />}

      <Thread conversationId={id} meId={user.id} initial={messages} />
    </div>
  );
}

function ListingRefCard({ listing }: { listing: ListingSnapshot }) {
  const heroImage = listing.images?.[0]?.url;
  const price =
    listing.price_amount != null && listing.price_currency
      ? formatPrice({
          amount: Number(listing.price_amount),
          currency: listing.price_currency,
        })
      : null;

  return (
    <Link
      href={`/${listing.vertical}/${listing.id}`}
      className="mt-4 flex items-center gap-3 rounded-xl border border-ink-line p-3 hover:bg-ink-fog/50"
    >
      {heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={heroImage} alt="" className="h-12 w-16 rounded-md object-cover" />
      ) : (
        <div className="h-12 w-16 rounded-md bg-ink-fog" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wide text-ink-mute">About this listing</div>
        <div className="truncate text-sm font-medium">{listing.title}</div>
      </div>
      {price && (
        <div className="shrink-0 text-sm font-semibold tabular-nums">{price}</div>
      )}
    </Link>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className="h-12 w-12 rounded-full object-cover" />;
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-fog text-base font-medium text-ink-mute">
      {initial}
    </div>
  );
}
