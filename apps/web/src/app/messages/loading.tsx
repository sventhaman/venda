export default function MessagesLoading() {
  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="h-8 w-32 animate-pulse rounded bg-ink-fog" />
      <ul className="mt-8 divide-y divide-ink-line border-y border-ink-line">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-4"
          >
            <div className="h-12 w-12 animate-pulse rounded-full bg-ink-fog" />
            <div className="space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-ink-fog" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-ink-fog" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-ink-fog" />
            </div>
            <div className="h-3 w-12 animate-pulse rounded bg-ink-fog" />
          </li>
        ))}
      </ul>
    </div>
  );
}
