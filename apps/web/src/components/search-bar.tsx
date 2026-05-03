export function SearchBar({
  defaultValue,
  action,
  size = "md",
}: {
  defaultValue?: string;
  action?: string;
  size?: "md" | "lg";
}) {
  const isLg = size === "lg";
  return (
    <form
      action={action ?? "/search"}
      className="flex w-full items-center gap-2"
      role="search"
    >
      <div
        className={`flex flex-1 items-center gap-3 rounded-full border-2 border-ink-line bg-white shadow-sm transition focus-within:border-ink ${
          isLg ? "px-6 py-4" : "px-5 py-3"
        }`}
      >
        <svg
          width={isLg ? 20 : 18}
          height={isLg ? 20 : 18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-mute"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Search across goods, cars, real estate, jobs, services…"
          aria-label="Search ichiba"
          className={`flex-1 bg-transparent outline-none placeholder:text-ink-mute ${
            isLg ? "text-lg" : "text-base"
          }`}
        />
      </div>
      <button
        type="submit"
        className={`rounded-full bg-ink font-medium text-white hover:bg-ink-soft ${
          isLg ? "px-7 py-4 text-base" : "px-6 py-3 text-sm"
        }`}
      >
        Search
      </button>
    </form>
  );
}
