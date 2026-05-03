import { Skeleton } from "@/components/skeleton";

export default function NewListingLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="mt-2 h-9 w-64" />
      <Skeleton className="mt-2 h-4 w-44" />

      <div className="mt-10 flex flex-col gap-10">
        {Array.from({ length: 4 }).map((_, section) => (
          <div key={section} className="space-y-4 border-t border-ink-line pt-8 first:border-none first:pt-0">
            <Skeleton className="h-5 w-24" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-6 mt-10 border-t border-ink-line bg-white/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Skeleton className="h-3 w-72" />
          <Skeleton className="h-10 w-44 rounded-full" />
        </div>
      </div>
    </div>
  );
}
