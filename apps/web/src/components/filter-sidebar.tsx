import type { Vertical } from "@ichiba/schema";

// Filter sidebar with per-vertical filter groups. All filters are GET form
// fields — submitting reloads /[vertical] with new query params, which the
// page reads and passes through to searchListings. The page also reads the
// current sp object so we re-render selected values via defaultValue.
export function FilterSidebar({
  vertical,
  selected = {},
}: {
  vertical: Vertical;
  selected?: Record<string, string | undefined>;
}) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <form action={`/${vertical}`} className="flex flex-col gap-1">
        <Group title="Price">
          <div className="flex gap-2">
            <Input
              name="minPrice"
              type="number"
              min={0}
              placeholder="Min"
              defaultValue={selected.minPrice}
            />
            <Input
              name="maxPrice"
              type="number"
              min={0}
              placeholder="Max"
              defaultValue={selected.maxPrice}
            />
          </div>
        </Group>

        <Group title="Location">
          <Input name="city" placeholder="City" defaultValue={selected.city} />
          <Input
            name="region"
            placeholder="Region"
            defaultValue={selected.region}
            className="mt-2"
          />
          <Input
            name="country"
            placeholder="Country (NO, US, …)"
            maxLength={2}
            defaultValue={selected.country}
            className="mt-2 uppercase"
          />
        </Group>

        {vertical === "goods" && <GoodsFilters selected={selected} />}
        {vertical === "cars" && <CarsFilters selected={selected} />}
        {vertical === "realestate" && <RealEstateFilters selected={selected} />}
        {vertical === "jobs" && <JobsFilters selected={selected} />}
        {vertical === "services" && <ServicesFilters selected={selected} />}

        <button
          type="submit"
          className="mt-3 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
        >
          Apply filters
        </button>

        {hasAny(selected) && (
          <a
            href={`/${vertical}`}
            className="mt-2 block text-center text-xs text-ink-mute underline-offset-2 hover:underline"
          >
            Clear all filters
          </a>
        )}
      </form>
    </aside>
  );
}

function hasAny(s: Record<string, string | undefined>) {
  const keys = Object.keys(s).filter((k) => k !== "page" && k !== "sort");
  return keys.some((k) => s[k]);
}

// ---------- Per-vertical groups ----------

function GoodsFilters({ selected }: { selected: Record<string, string | undefined> }) {
  return (
    <>
      <Group title="Category">
        <Select
          name="category"
          defaultValue={selected.category ?? ""}
          options={[
            ["", "All categories"],
            ["clothing", "Clothing"],
            ["furniture", "Furniture"],
            ["electronics", "Electronics"],
            ["appliances", "Appliances"],
            ["sports_outdoors", "Sports & outdoors"],
            ["toys_games", "Toys & games"],
            ["books_media", "Books & media"],
            ["home_garden", "Home & garden"],
            ["tools", "Tools"],
            ["kids_baby", "Kids & baby"],
            ["art_collectibles", "Art & collectibles"],
            ["other", "Other"],
          ]}
        />
      </Group>
      <Group title="Condition">
        <Select
          name="condition"
          defaultValue={selected.condition ?? ""}
          options={[
            ["", "Any condition"],
            ["new", "New"],
            ["like_new", "Like new"],
            ["good", "Good"],
            ["fair", "Fair"],
            ["for_parts", "For parts"],
          ]}
        />
      </Group>
    </>
  );
}

