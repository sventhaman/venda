import { Skeleton, SkeletonCircle } from "@/components/skeleton";

export default function AccountEditLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-2 h-9 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />

      <div className="mt-10 flex flex-col gap-8">
        <div className="flex items-center gap-5">
          <SkeletonCircle size="h-20 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-ink-line pt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        <div className="border-t border-ink-line pt-8">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="mt-1.5 h-24 w-full rounded-lg" />
        </div>

        <div className="flex justify-end gap-2 border-t border-ink-line pt-6">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}
