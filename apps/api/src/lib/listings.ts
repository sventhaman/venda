import type { SupabaseClient } from "@supabase/supabase-js";
import { ListingSearchQuery, type Listing } from "@ichiba/schema";
import { z } from "zod";

const VERTICAL_DETAIL_TABLE: Record<string, string> = {
  goods: "listing_goods",
  cars: "listing_cars",
  realestate: "listing_realestate",
  jobs: "listing_jobs",
  services: "listing_services",
};

function rowToListing(row: any, detailRow: any): Listing {
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
        vin: d.vin ?? undefined,
        registrationNumber: d.registration_number ?? undefined,
        firstRegistration: d.first_registration ?? undefined,
        numberOfOwners: d.number_of_owners ?? undefined,
        hasServiceHistory: d.has_service_history ?? undefined,
        accidentFree: d.accident_free ?? undefined,
      };
    case "realestate":
      return {
        dealType: d.deal_type,
        propertyType: d.property_type,
        ownership: d.ownership ?? undefined,
        livingAreaSqm: d.living_area_sqm ?? undefined,
        plotAreaSqm: d.plot_area_sqm ?? undefined,
        bedrooms: d.bedrooms ?? undefined,
        bathrooms: d.bathrooms ?? undefined,
        rooms: d.rooms ?? undefined,
        yearBuilt: d.year_built ?? undefined,
        energyRating: d.energy_rating ?? undefined,
        floor: d.floor ?? undefined,
        hasElevator: d.has_elevator ?? undefined,
        hasBalcony: d.has_balcony ?? undefined,
        hasGarden: d.has_garden ?? undefined,
        hasParking: d.has_parking ?? undefined,
        furnished: d.furnished ?? undefined,
        monthlyCosts:
          d.monthly_costs_amount != null
            ? { amount: Number(d.monthly_costs_amount), currency: d.monthly_costs_currency }
            : undefined,
        depositAmount:
          d.deposit_amount != null
            ? { amount: Number(d.deposit_amount), currency: d.deposit_currency }
            : undefined,
        availableFrom: d.available_from ?? undefined,
        minimumStayMonths: d.minimum_stay_months ?? undefined,
      };
    case "jobs":
      return {
        companyName: d.company_name,
        employmentType: d.employment_type,
        workArrangement: d.work_arrangement,
        experienceLevel: d.experience_level ?? undefined,
        industry: d.industry ?? undefined,
        function: d.function ?? undefined,
        salaryMin:
          d.salary_min_amount != null
            ? { amount: Number(d.salary_min_amount), currency: d.salary_currency }
            : undefined,
        salaryMax:
          d.salary_max_amount != null
            ? { amount: Number(d.salary_max_amount), currency: d.salary_currency }
            : undefined,
        salaryPeriod: d.salary_period ?? undefined,
        applicationUrl: d.application_url ?? undefined,
        applicationDeadline: d.application_deadline ?? undefined,
        startDate: d.start_date ?? undefined,
        requirements: d.requirements ?? undefined,
        benefits: d.benefits ?? undefined,
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
        responseTimeHours: d.response_time_hours ?? undefined,
        yearsOfExperience: d.years_of_experience ?? undefined,
        credentials: d.credentials ?? undefined,
      };
    default:
      return {};
  }
}

export type SearchInput = z.infer<typeof ListingSearchQuery>;

export async function searchListings(supabase: SupabaseClient, q: SearchInput) {
  const from = (q.page - 1) * q.pageSize;
  const to = from + q.pageSize - 1;

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", q.status)
    .range(from, to);

  if (q.vertical) query = query.eq("vertical", q.vertical);
  if (q.minPrice != null) query = query.gte("price_amount", q.minPrice);
  if (q.maxPrice != null) query = query.lte("price_amount", q.maxPrice);
  if (q.country) query = query.eq("country_code", q.country);
  if (q.region) query = query.eq("region", q.region);
  if (q.city) query = query.ilike("city", q.city);

  if (q.q) {
    // Postgres FTS via the `search` tsvector kept fresh by trigger.
    query = query.textSearch("search", q.q, { type: "websearch", config: "simple" });
  }

  switch (q.sort) {
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

  const detailsByVertical = await fetchDetails(supabase, rows ?? []);
  const items = (rows ?? []).map((row) => rowToListing(row, detailsByVertical.get(row.id)));

  return {
    items,
    total: count ?? items.length,
    page: q.page,
    pageSize: q.pageSize,
  };
}

export async function getListing(supabase: SupabaseClient, id: string): Promise<Listing | null> {
  const { data: row, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const table = VERTICAL_DETAIL_TABLE[row.vertical];
  const { data: details } = await supabase.from(table).select("*").eq("listing_id", id).maybeSingle();
  return rowToListing(row, details);
}

async function fetchDetails(supabase: SupabaseClient, rows: any[]) {
  const byVertical = new Map<string, string[]>();
  for (const r of rows) {
    const arr = byVertical.get(r.vertical) ?? [];
    arr.push(r.id);
    byVertical.set(r.vertical, arr);
  }

  const result = new Map<string, any>();
  await Promise.all(
    Array.from(byVertical.entries()).map(async ([vertical, ids]) => {
      const table = VERTICAL_DETAIL_TABLE[vertical];
      if (!table || ids.length === 0) return;
      const { data } = await supabase.from(table).select("*").in("listing_id", ids);
      for (const d of data ?? []) result.set(d.listing_id, d);
    }),
  );
  return result;
}
