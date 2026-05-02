import type { Vertical } from "@ichiba/schema";

// Sidebar with the filters that actually plumb through to /v1/listings today.
// Unfinished per-vertical checkbox groups (categories, makes, etc) are
// deliberately omitted so the page doesn't appear broken when a checkbox
// produces no effect — they'll come back vertical-by-vertical as the API
// surface grows.
export function FilterSidebar({ vertical }: { vertical: Vertical }) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      {/* GET form auto-applies filters when submitted — pairs with the
          page's URL-driven query state. */}
      <form action={`/${vertical}`} className="flex flex-col gap-1">
        <FilterGroup title="Price">
          <div className="flex gap-2">
            <input
              name="minPrice"
              type="number"
              min={0}
              placeholder="Min"
              className="w-full rounded-lg border border-ink-line px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
            />
            <input
              name="maxPrice"
              type="number"
              min={0}
              placeholder="Max"
              className="w-full rounded-lg border border-ink-line px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
            />
          </div>
        </FilterGroup>

        <FilterGroup title="Location">
          <input
            name="city"
            placeholder="City"
            className="w-full rounded-lg border border-ink-line px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
          />
          <input
            name="region"
            placeholder="Region"
            className="mt-2 w-full rounded-lg border border-ink-line px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
          />
          <input
            name="country"
            maxLength={2}
            placeholder="Country (NO, US, …)"
            className="mt-2 w-full rounded-lg border border-ink-line px-2 py-1.5 text-sm uppercase focus:border-ink focus:outline-none"
          />
        </FilterGroup>

        <button
          type="submit"
          className="mt-3 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
        >
          Apply filters
        </button>
      </form>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details
      open
      className="border-b border-ink-line py-4 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="mb-3 flex cursor-pointer list-none items-center justify-between text-sm font-medium">
        {title}
        <span className="text-ink-mute">−</span>
      </summary>
      <div className="space-y-2 text-sm">{children}</div>
    </details>
  );
}
