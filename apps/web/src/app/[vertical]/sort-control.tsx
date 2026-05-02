"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OPTIONS: Array<[string, string]> = [
  ["newest", "Newest"],
  ["oldest", "Oldest"],
  ["price_asc", "Price: low → high"],
  ["price_desc", "Price: high → low"],
];

export function SortControl({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page"); // reset paging when re-sorting
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-mute">Sort</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort listings"
        className="rounded-lg border border-ink-line bg-white px-2 py-1 text-sm focus:border-ink focus:outline-none"
      >
        {OPTIONS.map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
