"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const VERTICALS = [
  { slug: "goods", label: "Marketplace" },
  { slug: "cars", label: "Cars" },
  { slug: "realestate", label: "Real estate" },
  { slug: "jobs", label: "Jobs" },
  { slug: "services", label: "Services" },
];

const SIGNED_IN_LINKS = [
  { href: "/new", label: "New listing", primary: true },
  { href: "/messages", label: "Messages" },
  { href: "/account/listings", label: "My listings" },
  { href: "/account/saved", label: "Saved" },
  { href: "/developers/keys", label: "API keys" },
  { href: "/account", label: "Account" },
];

export function MobileMenu({
  signedIn,
  displayName,
  avatarUrl,
  initial,
}: {
  signedIn: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  initial: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-ink-line md:hidden"
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-white md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-ink-line px-6 py-4">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              venda
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-line"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
            <div className="px-2 pb-2 text-xs uppercase tracking-widest text-ink-mute">Browse</div>
            {VERTICALS.map((v) => (
              <Link
                key={v.slug}
                href={`/${v.slug}`}
                className="rounded-lg px-2 py-3 text-base hover:bg-ink-fog"
              >
                {v.label}
              </Link>
            ))}

            <div className="mt-6 border-t border-ink-line pt-4">
              {signedIn ? (
                <>
                  <Link
                    href="/account"
                    className="mb-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-ink-fog"
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-fog text-base font-medium text-ink-mute">
                        {initial}
                      </span>
                    )}
                    <span className="text-base font-medium">{displayName ?? "Account"}</span>
                  </Link>

                  {SIGNED_IN_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={
                        l.primary
                          ? "my-2 block rounded-full bg-ink px-3 py-2.5 text-center text-sm font-medium text-white"
                          : "block rounded-lg px-2 py-3 text-base hover:bg-ink-fog"
                      }
                    >
                      {l.label}
                    </Link>
                  ))}

                  <form action="/sign-out" method="post" className="mt-4">
                    <button
                      type="submit"
                      className="w-full rounded-full border border-ink-line py-2.5 text-sm hover:border-ink"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/sign-up"
                    className="rounded-full bg-ink px-3 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/sign-in"
                    className="rounded-full border border-ink-line px-3 py-2.5 text-center text-sm hover:border-ink"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
