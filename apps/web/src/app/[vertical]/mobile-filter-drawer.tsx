"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FilterSidebar } from "@/components/filter-sidebar";
import type { Vertical } from "@venda/schema";

// Mobile-only "Filters" trigger + slide-up sheet. Shows the same FilterSidebar
// the desktop layout uses, with a count badge for active filters. Closes on
// route change (filter applied), Esc, and backdrop click.
export function MobileFilterDrawer({
  vertical,
  selected,
  count,
}: {
  vertical: Vertical;
  selected: Record<string, string | undefined>;
  count: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close when navigation completes (filter applied changes path/query).
  useEffect(() => {
    setOpen(false);
  }, [pathname, JSON.stringify(selected)]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-ink-edge px-3 py-1.5 text-sm font-medium hover:border-ink lg:hidden"
        aria-label={`Filters${count > 0 ? `, ${count} active` : ""}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="9" cy="6" r="2" fill="white" />
          <circle cx="15" cy="12" r="2" fill="white" />
          <circle cx="7" cy="18" r="2" fill="white" />
        </svg>
        Filters
        {count > 0 && (
          <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-ink px-1.5 text-[11px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div
            className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-ink-line bg-white px-5 py-3">
              <h2 className="text-base font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink-fog"
                aria-label="Close filters"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4">
              {/* Override the desktop-only `hidden lg:block` so the sidebar
                  renders inside the drawer at mobile widths. */}
              <div className="[&>aside]:!block [&>aside]:!w-full">
                <FilterSidebar vertical={vertical} selected={selected} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
