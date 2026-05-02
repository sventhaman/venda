"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Vertical } from "@ichiba/schema";

const STR = (fd: FormData, k: string) => {
  const v = fd.get(k);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
};
const NUM = (fd: FormData, k: string) => {
  const s = STR(fd, k);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};
const BOOL = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const ARR = (fd: FormData, k: string) =>
  STR(fd, k)?.split("\n").map((s) => s.trim()).filter(Boolean);

const VERTICAL_DETAIL_TABLE: Record<Vertical, string> = {
  goods: "listing_goods",
  cars: "listing_cars",
  realestate: "listing_realestate",
  jobs: "listing_jobs",
  services: "listing_services",
};

export async function updateListing(
  vertical: Vertical,
  listingId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+edit+listings");

  const currency = STR(formData, "currency") ?? "USD";
  const priceAmount = NUM(formData, "priceAmount");
  const country = STR(formData, "country");

  // Update the parent listings row first.
  const baseUpdate: Record<string, any> = {
    title: STR(formData, "title"),
    description: STR(formData, "description") ?? null,
    price_amount: priceAmount ?? null,
    price_currency: priceAmount != null ? currency : null,
    country_code: country?.toUpperCase() ?? null,
    region: STR(formData, "region") ?? null,
    city: STR(formData, "city") ?? null,
    postal_code: STR(formData, "postalCode") ?? null,
    images: (ARR(formData, "images") ?? []).map((url) => ({ url })),
  };

  const { error: baseErr } = await supabase
    .from("listings")
    .update(baseUpdate)
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (baseErr) {
    redirect(
      `/account/listings/${listingId}/edit?error=${encodeURIComponent(baseErr.message)}`,
    );
  }

  // Update vertical-specific details with full row replace via upsert.
  const detailRow = buildDetailRow(vertical, formData, currency);
  const { error: detailErr } = await supabase
    .from(VERTICAL_DETAIL_TABLE[vertical])
    .update(detailRow)
    .eq("listing_id", listingId);

  if (detailErr) {
    redirect(
      `/account/listings/${listingId}/edit?error=${encodeURIComponent(detailErr.message)}`,
    );
  }

  revalidatePath(`/${vertical}`);
  revalidatePath(`/${vertical}/${listingId}`);
  revalidatePath("/account/listings");
  redirect(`/${vertical}/${listingId}`);
}

export async function deleteListing(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const vertical = String(formData.get("vertical") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/account/listings?error=${encodeURIComponent(error.message)}`);
  }

  if (vertical) revalidatePath(`/${vertical}`);
  revalidatePath("/account/listings");
  redirect("/account/listings");
}

export async function updateListingStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const update: Record<string, any> = { status };
  if (status === "active") update.published_at = new Date().toISOString();

  await supabase
    .from("listings")
    .update(update)
    .eq("id", id)
    .eq("seller_id", user.id);

  revalidatePath("/account/listings");
}

function buildDetailRow(vertical: Vertical, fd: FormData, currency: string): Record<string, any> {
  switch (vertical) {
    case "goods":
      return {
        category: STR(fd, "category"),
        condition: STR(fd, "condition"),
        brand: STR(fd, "brand") ?? null,
        size: STR(fd, "size") ?? null,
        color: STR(fd, "color") ?? null,
        shipping_available: BOOL(fd, "shippingAvailable"),
        pickup_only: BOOL(fd, "pickupOnly"),
      };
    case "cars":
      return {
        make: STR(fd, "make"),
        model: STR(fd, "model"),
        year: NUM(fd, "year"),
        mileage_km: NUM(fd, "mileageKm") ?? null,
        fuel_type: STR(fd, "fuelType"),
        transmission: STR(fd, "transmission"),
        body_type: STR(fd, "bodyType"),
        drivetrain: STR(fd, "drivetrain") ?? null,
        engine_power_hp: NUM(fd, "enginePowerHp") ?? null,
        exterior_color: STR(fd, "exteriorColor") ?? null,
      };
    case "realestate":
      return {
        deal_type: STR(fd, "dealType"),
        property_type: STR(fd, "propertyType"),
        living_area_sqm: NUM(fd, "livingAreaSqm") ?? null,
        year_built: NUM(fd, "yearBuilt") ?? null,
        bedrooms: NUM(fd, "bedrooms") ?? null,
        bathrooms: NUM(fd, "bathrooms") ?? null,
        energy_rating: STR(fd, "energyRating") ?? null,
        available_from: STR(fd, "availableFrom") ?? null,
        has_elevator: BOOL(fd, "hasElevator"),
        has_balcony: BOOL(fd, "hasBalcony"),
        has_garden: BOOL(fd, "hasGarden"),
        has_parking: BOOL(fd, "hasParking"),
        furnished: BOOL(fd, "furnished"),
      };
    case "jobs": {
      const min = NUM(fd, "salaryMin");
      const max = NUM(fd, "salaryMax");
      return {
        company_name: STR(fd, "companyName"),
        employment_type: STR(fd, "employmentType"),
        work_arrangement: STR(fd, "workArrangement"),
        experience_level: STR(fd, "experienceLevel") ?? null,
        industry: STR(fd, "industry") ?? null,
        function: STR(fd, "function") ?? null,
        salary_min_amount: min ?? null,
        salary_max_amount: max ?? null,
        salary_currency: min != null || max != null ? currency : null,
        salary_period: STR(fd, "salaryPeriod") ?? null,
        application_url: STR(fd, "applicationUrl") ?? null,
        application_deadline: STR(fd, "applicationDeadline") ?? null,
        requirements: ARR(fd, "requirements") ?? null,
        benefits: ARR(fd, "benefits") ?? null,
      };
    }
    case "services": {
      const rate = NUM(fd, "rate");
      return {
        category: STR(fd, "category"),
        pricing_model: STR(fd, "pricingModel"),
        rate_amount: rate ?? null,
        rate_currency: rate != null ? currency : null,
        remote_available: BOOL(fd, "remoteAvailable"),
        service_area: ARR(fd, "serviceArea") ?? null,
        years_of_experience: NUM(fd, "yearsOfExperience") ?? null,
      };
    }
    default:
      return {};
  }
}
