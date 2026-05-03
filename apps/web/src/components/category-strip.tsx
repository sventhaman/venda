import Link from "next/link";

// finn.no's signature: a horizontal row of small line-icon + label entries,
// no card chrome, just hover background. Way denser and more navigable than
// our previous 5-card vertical grid.

const VERTICALS: Array<{
  slug: string;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    slug: "goods",
    label: "Marketplace",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 7h18l-1.5 11a2 2 0 0 1-2 1.7H6.5a2 2 0 0 1-2-1.7L3 7Z" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2" />
      </svg>
    ),
  },
  {
    slug: "cars",
    label: "Cars",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 14l1.5-5a2 2 0 0 1 2-1.5h11a2 2 0 0 1 2 1.5L21 14v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4Z" />
        <circle cx="7" cy="15" r="1" />
        <circle cx="17" cy="15" r="1" />
      </svg>
    ),
  },
  {
    slug: "realestate",
    label: "Real estate",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
        <path d="M10 20v-5h4v5" />
      </svg>
    ),
  },
  {
    slug: "jobs",
    label: "Jobs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    ),
  },
  {
    slug: "services",
    label: "Services",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-3 3-2-2 3-3Z" />
      </svg>
    ),
  },
];

export function CategoryStrip() {
  return (
    <nav className="flex flex-wrap gap-1 sm:gap-2" aria-label="Verticals">
      {VERTICALS.map((v) => (
        <Link
          key={v.slug}
          href={`/${v.slug}`}
          className="group flex flex-1 min-w-[6rem] flex-col items-center gap-2 rounded-lg px-3 py-4 transition hover:bg-ink-fog"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-white">
            <span className="block h-5 w-5 [&>svg]:h-full [&>svg]:w-full">{v.icon}</span>
          </span>
          <span className="text-sm font-medium text-ink">{v.label}</span>
        </Link>
      ))}
    </nav>
  );
}
