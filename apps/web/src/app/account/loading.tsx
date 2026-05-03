import { Skeleton, SkeletonCircle } from "@/components/skeleton";

export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <SkeletonCircle size="h-16 w-16" />
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-2 h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      <div className="mt-8 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 border-y border-ink-line py-6 sm:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="contents">
            <Skeleton className="h-4 w-24" />
            <div className="sm:col-span-2">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        ))}
      </div>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-ink-line p-6">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </section>
    </div>
  );
}
