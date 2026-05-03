import { Skeleton, SkeletonText } from "@/components/skeleton";

export default function VerticalLoading() {
  return (
    <div className="mx-auto max-w-page px-6 py-8">
      <SkeletonText width="w-32" height="h-3" />
      <Skeleton className="mt-4 h-9 w-48" />

      <Skeleton className="mt-6 h-12 max-w-2xl" />

      <div className="mt-10 flex gap-10">
        <aside className="hidden w-64 shrink-0 lg:block">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="mt-4 h-32 w-full rounded-lg" />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3 border-b border-ink-line pb-3">
            <SkeletonText width="w-24" />
            <Skeleton className="h-7 w-32" />
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="overflow-hidden rounded-lg shadow-card">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <div className="space-y-1.5 px-3 py-3">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="mt-2 flex gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
