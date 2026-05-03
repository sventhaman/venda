import { Skeleton } from "@/components/skeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-page px-6 py-8">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-6 h-12 max-w-2xl" />
      <div className="mt-8 flex items-baseline justify-between border-b border-ink-line pb-3">
        <Skeleton className="h-4 w-24" />
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
  );
}
