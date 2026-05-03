// Tiny set of skeleton primitives shared across loading.tsx files. Keeps
// per-route loading boundaries one-screen-readable and visually consistent.

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink-fog ${className}`} />;
}

export function SkeletonText({
  width = "w-full",
  height = "h-4",
}: {
  width?: string;
  height?: string;
}) {
  return <Skeleton className={`${height} ${width}`} />;
}

export function SkeletonCircle({ size = "h-12 w-12" }: { size?: string }) {
  return <div className={`animate-pulse rounded-full bg-ink-fog ${size}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink-line p-5 ${className}`}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="mt-3 h-3 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}
