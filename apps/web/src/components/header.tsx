import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { MobileMenu } from "./mobile-menu";

// Minimal finn-style header. Logo left, small icon-prefixed actions right.
// Vertical nav lives in the homepage CategoryStrip + page-level breadcrumbs;
// it doesn't need to be in the header.
export async function Header() {
  const user = await getCurrentUser();
  const supabase = await createClient();

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
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          aria-label="venda — home"
          className="text-xl font-semibold tracking-tight"
        >
          venda
        </Link>

        <div className="hidden items-center gap-1 text-sm md:flex">
          {user ? (
            <>
              <IconLink href="/new" label="New listing" icon={<PlusIcon />} primary />
              <IconLink href="/messages" label="Messages" icon={<ChatIcon />} />
              <IconLink href="/account/saved" label="Saved" icon={<HeartIcon />} />
              <Link
                href="/account"
                className="ml-1 flex items-center gap-2 rounded-full border border-ink-line py-1 pl-1 pr-3 text-sm transition hover:border-ink"
                aria-label="Account"
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
            </>
          ) : (
            <>
              <IconLink href="/developers" label="For developers" icon={<CodeIcon />} />
              <Link
                href="/sign-in"
                className="rounded-md px-4 py-2 text-sm hover:bg-ink-fog"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
              >
                Create account
              </Link>
            </>
          )}
        </div>

        <MobileMenu
          signedIn={!!user}
          displayName={displayName}
          avatarUrl={avatarUrl}
          initial={initial}
        />
      </div>
    </header>
  );
}

function IconLink({
  href,
  label,
  icon,
  primary,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-ink-soft"
          : "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-ink hover:bg-ink-fog"
      }
    >
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
      {label}
    </Link>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
