import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const VERTICALS = [
  { slug: "goods", label: "Marketplace item", sub: "Clothes, furniture, electronics, anything" },
  { slug: "cars", label: "Car", sub: "Make, model, year, mileage" },
  { slug: "realestate", label: "Property", sub: "Sale, long-term rent, short-term rent" },
  { slug: "jobs", label: "Job opening", sub: "Hire someone for a role" },
  { slug: "services", label: "Service", sub: "Offer a service to others" },
];

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+create+a+listing");

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">What are you listing?</h1>
      <p className="mt-3 text-ink-mute">Pick a vertical to continue.</p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {VERTICALS.map((v) => (
          <li key={v.slug}>
            <Link
              href={`/new/${v.slug}`}
              className="block rounded-2xl border border-ink-line p-6 transition hover:border-ink hover:bg-ink-fog/50"
            >
              <div className="font-semibold">{v.label}</div>
              <div className="mt-1 text-sm text-ink-mute">{v.sub}</div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-ink-mute">
        Posting via an agent? Skip the form and call{" "}
        <code className="rounded bg-ink-fog px-1.5 py-0.5">POST /v1/listings</code> directly.
      </p>
    </div>
  );
}
