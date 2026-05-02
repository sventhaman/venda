import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Thread } from "./thread";
import { formatPrice } from "@/lib/format";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+view+messages");

  // RLS limits this to participants. If they aren't one, RLS hides the conversation.
  const { data: convo } = await supabase
    .from("conversations")
    .select("id, listing_id, created_at, last_message_at")
    .eq("id", id)
    .maybeSingle();
  if (!convo) notFound();

  const [{ data: participants }, { data: messages }, { data: listing }] = await Promise.all([
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

  const other = (participants ?? []).find((p: any) => p.user_id !== user.id)?.profiles;

  // Mark as read on view.
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
        <span className="truncate text-ink">
          {other?.display_name ?? `@${other?.handle ?? "unknown"}`}
        </span>
      </div>

      <header className="flex items-center gap-4 border-b border-ink-line pb-4">
        <Avatar
          url={(other as any)?.avatar_url ?? null}
          name={(other as any)?.display_name ?? (other as any)?.handle ?? "?"}
        />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">
            {(other as any)?.display_name ?? `@${(other as any)?.handle ?? "unknown"}`}
          </div>
          {(other as any)?.handle && (
            <div className="text-xs text-ink-mute">@{(other as any).handle}</div>
          )}
        </div>
      </header>

      {listing && (
        <Link
          href={`/${(listing as any).vertical}/${(listing as any).id}`}
          className="mt-4 flex items-center gap-3 rounded-xl border border-ink-line p-3 hover:bg-ink-fog/50"
        >
          {(listing as any).images?.[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(listing as any).images[0].url}
              alt=""
              className="h-12 w-16 rounded-md object-cover"
            />
          ) : (
            <div className="h-12 w-16 rounded-md bg-ink-fog" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-ink-mute">
              About this listing
            </div>
            <div className="truncate text-sm font-medium">{(listing as any).title}</div>
          </div>
          {(listing as any).price_amount != null && (
            <div className="shrink-0 text-sm font-semibold tabular-nums">
              {formatPrice({
                amount: Number((listing as any).price_amount),
                currency: (listing as any).price_currency,
              })}
            </div>
          )}
        </Link>
      )}

      <Thread
        conversationId={id}
        meId={user.id}
        initial={(messages ?? []) as any}
      />
    </div>
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
