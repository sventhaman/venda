import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+see+your+account");

  const [{ data: profile }, { count: keyCount }, { count: listingCount }] = await Promise.all([
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
  ]);

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>

      <dl className="mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 border-y border-ink-line py-6 text-sm sm:grid-cols-3">
        <dt className="text-ink-mute">Email</dt>
        <dd className="font-medium sm:col-span-2">{user.email}</dd>

        <dt className="text-ink-mute">Display name</dt>
        <dd className="font-medium sm:col-span-2">{profile?.display_name ?? "—"}</dd>

        <dt className="text-ink-mute">Handle</dt>
        <dd className="font-medium sm:col-span-2">@{profile?.handle ?? "—"}</dd>

        <dt className="text-ink-mute">Account type</dt>
        <dd className="font-medium sm:col-span-2">{profile?.account_type ?? "—"}</dd>

        <dt className="text-ink-mute">Member since</dt>
        <dd className="font-medium sm:col-span-2">
          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
        </dd>
      </dl>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
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