function CarsFilters({ selected }: { selected: Record<string, string | undefined> }) {
  return (
    <>
      <Group title="Fuel">
        <Select
          name="fuelType"
          defaultValue={selected.fuelType ?? ""}
          options={[
            ["", "Any fuel"],
            ["petrol", "Petrol"],
            ["diesel", "Diesel"],
            ["hybrid", "Hybrid"],
            ["phev", "Plug-in hybrid"],
            ["electric", "Electric"],
            ["lpg", "LPG"],
            ["other", "Other"],
          ]}
        />
      </Group>
      <Group title="Transmission">
        <Select
          name="transmission"
          defaultValue={selected.transmission ?? ""}
          options={[
            ["", "Any"],
            ["manual", "Manual"],
            ["automatic", "Automatic"],
            ["semi_auto", "Semi-auto"],
          ]}
        />
      </Group>
      <Group title="Body type">
        <Select
          name="bodyType"
          defaultValue={selected.bodyType ?? ""}
          options={[
            ["", "Any"],
            ["sedan", "Sedan"],
            ["hatchback", "Hatchback"],
            ["wagon", "Wagon"],
            ["suv", "SUV"],
            ["coupe", "Coupe"],
            ["convertible", "Convertible"],
            ["pickup", "Pickup"],
            ["van", "Van"],
            ["minivan", "Minivan"],
            ["other", "Other"],
          ]}
        />
      </Group>
    </>
  );
}

function RealEstateFilters({ selected }: { selected: Record<string, string | undefined> }) {
  return (
    <>
      <Group title="Listing">
        <Select
          name="dealType"
          defaultValue={selected.dealType ?? ""}
          options={[
            ["", "All"],
            ["sale", "For sale"],
            ["rent_long", "Long-term rent"],
            ["rent_short", "Short-term rent"],
          ]}
        />
      </Group>
      <Group title="Property">
        <Select
          name="propertyType"
          defaultValue={selected.propertyType ?? ""}
          options={[
            ["", "Any property"],
            ["apartment", "Apartment"],
            ["house", "House"],
            ["townhouse", "Townhouse"],
            ["cabin", "Cabin"],
            ["plot", "Plot"],
            ["commercial", "Commercial"],
            ["room", "Room"],
            ["other", "Other"],
          ]}
        />
      </Group>
    </>
  );
}

function JobsFilters({ selected }: { selected: Record<string, string | undefined> }) {
  return (
    <>
      <Group title="Employment">
        <Select
          name="employmentType"
          defaultValue={selected.employmentType ?? ""}
          options={[
            ["", "Any"],
            ["full_time", "Full time"],
            ["part_time", "Part time"],
            ["contract", "Contract"],
            ["temporary", "Temporary"],
            ["internship", "Internship"],
            ["freelance", "Freelance"],
            ["volunteer", "Volunteer"],
          ]}
        />
      </Group>
      <Group title="Arrangement">
        <Select
          name="workArrangement"
          defaultValue={selected.workArrangement ?? ""}
          options={[
            ["", "Any"],
            ["onsite", "On-site"],
            ["remote", "Remote"],
            ["hybrid", "Hybrid"],
          ]}
        />
      </Group>
    </>
  );
}

function ServicesFilters({ selected }: { selected: Record<string, string | undefined> }) {
  return (
    <>
      <Group title="Category">
        <Select
          name="category"
          defaultValue={selected.category ?? ""}
          options={[
            ["", "Any"],
            ["home_repair", "Home repair"],
            ["cleaning", "Cleaning"],
            ["moving", "Moving"],
            ["tutoring", "Tutoring"],
            ["design", "Design"],
            ["development", "Development"],
            ["writing", "Writing"],
            ["marketing", "Marketing"],
            ["consulting", "Consulting"],
            ["health_wellness", "Health & wellness"],
            ["events", "Events"],
            ["transportation", "Transportation"],
            ["other", "Other"],
          ]}
        />
      </Group>
      <Group title="Pricing">
        <Select
          name="pricingModel"
          defaultValue={selected.pricingModel ?? ""}
          options={[
            ["", "Any"],
            ["hourly", "Hourly"],
            ["fixed", "Fixed"],
            ["daily", "Daily"],
            ["project", "Per project"],
            ["quote_only", "Quote only"],
          ]}
        />
      </Group>
    </>
  );
}

// ---------- Primitives ----------

function Group({ title, children }: { title: string; children: React.ReactNode }) {
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-ink-edge px-2 py-1.5 text-sm focus:border-ink focus:outline-none ${props.className ?? ""}`}
    />
  );
}

function Select({
  options,
  name,
  defaultValue,
}: {
  options: Array<[string, string]>;
  name: string;
  defaultValue?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="w-full rounded-md border border-ink-edge bg-white px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
