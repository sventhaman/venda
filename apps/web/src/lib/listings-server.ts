// Server-side listings queries for the web app. We hit Supabase directly
// instead of round-tripping through the Hono API at /v1/listings — for our
// own UI there's no reason to add a hop. The Hono API still exposes the same
// queries to external agents and MCP clients.
//
// Performance note: we use PostgREST embedded selects to fetch the parent
// listing + its vertical-specific detail row in a single round trip. Without
// this we'd do parent → details as two sequential calls (fetchDetails fanning
// out N+1 by vertical). One query, all the data.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Listing, ListingSearchQuery } from "@venda/schema";

const VERTICAL_DETAIL_TABLE: Record<string, string> = {
  goods: "listing_goods",
  cars: "listing_cars",
  realestate: "listing_realestate",
  jobs: "listing_jobs",
  services: "listing_services",
};

// Embed every detail table as a left join. Only the row matching the listing's
// `vertical` will be populated; the rest come back null. PostgREST collapses
// this into one round trip.
const FULL_SELECT = `
  *,
  listing_goods(*),
  listing_cars(*),
  listing_realestate(*),
  listing_jobs(*),
  listing_services(*)
`.replace(/\s+/g, " ");

// Vertical-specific filter map. Each entry names a column on the matching
// detail table; PostgREST embedded filtering applies them transparently.
// Array values use `.in()` for multi-select (e.g. category=furniture,electronics).
type DetailFilters = {
  goods?: { category?: string | string[]; condition?: string };
  cars?: {
    make?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
  };
  realestate?: { dealType?: string; propertyType?: string };
  jobs?: { employmentType?: string; workArrangement?: string };
  services?: { category?: string; pricingModel?: string };
};

export type SearchInput = Partial<ListingSearchQuery> & {
  vertical?: string;
  page?: number;
  pageSize?: number;
  details?: DetailFilters;
};

export type SearchResult = {
  items: Listing[];
  total: number;
  page: number;
  pageSize: number;
};

export async function searchListings(
  supabase: SupabaseClient,
  q: SearchInput,
): Promise<SearchResult> {
  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 24;
  const status = q.status ?? "active";
  const sort = q.sort ?? "newest";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("listings")
    .select(FULL_SELECT, { count: "exact" })
    .eq("status", status)
    .range(from, to);

  if (q.vertical) query = query.eq("vertical", q.vertical);
  if (q.minPrice != null) query = query.gte("price_amount", q.minPrice);
  if (q.maxPrice != null) query = query.lte("price_amount", q.maxPrice);
  if (q.country) query = query.eq("country_code", q.country);
  if (q.region) query = query.eq("region", q.region);
  if (q.city) query = query.ilike("city", q.city);
  if (q.q) {
    query = query.textSearch("search", q.q, { type: "websearch", config: "simple" });
  }

  // Per-vertical detail filters. PostgREST applies these against the embedded
  // relation when the relation name is used in the column path. Arrays use
  // .in() for multi-select; single strings use .eq(). ilike() for free-form
  // text fields like Make/Model so users can type partial values.
  const d = q.details;
  if (q.vertical && d) {
    const eqOrIn = (rel: string, col: string, val: string | string[] | undefined) => {
      if (!val || (Array.isArray(val) && val.length === 0)) return;
      if (Array.isArray(val)) query = query.in(`${rel}.${col}`, val);
      else query = query.eq(`${rel}.${col}`, val);
    };
    const ilikeIf = (rel: string, col: string, val: string | undefined) => {
      if (val) query = query.ilike(`${rel}.${col}`, `%${val}%`);
    };

    if (q.vertical === "goods" && d.goods) {
      eqOrIn("listing_goods", "category", d.goods.category);
      eqOrIn("listing_goods", "condition", d.goods.condition);
    } else if (q.vertical === "cars" && d.cars) {
      ilikeIf("listing_cars", "make", d.cars.make);
      ilikeIf("listing_cars", "model", d.cars.model);
      eqOrIn("listing_cars", "fuel_type", d.cars.fuelType);
      eqOrIn("listing_cars", "transmission", d.cars.transmission);
      eqOrIn("listing_cars", "body_type", d.cars.bodyType);
    } else if (q.vertical === "realestate" && d.realestate) {
      eqOrIn("listing_realestate", "deal_type", d.realestate.dealType);
      eqOrIn("listing_realestate", "property_type", d.realestate.propertyType);
    } else if (q.vertical === "jobs" && d.jobs) {
      eqOrIn("listing_jobs", "employment_type", d.jobs.employmentType);
      eqOrIn("listing_jobs", "work_arrangement", d.jobs.workArrangement);
    } else if (q.vertical === "services" && d.services) {
      eqOrIn("listing_services", "category", d.services.category);
      eqOrIn("listing_services", "pricing_model", d.services.pricingModel);
    }
  }

  switch (sort) {
    case "newest":
      query = query.order("published_at", { ascending: false, nullsFirst: false });
      break;
    case "oldest":
      query = query.order("published_at", { ascending: true, nullsFirst: true });
      break;
    case "price_asc":
      query = query.order("price_amount", { ascending: true, nullsFirst: true });
      break;
    case "price_desc":
      query = query.order("price_amount", { ascending: false, nullsFirst: false });
      break;
  }

  const { data: rows, count, error } = await query;
  if (error) throw error;

  const items = (rows ?? []).map((row: any) => rowToListing(row));
  return { items, total: count ?? items.length, page, pageSize };
}

