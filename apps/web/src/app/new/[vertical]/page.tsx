import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { VERTICALS, type Vertical } from "@ichiba/schema";
import { createClient } from "@/lib/supabase/server";
import { submitNewListing } from "./actions";
import { SubmitBar } from "@/components/listing-form/shared";
import { GoodsForm } from "@/components/listing-form/goods-form";
import { CarsForm } from "@/components/listing-form/cars-form";
import { RealEstateForm } from "@/components/listing-form/realestate-form";
import { JobsForm } from "@/components/listing-form/jobs-form";
import { ServicesForm } from "@/components/listing-form/services-form";

const VERTICAL_TITLES: Record<Vertical, string> = {
  goods: "Marketplace item",
  cars: "Car",
  realestate: "Property",
  jobs: "Job opening",
  services: "Service",
};

export default async function NewListingForVertical({
  params,
  searchParams,
}: {
  params: Promise<{ vertical: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { vertical } = await params;
  if (!VERTICALS.includes(vertical as Vertical)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?error=Sign+in+to+create+a+listing`);

  const { error } = await searchParams;
  const v = vertical as Vertical;
  const action = submitNewListing.bind(null, v);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-ink-mute">
        <Link href="/new" className="hover:text-ink">New listing</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{VERTICAL_TITLES[v]}</span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">New {VERTICAL_TITLES[v].toLowerCase()}</h1>
      <p className="mt-2 text-sm text-ink-mute">Required fields are marked with *.</p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={action} className="mt-10 flex flex-col gap-10">
        {v === "goods" && <GoodsForm />}
        {v === "cars" && <CarsForm />}
        {v === "realestate" && <RealEstateForm />}
        {v === "jobs" && <JobsForm />}
        {v === "services" && <ServicesForm />}

        <SubmitBar vertical={VERTICAL_TITLES[v].toLowerCase()} />
      </form>
    </div>
  );
}
