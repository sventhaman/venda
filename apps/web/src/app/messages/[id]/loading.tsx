export default function ConversationLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-4 h-4 w-48 animate-pulse rounded bg-ink-fog" />
      <header className="flex items-center gap-4 border-b border-ink-line pb-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-ink-fog" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-ink-fog" />
          <div className="h-3 w-20 animate-pulse rounded bg-ink-fog" />
        </div>
      </header>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink-line p-3">
        <div className="h-12 w-16 animate-pulse rounded-md bg-ink-fog" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-ink-fog" />
          <div className="h-4 w-40 animate-pulse rounded bg-ink-fog" />
        </div>
      </div>

      <div className="min-h-[40vh] py-4">
        <ul className="flex flex-col gap-2">
          <li className="flex justify-start">
            <div className="h-10 w-2/3 max-w-md animate-pulse rounded-2xl rounded-bl-md bg-ink-fog" />
          </li>
          <li className="flex justify-end">
            <div className="h-10 w-1/2 max-w-md animate-pulse rounded-2xl rounded-br-md bg-ink-fog" />
          </li>
          <li className="flex justify-start">
            <div className="h-12 w-3/4 max-w-md animate-pulse rounded-2xl rounded-bl-md bg-ink-fog" />
          </li>
        </ul>
      </div>
    </div>
  );
}
