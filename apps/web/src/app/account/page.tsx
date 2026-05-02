import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+see+your+account");

  const { ok } = await searchParams;

  const [
    { data: profile },
    { count: keyCount },
    { count: listingCount },
    { count: savedCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("api_keys")
      .select("*", { count: "exact", head: true })
      .eq("owner_user_id", user.id)
      .is("revoked_at", null),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id),
    supabase
      .from("listing_favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const initial = (profile?.display_name ?? user.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      {ok && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Profile updated.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-fog text-2xl font-medium text-ink-mute">
              {initial}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{profile?.display_name ?? "Account"}</h1>
            <div className="mt-1 text-sm text-ink-mute">@{profile?.handle ?? "—"}</div>
          </div>
        </div>
        <Link
          href="/account/edit"
          className="rounded-full border border-ink-line px-5 py-2 text-sm hover:border-ink"
        >
          Edit profile
        </Link>
      </div>

      <dl className="mt-8 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 border-y border-ink-line py-6 text-sm sm:grid-cols-3">
        <dt className="text-ink-mute">Email</dt>
        <dd className="font-medium sm:col-span-2">{user.email}</dd>

        <dt className="text-ink-mute">Country</dt>
        <dd className="font-medium sm:col-span-2">{profile?.country_code ?? "—"}</dd>

        <dt className="text-ink-mute">Account type</dt>
        <dd className="font-medium sm:col-span-2">{profile?.account_type ?? "—"}</dd>

        <dt className="text-ink-mute">Member since</dt>
        <dd className="font-medium sm:col-span-2">
          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
        </dd>

        {profile?.bio && (
          <>
            <dt className="text-ink-mute">Bio</dt>
            <dd className="whitespace-pre-wrap sm:col-span-2">{profile.bio}</dd>
          </>
        )}
      </dl>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AccountCard
          href="/messages"
          title="Messages"
          subtitle="Conversations about your listings"
        />
        <AccountCard
          href="/account/listings"
          title="My listings"
          subtitle={
            listingCount != null
              ? `${listingCount} listing${listingCount === 1 ? "" : "s"}`
              : "Your published items"
          }
        />
        <AccountCard
          href="/account/saved"
          title="Saved"
          subtitle={
            savedCount != null
              ? `${savedCount} saved listing${savedCount === 1 ? "" : "s"}`
              : "Things you've hearted"
          }
        />
        <AccountCard
          href="/developers/keys"
          title="API keys"
          subtitle={
            keyCount != null
              ? `${keyCount} active · for agents`
              : "Mint keys for agents"
          }
        />
      </section>

      <div className="mt-10 border-t border-ink-line pt-6">
        <h2 className="text-base font-semibold">Developers</h2>
        <p className="mt-1 max-w-prose text-sm text-ink-mute">
          ichiba is API-first. Agents authenticate with a key you mint — the same
          REST + MCP surface humans use, scoped to whichever permissions you grant.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="/developers/keys"
            className="rounded-full bg-ink px-5 py-2 font-medium text-white hover:bg-ink-soft"
          >
            Manage API keys
          </Link>
          <Link
            href="/developers/docs"
            className="rounded-full border border-ink-line px-5 py-2 hover:border-ink"
          >
            API reference
          </Link>
          <Link
            href="/developers"
            className="rounded-full border border-ink-line px-5 py-2 hover:border-ink"
          >
            Developer overview
          </Link>
        </div>
      </div>

      <form action="/sign-out" method="post" className="mt-10">
        <button
          type="submit"
          className="rounded-full border border-ink-line px-5 py-2.5 text-sm hover:border-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

function AccountCard({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-ink-line p-6 transition hover:border-ink hover:bg-ink-fog/50"
    >
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-ink-mute">{subtitle}</div>
    </Link>
  );
}
