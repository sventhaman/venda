"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { Vertical } from "@ichiba/schema";

// Auto-submitting filter sidebar. Each interaction routes to the same path
// with updated search params via router.push — no Apply button required.
// Multi-select is handled by toggling values in a comma-separated URL list,
// e.g. ?category=furniture,electronics. Text inputs commit on blur so
// keystrokes don't fire a re-fetch on every character.
export function FilterSidebar({
  vertical,
  selected = {},
}: {
  vertical: Vertical;
  selected?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function set(name: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "") params.set(name, value);
    else params.delete(name);
    params.delete("page"); // changing a filter resets to first page
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function toggle(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const cur = params.get(name)?.split(",").filter(Boolean) ?? [];
    const next = cur.includes(value)
      ? cur.filter((v) => v !== value)
      : [...cur, value];
    if (next.length === 0) params.delete(name);
    else params.set(name, next.join(","));
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function isChecked(name: string, value: string) {
    return (selected[name]?.split(",").includes(value)) ?? false;
  }

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="flex flex-col gap-1">
        <Group title="Price">
          <div className="flex gap-2">
            <Input
              name="minPrice"
              type="number"
              min={0}
              placeholder="Min"
              defaultValue={selected.minPrice}
              onCommit={(v) => set("minPrice", v)}
            />
            <Input
              name="maxPrice"
              type="number"
              min={0}
              placeholder="Max"
              defaultValue={selected.maxPrice}
              onCommit={(v) => set("maxPrice", v)}
            />
          </div>
        </Group>

        <Group title="Location">
          <Input
            name="city"
            placeholder="City"
            defaultValue={selected.city}
            onCommit={(v) => set("city", v)}
          />
          <Input
            name="region"
            placeholder="Region"
            defaultValue={selected.region}
            onCommit={(v) => set("region", v)}
            className="mt-2"
          />
          <Input
            name="country"
            placeholder="Country (NO, US, …)"
            maxLength={2}
            defaultValue={selected.country}
            onCommit={(v) => set("country", v?.toUpperCase() ?? null)}
            className="mt-2 uppercase"
          />
        </Group>

        {vertical === "goods" && (
          <GoodsFilters set={set} toggle={toggle} isChecked={isChecked} selected={selected} />
        )}
        {vertical === "cars" && (
          <CarsFilters set={set} selected={selected} />
        )}
        {vertical === "realestate" && (
          <RealEstateFilters set={set} selected={selected} />
        )}
        {vertical === "jobs" && (
          <JobsFilters set={set} selected={selected} />
        )}
        {vertical === "services" && (
          <ServicesFilters set={set} selected={selected} />
        )}

        {hasAnyFilter(selected) && (
          <a
            href={pathname}
            className="mt-4 block text-center text-xs text-ink-mute underline-offset-2 hover:underline"
          >
            Clear all filters
          </a>
        )}
      </div>
    </aside>
  );
}

function hasAnyFilter(s: Record<string, string | undefined>) {
  const keys = Object.keys(s).filter((k) => k !== "page" && k !== "sort");
  return keys.some((k) => s[k]);
}

// ---------- Per-vertical groups ----------

const GOODS_CATEGORIES: Array<[string, string]> = [
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
];

function GoodsFilters({
  toggle,
  isChecked,
  set,
  selected,
}: {
  toggle: (name: string, value: string) => void;
  isChecked: (name: string, value: string) => boolean;
  set: (name: string, value: string | null) => void;
  selected: Record<string, string | undefined>;
}) {
  return (
    <>
      <Group title="Category">
        <ul className="space-y-1.5">
          {GOODS_CATEGORIES.map(([v, label]) => (
            <li key={v}>
              <Check
                checked={isChecked("category", v)}
                onChange={() => toggle("category", v)}
                label={label}
              />
            </li>
          ))}
        </ul>
      </Group>
      <Group title="Condition">
        <Select
          name="condition"
          value={selected.condition ?? ""}
          onChange={(v) => set("condition", v || null)}
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

const CAR_MAKES = [
  "Audi", "BMW", "Citroën", "Fiat", "Ford", "Honda", "Hyundai", "Kia",
  "Lexus", "Mazda", "Mercedes-Benz", "Nissan", "Opel", "Peugeot", "Porsche",
  "Renault", "Skoda", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

function CarsFilters({
  set,
  selected,
}: {
  set: (name: string, value: string | null) => void;
  selected: Record<string, string | undefined>;
}) {
  return (
    <>
      <Group title="Make / model">
        <Input
          name="make"
          list="car-makes"
          placeholder="Make"
          defaultValue={selected.make}
          onCommit={(v) => set("make", v)}
        />
        <datalist id="car-makes">
          {CAR_MAKES.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <Input
          name="model"
          placeholder="Model"
          defaultValue={selected.model}
          onCommit={(v) => set("model", v)}
          className="mt-2"
        />
      </Group>
      <Group title="Fuel">
        <Select
          name="fuelType"
          value={selected.fuelType ?? ""}
          onChange={(v) => set("fuelType", v || null)}
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
          value={selected.transmission ?? ""}
          onChange={(v) => set("transmission", v || null)}
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
          value={selected.bodyType ?? ""}
          onChange={(v) => set("bodyType", v || null)}
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

function RealEstateFilters({
  set,
  selected,
}: {
  set: (name: string, value: string | null) => void;
  selected: Record<string, string | undefined>;
}) {
  return (
    <>
      <Group title="Listing">
        <Select
          name="dealType"
          value={selected.dealType ?? ""}
          onChange={(v) => set("dealType", v || null)}
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
          value={selected.propertyType ?? ""}
          onChange={(v) => set("propertyType", v || null)}
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

function JobsFilters({
  set,
  selected,
}: {
  set: (name: string, value: string | null) => void;
  selected: Record<string, string | undefined>;
}) {
  return (
    <>
      <Group title="Employment">
        <Select
          name="employmentType"
          value={selected.employmentType ?? ""}
          onChange={(v) => set("employmentType", v || null)}
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
          value={selected.workArrangement ?? ""}
          onChange={(v) => set("workArrangement", v || null)}
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

function ServicesFilters({
  set,
  selected,
}: {
  set: (name: string, value: string | null) => void;
  selected: Record<string, string | undefined>;
}) {
  return (
    <>
      <Group title="Category">
        <Select
          name="category"
          value={selected.category ?? ""}
          onChange={(v) => set("category", v || null)}
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
          value={selected.pricingModel ?? ""}
          onChange={(v) => set("pricingModel", v || null)}
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

function Input({
  onCommit,
  className = "",
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onCommit: (value: string) => void;
}) {
  return (
    <input
      {...props}
      onBlur={(e) => onCommit(e.target.value.trim())}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={`w-full rounded-md border border-ink-edge px-2 py-1.5 text-sm focus:border-ink focus:outline-none ${className}`}
    />
  );
}

function Select({
  options,
  value,
  onChange,
  name,
}: {
  options: Array<[string, string]>;
  value: string;
  onChange: (value: string) => void;
  name?: string;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-mute hover:text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-ink-edge text-accent focus:ring-accent"
      />
      <span>{label}</span>
    </label>
  );
}
