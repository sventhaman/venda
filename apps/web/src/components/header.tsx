import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const VERTICALS = [
  { slug: "goods", label: "Marketplace" },
  { slug: "cars", label: "Cars" },
  { slug: "realestate", label: "Real estate" },
  { slug: "jobs", label: "Jobs" },
  { slug: "services", label: "Services" },
];

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, handle, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    displayName = profile?.display_name ?? profile?.handle ?? user.email ?? "Account";
    avatarUrl = profile?.avatar_url ?? null;
  }
  const initial = (displayName ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="border-b border-ink-line bg-white">
      <div className="mx-auto flex max-w-page items-center gap-8 px-6 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          ichiba
        </Link>

        <nav className="hidden flex-1 items-center gap-6 text-sm md:flex">
          {VERTICALS.map((v) => (
            <Link key={v.slug} href={`/${v.slug}`} className="text-ink-mute transition hover:text-ink">
              {v.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/account/listings" className="text-ink-mute hover:text-ink">
                My listings
              </Link>
              <Link href="/account/saved" className="text-ink-mute hover:text-ink">
                Saved
              </Link>
              <Link href="/developers/keys" className="text-ink-mute hover:text-ink">
                API keys
              </Link>
              <Link href="/messages" className="text-ink-mute hover:text-ink">
                Messages
              </Link>
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full border border-ink-line py-1 pl-1 pr-3 hover:border-ink"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-fog text-xs font-medium text-ink-mute">
                    {initial}
                  </span>
                )}
                <span className="hidden lg:inline">{displayName}</span>
              </Link>
              <Link
                href="/new"
                className="rounded-full bg-ink px-4 py-1.5 text-white hover:bg-ink-soft"
              >
                New listing
              </Link>
              <form action="/sign-out" method="post">
                <button
                  type="submit"
                  className="text-ink-mute hover:text-ink"
                  aria-label="Sign out"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-full border border-ink-line px-4 py-1.5 hover:border-ink"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-ink px-4 py-1.5 text-white hover:bg-ink-soft"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
