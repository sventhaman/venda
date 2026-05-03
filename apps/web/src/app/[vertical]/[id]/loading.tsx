import { Skeleton, SkeletonText } from "@/components/skeleton";

export default function ListingDetailLoading() {
  return (
    <div className="mx-auto max-w-page px-6 py-8">
      <SkeletonText width="w-48" height="h-3" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="grid grid-cols-4 gap-2">
            <Skeleton className="col-span-4 aspect-[4/3] w-full rounded-2xl md:col-span-3" />
            <div className="hidden flex-col gap-2 md:flex">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            </div>
          </div>

          <Skeleton className="mt-8 h-9 w-2/3" />
          <div className="mt-2 flex gap-3">
            <SkeletonText width="w-32" height="h-3" />
            <SkeletonText width="w-20" height="h-3" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-ink-line pt-6 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-1 h-4 w-24" />
              </div>
            ))}
          </div>

          <div className="mt-10 max-w-2xl space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <aside>
          <div className="rounded-2xl border border-ink-line p-6">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="mt-6 h-12 w-full rounded-full" />
            <Skeleton className="mt-2 h-12 w-full rounded-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
