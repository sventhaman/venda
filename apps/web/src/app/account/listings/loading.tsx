import { Skeleton } from "@/components/skeleton";

export default function MyListingsLoading() {
  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Skeleton className="h-9 w-44" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5 border-b border-ink-line pb-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>

      <ul className="mt-6 divide-y divide-ink-line border-y border-ink-line">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="grid grid-cols-[5rem_1fr_auto] items-center gap-4 py-4"
          >
            <Skeleton className="aspect-[4/3] w-20 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-12 rounded-full" />
              <Skeleton className="h-7 w-14 rounded-full" />
              <Skeleton className="h-7 w-14 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
