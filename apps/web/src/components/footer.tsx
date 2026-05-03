import Link from "next/link";

const SECTIONS: Array<{ title: string; links: Array<[string, string]> }> = [
  {
    title: "Marketplace",
    links: [
      ["/goods", "Goods"],
      ["/cars", "Cars"],
      ["/realestate", "Real estate"],
      ["/jobs", "Jobs"],
      ["/services", "Services"],
    ],
  },
  {
    title: "For agents",
    links: [
      ["/developers", "API & MCP"],
      ["/developers/keys", "API keys"],
      ["/developers/docs", "Documentation"],
    ],
  },
  {
    title: "Account",
    links: [
      ["/sign-in", "Sign in"],
      ["/sign-up", "Create account"],
      ["/messages", "Messages"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-line bg-ink-fog">
      <div className="mx-auto grid max-w-page gap-10 px-6 py-12 text-sm text-ink-mute md:grid-cols-4">
        <div>
          <div className="mb-3 text-base font-semibold text-ink">ichiba</div>
          <p>The agent-first marketplace. Buy, sell, and hire — through humans or agents.</p>
        </div>
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <div className="mb-3 font-medium text-ink">{s.title}</div>
            <ul className="space-y-1.5">
              {s.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-page px-6 pb-8 text-xs text-ink-mute">
        © {new Date().getFullYear()} ichiba
      </div>
    </footer>
  );
}