export async function getListing(
  supabase: SupabaseClient,
  id: string,
): Promise<Listing | null> {
  const { data: row, error } = await supabase
    .from("listings")
    .select(FULL_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;
  return rowToListing(row as any);
}

function rowToListing(row: any): Listing {
  // Pluck the matching detail object from the embedded set.
  const detailRow = row[VERTICAL_DETAIL_TABLE[row.vertical] ?? ""] ?? null;

  const base = {
    id: row.id,
    vertical: row.vertical,
    status: row.status,
    title: row.title,
    description: row.description ?? undefined,
    price:
      row.price_amount != null && row.price_currency
        ? { amount: Number(row.price_amount), currency: row.price_currency }
        : undefined,
    location: row.country_code
      ? {
          country: row.country_code,
          region: row.region ?? undefined,
          city: row.city ?? undefined,
          postalCode: row.postal_code ?? undefined,
        }
      : undefined,
    images: row.images ?? [],
    sellerId: row.seller_id,
    agentCreated: row.agent_created,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? null,
    expiresAt: row.expires_at ?? null,
  };
  return { ...base, details: mapDetails(row.vertical, detailRow) } as Listing;
}

function mapDetails(vertical: string, d: any): any {
  if (!d) return {};
  switch (vertical) {
    case "goods":
      return {
        category: d.category,
        condition: d.condition,
        brand: d.brand ?? undefined,
        size: d.size ?? undefined,
        color: d.color ?? undefined,
        shippingAvailable: d.shipping_available,
        pickupOnly: d.pickup_only,
      };
    case "cars":
      return {
        make: d.make,
        model: d.model,
        year: d.year,
        mileageKm: d.mileage_km ?? undefined,
        fuelType: d.fuel_type,
        transmission: d.transmission,
        bodyType: d.body_type,
        drivetrain: d.drivetrain ?? undefined,
        enginePowerHp: d.engine_power_hp ?? undefined,
        engineSizeCc: d.engine_size_cc ?? undefined,
        exteriorColor: d.exterior_color ?? undefined,
        interiorColor: d.interior_color ?? undefined,
      };
    case "realestate":
      return {
        dealType: d.deal_type,
        propertyType: d.property_type,
        livingAreaSqm: d.living_area_sqm ?? undefined,
        bedrooms: d.bedrooms ?? undefined,
        bathrooms: d.bathrooms ?? undefined,
        rooms: d.rooms ?? undefined,
        yearBuilt: d.year_built ?? undefined,
        energyRating: d.energy_rating ?? undefined,
        hasElevator: d.has_elevator ?? undefined,
        hasBalcony: d.has_balcony ?? undefined,
        hasGarden: d.has_garden ?? undefined,
        hasParking: d.has_parking ?? undefined,
        furnished: d.furnished ?? undefined,
      };
    case "jobs":
      return {
        companyName: d.company_name,
        employmentType: d.employment_type,
        workArrangement: d.work_arrangement,
        experienceLevel: d.experience_level ?? undefined,
        industry: d.industry ?? undefined,
        function: d.function ?? undefined,
        applicationUrl: d.application_url ?? undefined,
        applicationDeadline: d.application_deadline ?? undefined,
      };
    case "services":
      return {
        category: d.category,
        pricingModel: d.pricing_model,
        rate:
          d.rate_amount != null
            ? { amount: Number(d.rate_amount), currency: d.rate_currency }
            : undefined,
        remoteAvailable: d.remote_available,
        serviceArea: d.service_area ?? undefined,
        yearsOfExperience: d.years_of_experience ?? undefined,
      };
    default:
      return {};
  }
}
