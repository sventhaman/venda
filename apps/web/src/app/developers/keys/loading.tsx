import { Skeleton } from "@/components/skeleton";

export default function KeysLoading() {
  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      <ul className="mt-10 divide-y divide-ink-line border-y border-ink-line">
        {Array.from({ length: 2 }).map((_, i) => (
          <li
            key={i}
            className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[1fr_auto]"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 rounded-full self-start" />
          </li>
        ))}
      </ul>
    </div>
  );
}
