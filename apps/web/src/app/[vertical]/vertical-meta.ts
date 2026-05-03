import type { Vertical } from "@ichiba/schema";

// Per-vertical landing copy + filter-pill labels. Centralized here so the
// page, the FilterPills, and any future MobileFilterDrawer all read the
// same source.

export const VERTICAL_META: Record<
  Vertical,
  { title: string; tagline: string; blurb: string }
> = {
  goods: {
    title: "Marketplace",
    tagline: "Buy and sell anything",
    blurb: "Used clothes, furniture, electronics — or anything else worth a listing.",
  },
  cars: {
    title: "Cars",
    tagline: "Buy and sell cars on ichiba",
    blurb: "Hatchbacks to hypercars. Every fuel type, every budget.",
  },
  realestate: {
    title: "Real estate",
    tagline: "Find a place, list your own",
    blurb: "Apartments, houses, cabins — for sale, long-term rent, or short stays.",
  },
  jobs: {
    title: "Jobs",
    tagline: "Hire someone, find work",
    blurb: "Full-time, freelance, on-site or remote. Posted by people and agents.",
  },
  services: {
    title: "Services",
    tagline: "Get something done, or offer your skills",
    blurb: "Home repair, design, tutoring, consulting — hourly, fixed, or quoted.",
  },
};

// Reverse-lookup tables for value → human label, used by FilterPills.
const labelMaps = {
  category: {
    // goods + services share the key
    clothing: "Clothing",
    furniture: "Furniture",
    electronics: "Electronics",
    appliances: "Appliances",
    sports_outdoors: "Sports & outdoors",
    toys_games: "Toys & games",
    books_media: "Books & media",
    home_garden: "Home & garden",
    tools: "Tools",
    kids_baby: "Kids & baby",
    art_collectibles: "Art & collectibles",
    home_repair: "Home repair",
    cleaning: "Cleaning",
    moving: "Moving",
    tutoring: "Tutoring",
    design: "Design",
    development: "Development",
    writing: "Writing",
    marketing: "Marketing",
    consulting: "Consulting",
    health_wellness: "Health & wellness",
    events: "Events",
    transportation: "Transportation",
    other: "Other",
  } as Record<string, string>,
  condition: {
    new: "New",
    like_new: "Like new",
    good: "Good",
    fair: "Fair",
    for_parts: "For parts",
  } as Record<string, string>,
  fuelType: {
    petrol: "Petrol",
    diesel: "Diesel",
    hybrid: "Hybrid",
    phev: "Plug-in hybrid",
    electric: "Electric",
    lpg: "LPG",
    other: "Other",
  } as Record<string, string>,
  transmission: {
    manual: "Manual",
    automatic: "Automatic",
    semi_auto: "Semi-auto",
  } as Record<string, string>,
  bodyType: {
    sedan: "Sedan",
    hatchback: "Hatchback",
    wagon: "Wagon",
    suv: "SUV",
    coupe: "Coupe",
    convertible: "Convertible",
    pickup: "Pickup",
    van: "Van",
    minivan: "Minivan",
    other: "Other",
  } as Record<string, string>,
  dealType: {
    sale: "For sale",
    rent_long: "Long-term rent",
    rent_short: "Short-term rent",
  } as Record<string, string>,
  propertyType: {
    apartment: "Apartment",
    house: "House",
    townhouse: "Townhouse",
    cabin: "Cabin",
    plot: "Plot",
    commercial: "Commercial",
    room: "Room",
    other: "Other",
  } as Record<string, string>,
  employmentType: {
    full_time: "Full time",
    part_time: "Part time",
    contract: "Contract",
    temporary: "Temporary",
    internship: "Internship",
    freelance: "Freelance",
    volunteer: "Volunteer",
  } as Record<string, string>,
  workArrangement: {
    onsite: "On-site",
    remote: "Remote",
    hybrid: "Hybrid",
  } as Record<string, string>,
  pricingModel: {
    hourly: "Hourly",
    fixed: "Fixed",
    daily: "Daily",
    project: "Per project",
    quote_only: "Quote only",
  } as Record<string, string>,
};

// Group label for a filter key (e.g. fuelType → "Fuel").
const GROUP_LABEL: Record<string, string> = {
  category: "Category",
  condition: "Condition",
  fuelType: "Fuel",
  transmission: "Transmission",
  bodyType: "Body",
  make: "Make",
  model: "Model",
  dealType: "Listing",
  propertyType: "Property",
  employmentType: "Employment",
  workArrangement: "Arrangement",
  pricingModel: "Pricing",
  city: "City",
  region: "Region",
  country: "Country",
  minPrice: "Min price",
  maxPrice: "Max price",
  q: "Search",
};

// Keys that should appear as filter pills. Excludes pagination/sort/etc.
const PILL_KEYS = [
  "q",
  "category",
  "condition",
  "fuelType",
  "transmission",
  "bodyType",
  "make",
  "model",
  "dealType",
  "propertyType",
  "employmentType",
  "workArrangement",
  "pricingModel",
  "city",
  "region",
  "country",
  "minPrice",
  "maxPrice",
];

export type ActivePill = {
  key: string;
  groupLabel: string;
  valueLabel: string;
  // The value to remove when clicking X. For multi-select, only this one
  // value is removed; the rest stay.
  removeValue: string;
};

export function activePillsFromParams(
  params: Record<string, string | undefined>,
): ActivePill[] {
  const pills: ActivePill[] = [];
  for (const key of PILL_KEYS) {
    const raw = params[key];
    if (!raw) continue;

    const groupLabel = GROUP_LABEL[key] ?? key;

    // Multi-select keys (currently `category`) come in comma-separated.
    if (raw.includes(",")) {
      for (const part of raw.split(",").filter(Boolean)) {
        pills.push({
          key,
          groupLabel,
          valueLabel: humanLabel(key, part),
          removeValue: part,
        });
      }
    } else {
      pills.push({
        key,
        groupLabel,
        valueLabel: humanLabel(key, raw),
        removeValue: raw,
      });
    }
  }
  return pills;
}

function humanLabel(key: string, value: string): string {
  const map = (labelMaps as Record<string, Record<string, string>>)[key];
  if (map && map[value]) return map[value]!;
  if (key === "minPrice") return `from ${value}`;
  if (key === "maxPrice") return `up to ${value}`;
  if (key === "country") return value.toUpperCase();
  return value;
}

// Build a URL with a filter pill removed. For multi-select keys, removes only
// the one value; otherwise removes the whole key.
export function urlWithoutPill(
  basePath: string,
  params: Record<string, string | undefined>,
  pill: ActivePill,
): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (!v) continue;
    if (k === "page") continue;
    if (k === pill.key) {
      const remaining = v
        .split(",")
        .filter((x) => x !== pill.removeValue)
        .filter(Boolean);
      if (remaining.length > 0) next.set(k, remaining.join(","));
    } else {
      next.set(k, v);
    }
  }
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function activeFilterCount(
  params: Record<string, string | undefined>,
): number {
  return activePillsFromParams(params).length;
}
