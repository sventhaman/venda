import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateListing, deleteListing } from "../../actions";
import { SubmitBar, type ListingFormDefaults } from "@/components/listing-form/shared";
import { GoodsForm } from "@/components/listing-form/goods-form";
import { CarsForm } from "@/components/listing-form/cars-form";
import { RealEstateForm } from "@/components/listing-form/realestate-form";
import { JobsForm } from "@/components/listing-form/jobs-form";
import { ServicesForm } from "@/components/listing-form/services-form";
import { type Vertical } from "@ichiba/schema";

const VERTICAL_DETAIL_TABLE: Record<string, string> = {
  goods: "listing_goods",
  cars: "listing_cars",
  realestate: "listing_realestate",
  jobs: "listing_jobs",
  services: "listing_services",
};

const VERTICAL_TITLES: Record<Vertical, string> = {
  goods: "Marketplace item",
  cars: "Car",
  realestate: "Property",
  jobs: "Job opening",
  services: "Service",
};

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+edit+listings");

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();
  if (listing.seller_id !== user.id) {
    redirect(`/${listing.vertical}/${listing.id}?error=Not+your+listing`);
  }

  const detailTable = VERTICAL_DETAIL_TABLE[listing.vertical];
  const { data: detailRow } = await supabase
    .from(detailTable)
    .select("*")
    .eq("listing_id", id)
    .maybeSingle();

  const { error } = await searchParams;
  const v = listing.vertical as Vertical;
  const defaults = buildDefaults(v, listing, detailRow);
  const action = updateListing.bind(null, v, id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-ink-mute">
        <Link href="/account/listings" className="hover:text-ink">My listings</Link>
        <span aria-hidden>/</span>
        <span className="line-clamp-1 text-ink">{listing.title}</span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Edit listing</h1>
      <p className="mt-2 text-sm text-ink-mute">
        {VERTICAL_TITLES[v]} · status: <span className="font-medium">{listing.status}</span>
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={action} className="mt-10 flex flex-col gap-10">
        {v === "goods" && <GoodsForm defaults={defaults} />}
        {v === "cars" && <CarsForm defaults={defaults} />}
        {v === "realestate" && <RealEstateForm defaults={defaults} />}
        {v === "jobs" && <JobsForm defaults={defaults} />}
        {v === "services" && <ServicesForm defaults={defaults} />}

        <SubmitBar vertical={VERTICAL_TITLES[v].toLowerCase()} mode="edit" />
      </form>

      <div className="mt-16 border-t border-ink-line pt-6">
        <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-sm text-ink-mute">
          Deleting a listing is permanent. Conversations about it stay in your inbox
          but lose the listing context.
        </p>
        <form action={deleteListing} className="mt-4">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="vertical" value={v} />
          <button
            type="submit"
            className="rounded-full border border-red-500 px-5 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            Delete listing permanently
          </button>
        </form>
      </div>
    </div>
  );
}

function buildDefaults(vertical: Vertical, listing: any, detail: any): ListingFormDefaults {
  return {
    title: listing.title,
    description: listing.description ?? undefined,
    priceAmount: listing.price_amount != null ? Number(listing.price_amount) : undefined,
    currency: listing.price_currency ?? "NOK",
    country: listing.country_code ?? undefined,
    region: listing.region ?? undefined,
    city: listing.city ?? undefined,
    postalCode: listing.postal_code ?? undefined,
    images: listing.images ?? [],
    details: mapDetailToDefaults(vertical, detail ?? {}),
  };
}

function mapDetailToDefaults(vertical: Vertical, d: any) {
  switch (vertical) {
    case "goods":
      return {
        category: d.category,
        condition: d.condition,
        brand: d.brand,
        size: d.size,
        color: d.color,
        shippingAvailable: d.shipping_available,
        pickupOnly: d.pickup_only,
      };
    case "cars":
      return {
        make: d.make,
        model: d.model,
        year: d.year,
        mileageKm: d.mileage_km,
        fuelType: d.fuel_type,
        transmission: d.transmission,
        bodyType: d.body_type,
        drivetrain: d.drivetrain,
        enginePowerHp: d.engine_power_hp,
        exteriorColor: d.exterior_color,
      };
    case "realestate":
      return {
        dealType: d.deal_type,
        propertyType: d.property_type,
        livingAreaSqm: d.living_area_sqm,
        yearBuilt: d.year_built,
        bedrooms: d.bedrooms,
        bathrooms: d.bathrooms,
        energyRating: d.energy_rating,
        availableFrom: d.available_from,
        hasElevator: d.has_elevator,
        hasBalcony: d.has_balcony,
        hasGarden: d.has_garden,
        hasParking: d.has_parking,
        furnished: d.furnished,
      };
    case "jobs":
      return {
        companyName: d.company_name,
        employmentType: d.employment_type,
        workArrangement: d.work_arrangement,
        experienceLevel: d.experience_level,
        industry: d.industry,
        function: d.function,
        salaryMin: d.salary_min_amount != null ? { amount: d.salary_min_amount, currency: d.salary_currency } : undefined,
        salaryMax: d.salary_max_amount != null ? { amount: d.salary_max_amount, currency: d.salary_currency } : undefined,
        salaryPeriod: d.salary_period,
        applicationUrl: d.application_url,
        applicationDeadline: d.application_deadline,
        requirements: d.requirements,
        benefits: d.benefits,
      };
    case "services":
      return {
        category: d.category,
        pricingModel: d.pricing_model,
        rate: d.rate_amount != null ? { amount: d.rate_amount, currency: d.rate_currency } : undefined,
        remoteAvailable: d.remote_available,
        serviceArea: d.service_area,
        yearsOfExperience: d.years_of_experience,
      };
    default:
      return {};
  }
}
