"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { NewListing, type Vertical } from "@ichiba/schema";

const VERTICAL_DETAIL_TABLE: Record<Vertical, string> = {
  goods: "listing_goods",
  cars: "listing_cars",
  realestate: "listing_realestate",
  jobs: "listing_jobs",
  services: "listing_services",
};

// Inserts the parent listing row + the matching vertical-specific detail row.
// The user-scoped Supabase client must already be authenticated; RLS ensures
// the inserted seller_id equals auth.uid().
export async function createListing(supabase: SupabaseClient, userId: string, input: unknown) {
  const parsed = NewListing.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }
  const data = parsed.data;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      vertical: data.vertical,
      status: data.status,
      title: data.title,
      description: data.description ?? null,
      price_amount: data.price?.amount ?? null,
      price_currency: data.price?.currency ?? null,
      country_code: data.location?.country ?? null,
      region: data.location?.region ?? null,
      city: data.location?.city ?? null,
      postal_code: data.location?.postalCode ?? null,
      images: data.images ?? [],
      seller_id: userId,
      published_at: data.status === "active" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error || !listing) return { ok: false as const, error: error?.message ?? "insert failed" };

  const detailRow = mapDetailToRow(data);
  const { error: detailError } = await supabase
    .from(VERTICAL_DETAIL_TABLE[data.vertical])
    .insert({ listing_id: listing.id, ...detailRow });

  if (detailError) {
    // Roll back parent if detail insert failed.
    await supabase.from("listings").delete().eq("id", listing.id);
    return { ok: false as const, error: detailError.message };
  }

  return { ok: true as const, listing };
}

function mapDetailToRow(input: ReturnType<typeof NewListing.parse>): Record<string, any> {
  const d = input.details as any;
  switch (input.vertical) {
    case "goods":
      return {
        category: d.category,
        condition: d.condition,
        brand: d.brand ?? null,
        size: d.size ?? null,
        color: d.color ?? null,
        shipping_available: d.shippingAvailable ?? false,
        pickup_only: d.pickupOnly ?? false,
      };
    case "cars":
      return {
        make: d.make,
        model: d.model,
        year: d.year,
        mileage_km: d.mileageKm ?? null,
        fuel_type: d.fuelType,
        transmission: d.transmission,
        body_type: d.bodyType,
        drivetrain: d.drivetrain ?? null,
        engine_power_hp: d.enginePowerHp ?? null,
        engine_size_cc: d.engineSizeCc ?? null,
        exterior_color: d.exteriorColor ?? null,
        interior_color: d.interiorColor ?? null,
        vin: d.vin ?? null,
        registration_number: d.registrationNumber ?? null,
        first_registration: d.firstRegistration ?? null,
        number_of_owners: d.numberOfOwners ?? null,
        has_service_history: d.hasServiceHistory ?? null,
        accident_free: d.accidentFree ?? null,
      };
    case "realestate":
      return {
        deal_type: d.dealType,
        property_type: d.propertyType,
        ownership: d.ownership ?? null,
        living_area_sqm: d.livingAreaSqm ?? null,
        plot_area_sqm: d.plotAreaSqm ?? null,
        bedrooms: d.bedrooms ?? null,
        bathrooms: d.bathrooms ?? null,
        rooms: d.rooms ?? null,
        year_built: d.yearBuilt ?? null,
        energy_rating: d.energyRating ?? null,
        floor: d.floor ?? null,
        has_elevator: d.hasElevator ?? null,
        has_balcony: d.hasBalcony ?? null,
        has_garden: d.hasGarden ?? null,
        has_parking: d.hasParking ?? null,
        furnished: d.furnished ?? null,
        monthly_costs_amount: d.monthlyCosts?.amount ?? null,
        monthly_costs_currency: d.monthlyCosts?.currency ?? null,
        deposit_amount: d.depositAmount?.amount ?? null,
        deposit_currency: d.depositAmount?.currency ?? null,
        available_from: d.availableFrom ?? null,
        minimum_stay_months: d.minimumStayMonths ?? null,
      };
    case "jobs":
      return {
        company_name: d.companyName,
        employment_type: d.employmentType,
        work_arrangement: d.workArrangement,
        experience_level: d.experienceLevel ?? null,
        industry: d.industry ?? null,
        function: d.function ?? null,
        salary_min_amount: d.salaryMin?.amount ?? null,
        salary_max_amount: d.salaryMax?.amount ?? null,
        salary_currency: d.salaryMin?.currency ?? d.salaryMax?.currency ?? null,
        salary_period: d.salaryPeriod ?? null,
        application_url: d.applicationUrl ?? null,
        application_deadline: d.applicationDeadline ?? null,
        start_date: d.startDate ?? null,
        requirements: d.requirements ?? null,
        benefits: d.benefits ?? null,
      };
    case "services":
      return {
        category: d.category,
        pricing_model: d.pricingModel,
        rate_amount: d.rate?.amount ?? null,
        rate_currency: d.rate?.currency ?? null,
        remote_available: d.remoteAvailable ?? false,
        service_area: d.serviceArea ?? null,
        response_time_hours: d.responseTimeHours ?? null,
        years_of_experience: d.yearsOfExperience ?? null,
        credentials: d.credentials ?? null,
      };
    default:
      return {};
  }
}
