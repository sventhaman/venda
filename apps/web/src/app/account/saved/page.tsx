import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice, formatTimeAgo } from "@/lib/format";

type FavoriteRow = {
  created_at: string;
  listings: {
    id: string;
    vertical: string;
    status: string;
    title: string;
    description: string | null;
    price_amount: number | null;
    price_currency: string | null;
    city: string | null;
    region: string | null;
    images: Array<{ url: string }> | null;
    published_at: string | null;
    created_at: string;
    agent_created: boolean;
  } | null;
};

export default async function SavedListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+see+saved+listings");
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("listing_favorites")
    .select(
      "created_at, listings!inner(id, vertical, status, title, description, price_amount, price_currency, city, region, images, published_at, created_at, agent_created)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favorites = (rows ?? []) as FavoriteRow[];
  const usable = favorites.filter((f) => f.listings && f.listings.status === "active");
  const stale = favorites.length - usable.length;

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="flex items-center gap-2 text-sm text-ink-mute">
        <Link href="/account" className="hover:text-ink">Account</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">Saved listings</span>
      </div>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Saved listings</h1>
      <p className="mt-2 text-sm text-ink-mute">
        Things you&apos;ve hearted across ichiba.{" "}
        {stale > 0 && (
          <span className="text-ink">
            {stale} item{stale === 1 ? "" : "s"} no longer available — hidden.
          </span>
        )}
      </p>

      {usable.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-ink-line bg-ink-fog/50 p-12 text-center text-ink-mute">
          You haven&apos;t saved anything yet.
          <div className="mt-4">
            <Link
              href="/goods"
              className="rounded-full bg-ink px-5 py-2 text-sm text-white hover:bg-ink-soft"
            >
              Browse listings
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-ink-line border-y border-ink-line">
          {usable.map((f) => {
            const l = f.listings!;
            const where = [l.city, l.region].filter(Boolean).join(", ");
            const image = l.images?.[0]?.url;
            return (
              <li key={l.id}>
                <Link
                  href={`/${l.vertical}/${l.id}`}
                  className="grid grid-cols-[6rem_1fr_auto] items-center gap-5 py-4 hover:bg-ink-fog/40"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="aspect-[4/3] w-24 rounded-lg object-cover" />
                  ) : (
                    <div className="aspect-[4/3] w-24 rounded-lg bg-ink-fog" />
                  )}

                  <div className="min-w-0">
                    <div className="text-base font-semibold tabular-nums">
                      {formatPrice(
                        l.price_amount != null && l.price_currency
                          ? { amount: Number(l.price_amount), currency: l.price_currency as any }
                          : undefined,
                      )}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-sm font-medium">{l.title}</div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-ink-mute">
                      <span className="capitalize">{l.vertical}</span>
                      {where && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{where}</span>
                        </>
                      )}
                      <span aria-hidden>·</span>
                      <span>{formatTimeAgo(l.published_at ?? l.created_at)}</span>
                      {l.agent_created && (
                        <>
                          <span aria-hidden>·</span>
                          <span>via agent</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-ink-mute">
                    Saved {formatTimeAgo(f.created_at)}
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
