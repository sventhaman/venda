export function SearchBar({ defaultValue, action }: { defaultValue?: string; action?: string }) {
  return (
    <form action={action ?? "/search"} className="flex w-full items-center gap-2">
      <div className="flex flex-1 items-center gap-3 rounded-full border border-ink-line bg-white px-5 py-3 transition focus-within:border-ink">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-mute">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Search across goods, cars, real estate, jobs, services…"
          className="flex-1 bg-transparent text-base outline-none placeholder:text-ink-mute"
        />
      </div>
      <button
        type="submit"
        className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink-soft"
      >
        Search
      </button>
    </form>
  );
}
