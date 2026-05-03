import { Skeleton, SkeletonText } from "@/components/skeleton";

export default function VerticalLoading() {
  return (
    <div className="mx-auto max-w-page px-6 py-8">
      <SkeletonText width="w-32" height="h-3" />
      <Skeleton className="mt-4 h-9 w-48" />

      <Skeleton className="mt-6 h-12 max-w-2xl rounded-full" />

      <div className="mt-10 flex gap-10">
        <aside className="hidden w-64 shrink-0 lg:block">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="mt-4 h-32 w-full rounded-xl" />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3 border-b border-ink-line pb-3">
            <SkeletonText width="w-24" />
            <Skeleton className="h-7 w-32" />
          </div>

          <ul className="divide-y divide-ink-line">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex gap-5 py-4 first:pt-5">
                <Skeleton className="aspect-[4/3] w-48 rounded-lg" />
                <div className="flex flex-1 flex-col gap-2 py-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="mt-auto flex gap-3">
                    <SkeletonText width="w-20" height="h-3" />
                    <SkeletonText width="w-16" height="h-3" />
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
