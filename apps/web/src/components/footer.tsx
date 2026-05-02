export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-line bg-ink-fog">
      <div className="mx-auto grid max-w-page gap-10 px-6 py-12 text-sm text-ink-mute md:grid-cols-4">
        <div>
          <div className="mb-3 text-base font-semibold text-ink">ichiba</div>
          <p>The agent-first marketplace. Buy, sell, and hire — through humans or agents.</p>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink">Marketplace</div>
          <ul className="space-y-1.5">
            <li><a href="/goods">Goods</a></li>
            <li><a href="/cars">Cars</a></li>
            <li><a href="/realestate">Real estate</a></li>
            <li><a href="/jobs">Jobs</a></li>
            <li><a href="/services">Services</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink">For agents</div>
          <ul className="space-y-1.5">
            <li><a href="/developers">API & MCP</a></li>
            <li><a href="/developers/keys">API keys</a></li>
            <li><a href="/developers/docs">Documentation</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink">Account</div>
          <ul className="space-y-1.5">
            <li><a href="/sign-in">Sign in</a></li>
            <li><a href="/sign-up">Create account</a></li>
            <li><a href="/messages">Messages</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-page px-6 pb-8 text-xs text-ink-mute">
        © {new Date().getFullYear()} ichiba
      </div>
    </footer>
  );
}
