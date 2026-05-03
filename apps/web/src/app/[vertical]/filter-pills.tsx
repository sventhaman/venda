import Link from "next/link";
import { activePillsFromParams, urlWithoutPill } from "./vertical-meta";

// Server-rendered filter pill summary. Each chip shows the filter and value;
// click X (which is just a <Link> to the URL minus that param) navigates to
// the un-filtered version. No JS required.
export function FilterPills({
  basePath,
  params,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const pills = activePillsFromParams(params);
  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pills.map((p) => (
        <Link
          key={`${p.key}:${p.removeValue}`}
          href={urlWithoutPill(basePath, params, p)}
          className="group flex items-center gap-1.5 rounded-full border border-ink-line bg-white px-3 py-1 text-xs text-ink hover:border-ink"
          aria-label={`Remove filter ${p.groupLabel}: ${p.valueLabel}`}
        >
          <span className="font-medium text-ink-mute">{p.groupLabel}:</span>
          <span>{p.valueLabel}</span>
          <span aria-hidden className="text-ink-mute group-hover:text-ink">
            ×
          </span>
        </Link>
      ))}

      {pills.length > 1 && (
        <Link
          href={basePath}
          className="text-xs text-ink-mute underline-offset-2 hover:text-ink hover:underline"
        >
          Clear all
        </Link>
      )}
    </div>
  );
}
