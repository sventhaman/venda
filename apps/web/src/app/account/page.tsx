import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+see+your+account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>

      <dl className="mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 border-y border-ink-line py-6 text-sm sm:grid-cols-3">
        <dt className="text-ink-mute">Email</dt>
        <dd className="font-medium sm:col-span-2">{user.email}</dd>

        <dt className="text-ink-mute">Display name</dt>
        <dd className="font-medium sm:col-span-2">{profile?.display_name ?? "—"}</dd>

        <dt className="text-ink-mute">Handle</dt>
        <dd className="font-medium sm:col-span-2">@{profile?.handle ?? "—"}</dd>

        <dt className="text-ink-mute">Account type</dt>
        <dd className="font-medium sm:col-span-2">{profile?.account_type ?? "—"}</dd>

        <dt className="text-ink-mute">Member since</dt>
        <dd className="font-medium sm:col-span-2">
          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
        </dd>
      </dl>

      <form action="/sign-out" method="post" className="mt-8">
        <button
          type="submit"
          className="rounded-full border border-ink-line px-5 py-2.5 text-sm hover:border-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
