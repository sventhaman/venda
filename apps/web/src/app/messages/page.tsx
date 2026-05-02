import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatTimeAgo } from "@/lib/format";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+see+your+messages");

  // Two-step fetch (RLS allows participant rows for self + same-thread, but the
  // simplest correct shape is: my participant rows → conversations → for each,
  // the other participant's profile + the last message).
  const { data: myConvos } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at, conversations!inner(id, listing_id, last_message_at, created_at)")
    .eq("user_id", user.id)
    .order("conversations(last_message_at)", { ascending: false, nullsFirst: false });

  const conversations = (myConvos ?? []).map((row: any) => row.conversations).filter(Boolean);
  const conversationIds = conversations.map((c: any) => c.id);

  const [otherParticipants, lastMessages, listings] = await Promise.all([
    conversationIds.length
      ? supabase
          .from("conversation_participants")
          .select("conversation_id, profiles!inner(id, handle, display_name, avatar_url)")
          .in("conversation_id", conversationIds)
          .neq("user_id", user.id)
      : Promise.resolve({ data: [] as any[] }),
    conversationIds.length
      ? supabase
          .from("messages")
          .select("conversation_id, body, sender_id, created_at, sent_by_agent")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    Promise.resolve(
      conversations.filter((c: any) => c.listing_id).map((c: any) => c.listing_id),
    ).then((ids) =>
      ids.length
        ? supabase.from("listings").select("id, title, vertical, images").in("id", ids)
        : Promise.resolve({ data: [] as any[] }),
    ),
  ]);

  const otherById = new Map<string, any>();
  for (const row of otherParticipants.data ?? []) {
    if (!otherById.has(row.conversation_id)) otherById.set(row.conversation_id, row.profiles);
  }
  const lastMsgById = new Map<string, any>();
  for (const m of lastMessages.data ?? []) {
    if (!lastMsgById.has(m.conversation_id)) lastMsgById.set(m.conversation_id, m);
  }
  const listingById = new Map<string, any>();
  for (const l of listings.data ?? []) listingById.set(l.id, l);

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>

      {conversations.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-ink-line bg-ink-fog/50 p-12 text-center text-ink-mute">
          No conversations yet.
          <div className="mt-4">
            <Link href="/goods" className="rounded-full bg-ink px-5 py-2 text-sm text-white hover:bg-ink-soft">
              Browse listings
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-ink-line border-y border-ink-line">
          {conversations.map((c: any) => {
            const other = otherById.get(c.id);
            const last = lastMsgById.get(c.id);
            const listing = c.listing_id ? listingById.get(c.listing_id) : null;
            const myRow = (myConvos ?? []).find((r: any) => r.conversation_id === c.id);
            const unread =
              last && last.sender_id !== user.id &&
              (!myRow?.last_read_at || new Date(last.created_at) > new Date(myRow.last_read_at));

            return (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-4 hover:bg-ink-fog/40"
                >
                  <Avatar url={other?.avatar_url} name={other?.display_name ?? other?.handle ?? "?"} />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        {other?.display_name ?? `@${other?.handle ?? "unknown"}`}
                      </span>
                      {unread && <span className="h-2 w-2 rounded-full bg-accent" aria-label="unread" />}
                    </div>
                    {listing && (
                      <div className="truncate text-xs text-ink-mute">re: {listing.title}</div>
                    )}
                    {last && (
                      <div className="line-clamp-1 text-sm text-ink-mute">
                        {last.sender_id === user.id ? "You: " : ""}
                        {last.sent_by_agent && last.sender_id !== user.id ? "[agent] " : ""}
                        {last.body}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-ink-mute">
                    {formatTimeAgo(c.last_message_at ?? c.created_at)}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
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
