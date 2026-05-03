import { Skeleton, SkeletonCircle } from "@/components/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-page px-6 py-10">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <SkeletonCircle size="h-24 w-24" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <Skeleton className="mt-6 h-4 max-w-2xl" />
      <Skeleton className="mt-2 h-4 max-w-xl" />

      <div className="mt-12">
        <div className="flex items-baseline justify-between border-b border-ink-line pb-3">
          <Skeleton className="h-5 w-40" />
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
  );
}
