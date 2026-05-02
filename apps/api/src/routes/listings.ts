import { Hono } from "hono";
import { ListingSearchQuery, NewListing } from "@ichiba/schema";
import type { Env } from "../lib/supabase.js";
import { authMiddleware, requireScope, type AuthVariables } from "../middleware/auth.js";
import { getListing, searchListings } from "../lib/listings.js";

const VERTICAL_DETAIL_TABLE: Record<string, string> = {
  goods: "listing_goods",
  cars: "listing_cars",
  realestate: "listing_realestate",
  jobs: "listing_jobs",
  services: "listing_services",
};

export const listingsRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Public: search.
listingsRoutes.get("/", async (c) => {
  const parsed = ListingSearchQuery.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const { serviceClient } = await import("../lib/supabase.js");
  const supa = serviceClient(c.env);
  try {
    const result = await searchListings(supa, parsed.data);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message ?? "search failed" }, 500);
  }
});

// Public: get one.
listingsRoutes.get("/:id", async (c) => {
  const { serviceClient } = await import("../lib/supabase.js");
  const supa = serviceClient(c.env);
  const listing = await getListing(supa, c.req.param("id"));
  if (!listing) return c.json({ error: "not found" }, 404);
  return c.json(listing);
});

// Authenticated: create.
listingsRoutes.post("/", authMiddleware, requireScope("listings:write"), async (c) => {
  const body = await c.req.json();
  const parsed = NewListing.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const supa = c.get("supabase");
  const userId = c.get("authedUserId");
  const isAgent = c.get("authMethod") === "api_key";
  const input = parsed.data;

  const { data: listing, error } = await supa
    .from("listings")
    .insert({
      vertical: input.vertical,
      status: input.status,
      title: input.title,
      description: input.description,
      price_amount: input.price?.amount,
      price_currency: input.price?.currency,
      country_code: input.location?.country,
      region: input.location?.region,
      city: input.location?.city,
      postal_code: input.location?.postalCode,
      images: input.images ?? [],
      seller_id: userId,
      agent_created: isAgent,
      published_at: input.status === "active" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error || !listing) return c.json({ error: error?.message ?? "create failed" }, 500);

  // Insert detail row.
  const detail = mapDetailToRow(input);
  const detailTable = VERTICAL_DETAIL_TABLE[input.vertical];
  const { error: detailError } = await supa
    .from(detailTable)
    .insert({ listing_id: listing.id, ...detail });

  if (detailError) {
    // Roll back parent if detail insert failed.
    await supa.from("listings").delete().eq("id", listing.id);
    return c.json({ error: detailError.message }, 500);
  }

  const full = await getListing(supa, listing.id);
  return c.json(full, 201);
});

// Authenticated: update.
listingsRoutes.patch("/:id", authMiddleware, requireScope("listings:write"), async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const supa = c.get("supabase");

  const updates: Record<string, any> = {};
  if (body.title) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.status) updates.status = body.status;
  if (body.price) {
    updates.price_amount = body.price.amount;
    updates.price_currency = body.price.currency;
  }
  if (body.images) updates.images = body.images;

  if (body.status === "active") updates.published_at = new Date().toISOString();

  const { error } = await supa.from("listings").update(updates).eq("id", id);
  if (error) return c.json({ error: error.message }, 400);

  const full = await getListing(supa, id);
  return c.json(full);
});

// Authenticated: delete.
listingsRoutes.delete("/:id", authMiddleware, requireScope("listings:write"), async (c) => {
  const supa = c.get("supabase");
  const { error } = await supa.from("listings").delete().eq("id", c.req.param("id"));
  if (error) return c.json({ error: error.message }, 400);
  return c.body(null, 204);
});

function mapDetailToRow(input: any): Record<string, any> {
  const d = input.details;
  switch (input.vertical) {
    case "goods":
      return {
        category: d.category,
        condition: d.condition,
        brand: d.brand,
        size: d.size,
        color: d.color,
        shipping_available: d.shippingAvailable,
        pickup_only: d.pickupOnly,
      };
    case "cars":
      return {
        make: d.make,
        model: d.model,
        year: d.year,
        mileage_km: d.mileageKm,
        fuel_type: d.fuelType,
        transmission: d.transmission,
        body_type: d.bodyType,
        drivetrain: d.drivetrain,
        engine_power_hp: d.enginePowerHp,
        engine_size_cc: d.engineSizeCc,
        exterior_color: d.exteriorColor,
        interior_color: d.interiorColor,
        vin: d.vin,
        registration_number: d.registrationNumber,
        first_registration: d.firstRegistration,
        number_of_owners: d.numberOfOwners,
        has_service_history: d.hasServiceHistory,
        accident_free: d.accidentFree,
      };
    case "realestate":
      return {
        deal_type: d.dealType,
        property_type: d.propertyType,
        ownership: d.ownership,
        living_area_sqm: d.livingAreaSqm,
        plot_area_sqm: d.plotAreaSqm,
        bedrooms: d.bedrooms,
        bathrooms: d.bathrooms,
        rooms: d.rooms,
        year_built: d.yearBuilt,
        energy_rating: d.energyRating,
        floor: d.floor,
        has_elevator: d.hasElevator,
        has_balcony: d.hasBalcony,
        has_garden: d.hasGarden,
        has_parking: d.hasParking,
        furnished: d.furnished,
        monthly_costs_amount: d.monthlyCosts?.amount,
        monthly_costs_currency: d.monthlyCosts?.currency,
        deposit_amount: d.depositAmount?.amount,
        deposit_currency: d.depositAmount?.currency,
        available_from: d.availableFrom,
        minimum_stay_months: d.minimumStayMonths,
      };
    case "jobs":
      return {
        company_name: d.companyName,
        employment_type: d.employmentType,
        work_arrangement: d.workArrangement,
        experience_level: d.experienceLevel,
        industry: d.industry,
        function: d.function,
        salary_min_amount: d.salaryMin?.amount,
        salary_max_amount: d.salaryMax?.amount,
        salary_currency: d.salaryMin?.currency ?? d.salaryMax?.currency,
        salary_period: d.salaryPeriod,
        application_url: d.applicationUrl,
        application_deadline: d.applicationDeadline,
        start_date: d.startDate,
        requirements: d.requirements,
        benefits: d.benefits,
      };
    case "services":
      return {
        category: d.category,
        pricing_model: d.pricingModel,
        rate_amount: d.rate?.amount,
        rate_currency: d.rate?.currency,
        remote_available: d.remoteAvailable,
        service_area: d.serviceArea,
        response_time_hours: d.responseTimeHours,
        years_of_experience: d.yearsOfExperience,
        credentials: d.credentials,
      };
    default:
      return {};
  }
}
