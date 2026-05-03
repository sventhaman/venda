import { Skeleton } from "@/components/skeleton";

export default function SavedLoading() {
  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-2 h-9 w-44" />
      <Skeleton className="mt-2 h-4 w-72" />

      <ul className="mt-8 divide-y divide-ink-line border-y border-ink-line">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="grid grid-cols-[6rem_1fr_auto] items-center gap-5 py-4"
          >
            <Skeleton className="aspect-[4/3] w-24 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-3 w-20" />
          </li>
        ))}
      </ul>
    </div>
  );
}
