import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "./actions";
import { AvatarUploader } from "@/components/account/avatar-uploader";

export default async function AccountEditPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+edit+your+profile");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-ink-mute">
        <Link href="/account" className="hover:text-ink">Account</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">Edit profile</span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Edit profile</h1>
      <p className="mt-2 text-sm text-ink-mute">
        Public information shown on your profile and listings.
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={updateProfile} className="mt-10 flex flex-col gap-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Avatar</h2>
          <AvatarUploader
            current={profile?.avatar_url ?? null}
            displayName={profile?.display_name ?? user.email}
          />
        </section>

        <section className="flex flex-col gap-4 border-t border-ink-line pt-8">
          <h2 className="text-lg font-semibold">Identity</h2>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Display name</span>
            <input
              name="displayName"
              required
              minLength={1}
              maxLength={100}
              defaultValue={profile?.display_name ?? ""}
              className="rounded-lg border border-ink-line px-3 py-2 text-base focus:border-ink focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Handle</span>
            <div className="flex items-stretch overflow-hidden rounded-lg border border-ink-line focus-within:border-ink">
              <span className="bg-ink-fog px-3 py-2 text-sm text-ink-mute">@</span>
              <input
                name="handle"
                required
                minLength={3}
                maxLength={40}
                pattern="[a-z0-9_-]+"
                defaultValue={profile?.handle ?? ""}
                className="flex-1 bg-white px-3 py-2 text-base focus:outline-none"
              />
            </div>
            <span className="text-xs text-ink-mute">
              Lowercase letters, numbers, underscores, hyphens. 3–40 characters.
            </span>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Country (ISO-2)</span>
            <input
              name="countryCode"
              maxLength={2}
              defaultValue={profile?.country_code ?? ""}
              placeholder="e.g. NO"
              className="w-24 rounded-lg border border-ink-line px-3 py-2 text-base uppercase focus:border-ink focus:outline-none"
            />
          </label>
        </section>

        <section className="flex flex-col gap-3 border-t border-ink-line pt-8">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Bio</span>
            <textarea
              name="bio"
              rows={4}
              maxLength={2000}
              defaultValue={profile?.bio ?? ""}
              className="rounded-lg border border-ink-line px-3 py-2 text-base focus:border-ink focus:outline-none"
            />
            <span className="text-xs text-ink-mute">A short blurb. Up to 2,000 characters.</span>
          </label>
        </section>

        <div className="flex justify-end gap-2 border-t border-ink-line pt-6">
          <Link
            href="/account"
            className="rounded-full border border-ink-line px-5 py-2.5 text-sm hover:border-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white hover:bg-ink-soft"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
