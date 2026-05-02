import type { Vertical } from "@ichiba/schema";

// Per-vertical filters are stubs for now — the schema knows what's filterable;
// we'll wire each one up as we polish each vertical. The shape and layout are
// the important part for the v0: left rail, expandable groups, plenty of air.
export function FilterSidebar({ vertical }: { vertical: Vertical }) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <FilterGroup title="Price">
        <div className="flex gap-2">
          <input
            placeholder="Min"
            className="w-full rounded border border-ink-line px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
          />
          <input
            placeholder="Max"
            className="w-full rounded border border-ink-line px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Location">
        <input
          placeholder="City or region"
          className="w-full rounded border border-ink-line px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
        />
      </FilterGroup>

      {vertical === "goods" && <GoodsFilters />}
      {vertical === "cars" && <CarsFilters />}
      {vertical === "realestate" && <RealEstateFilters />}
      {vertical === "jobs" && <JobsFilters />}
      {vertical === "services" && <ServicesFilters />}
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="border-b border-ink-line py-4 [&_summary::-webkit-details-marker]:hidden">
      <summary className="mb-3 flex cursor-pointer list-none items-center justify-between text-sm font-medium">
        {title}
        <span className="text-ink-mute">−</span>
      </summary>
      <div className="space-y-2 text-sm">{children}</div>
    </details>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it) => (
        <li key={it}>
          <label className="flex cursor-pointer items-center gap-2 text-ink-mute hover:text-ink">
            <input type="checkbox" className="rounded border-ink-line" />
            {it}
          </label>
        </li>
      ))}
    </ul>
  );
}

function GoodsFilters() {
  return (
    <>
      <FilterGroup title="Category">
        <CheckList items={["Clothing", "Furniture", "Electronics", "Home & garden", "Sports", "Other"]} />
      </FilterGroup>
      <FilterGroup title="Condition">
        <CheckList items={["New", "Like new", "Good", "Fair", "For parts"]} />
      </FilterGroup>
    </>
  );
}

function CarsFilters() {
  return (
    <>
      <FilterGroup title="Make">
        <CheckList items={["Tesla", "Toyota", "Volkswagen", "BMW", "Volvo", "Audi"]} />
      </FilterGroup>
      <FilterGroup title="Fuel">
        <CheckList items={["Electric", "Hybrid", "Petrol", "Diesel"]} />
      </FilterGroup>
      <FilterGroup title="Year">
        <div className="flex gap-2">
          <input placeholder="From" className="w-full rounded border border-ink-line px-2 py-1.5 text-sm" />
          <input placeholder="To" className="w-full rounded border border-ink-line px-2 py-1.5 text-sm" />
        </div>
      </FilterGroup>
    </>
  );
}

function RealEstateFilters() {
  return (
    <>
      <FilterGroup title="Listing type">
        <CheckList items={["For sale", "Long-term rent", "Short-term rent"]} />
      </FilterGroup>
      <FilterGroup title="Property type">
        <CheckList items={["Apartment", "House", "Townhouse", "Cabin", "Plot", "Room"]} />
      </FilterGroup>
      <FilterGroup title="Bedrooms">
        <CheckList items={["1+", "2+", "3+", "4+"]} />
      </FilterGroup>
    </>
  );
}

function JobsFilters() {
  return (
    <>
      <FilterGroup title="Employment">
        <CheckList items={["Full time", "Part time", "Contract", "Freelance", "Internship"]} />
      </FilterGroup>
      <FilterGroup title="Arrangement">
        <CheckList items={["On-site", "Remote", "Hybrid"]} />
      </FilterGroup>
      <FilterGroup title="Experience">
        <CheckList items={["Entry", "Mid", "Senior", "Lead", "Executive"]} />
      </FilterGroup>
    </>
  );
}

function ServicesFilters() {
  return (
    <>
      <FilterGroup title="Category">
        <CheckList items={["Home repair", "Cleaning", "Moving", "Tutoring", "Design", "Development"]} />
      </FilterGroup>
      <FilterGroup title="Pricing">
        <CheckList items={["Hourly", "Fixed", "Quote only"]} />
      </FilterGroup>
    </>
  );
}
