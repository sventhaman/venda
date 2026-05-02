"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createListing } from "@/lib/listings/create";
import type { Vertical, Currency } from "@ichiba/schema";

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

export async function submitNewListing(vertical: Vertical, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?error=Sign+in+to+create+a+listing`);

  const currency = (STR(formData, "currency") ?? "USD") as Currency;
  const priceAmount = NUM(formData, "priceAmount");

  const base = {
    vertical,
    status: "active" as const,
    title: STR(formData, "title") ?? "",
    description: STR(formData, "description"),
    price: priceAmount != null ? { amount: priceAmount, currency } : undefined,
    location:
      STR(formData, "country")
        ? {
            country: (STR(formData, "country") ?? "").toUpperCase(),
            region: STR(formData, "region"),
            city: STR(formData, "city"),
            postalCode: STR(formData, "postalCode"),
          }
        : undefined,
    images: ARR(formData, "images")?.map((url) => ({ url })) ?? [],
  };

  const details = buildDetails(vertical, formData, currency);
  const result = await createListing(supabase, user.id, { ...base, details });

  if (!result.ok) {
    const msg = typeof result.error === "string" ? result.error : "Validation failed";
    redirect(`/new/${vertical}?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath(`/${vertical}`);
  redirect(`/${vertical}/${result.listing.id}`);
}

function buildDetails(vertical: Vertical, fd: FormData, currency: Currency): unknown {
  switch (vertical) {
    case "goods":
      return {
        category: STR(fd, "category"),
        condition: STR(fd, "condition"),
        brand: STR(fd, "brand"),
        size: STR(fd, "size"),
        color: STR(fd, "color"),
        shippingAvailable: BOOL(fd, "shippingAvailable"),
        pickupOnly: BOOL(fd, "pickupOnly"),
      };
    case "cars":
      return {
        make: STR(fd, "make"),
        model: STR(fd, "model"),
        year: NUM(fd, "year"),
        mileageKm: NUM(fd, "mileageKm"),
        fuelType: STR(fd, "fuelType"),
        transmission: STR(fd, "transmission"),
        bodyType: STR(fd, "bodyType"),
        drivetrain: STR(fd, "drivetrain"),
        enginePowerHp: NUM(fd, "enginePowerHp"),
        exteriorColor: STR(fd, "exteriorColor"),
      };
    case "realestate":
      return {
        dealType: STR(fd, "dealType"),
        propertyType: STR(fd, "propertyType"),
        livingAreaSqm: NUM(fd, "livingAreaSqm"),
        bedrooms: NUM(fd, "bedrooms"),
        bathrooms: NUM(fd, "bathrooms"),
        yearBuilt: NUM(fd, "yearBuilt"),
        energyRating: STR(fd, "energyRating"),
        hasElevator: BOOL(fd, "hasElevator"),
        hasBalcony: BOOL(fd, "hasBalcony"),
        hasGarden: BOOL(fd, "hasGarden"),
        hasParking: BOOL(fd, "hasParking"),
        furnished: BOOL(fd, "furnished"),
        availableFrom: STR(fd, "availableFrom"),
      };
    case "jobs": {
      const min = NUM(fd, "salaryMin");
      const max = NUM(fd, "salaryMax");
      return {
        companyName: STR(fd, "companyName"),
        employmentType: STR(fd, "employmentType"),
        workArrangement: STR(fd, "workArrangement"),
        experienceLevel: STR(fd, "experienceLevel"),
        industry: STR(fd, "industry"),
        function: STR(fd, "function"),
        salaryMin: min != null ? { amount: min, currency } : undefined,
        salaryMax: max != null ? { amount: max, currency } : undefined,
        salaryPeriod: STR(fd, "salaryPeriod"),
        applicationUrl: STR(fd, "applicationUrl"),
        applicationDeadline: STR(fd, "applicationDeadline"),
        requirements: ARR(fd, "requirements"),
        benefits: ARR(fd, "benefits"),
      };
    }
    case "services": {
      const rate = NUM(fd, "rate");
      return {
        category: STR(fd, "category"),
        pricingModel: STR(fd, "pricingModel"),
        rate: rate != null ? { amount: rate, currency } : undefined,
        remoteAvailable: BOOL(fd, "remoteAvailable"),
        serviceArea: ARR(fd, "serviceArea"),
        yearsOfExperience: NUM(fd, "yearsOfExperience"),
      };
    }
  }
}
