"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { LISTING_IMAGES_BUCKET, pathFromPublicUrl } from "@/lib/storage";

const ProfileForm = z.object({
  handle: z.string().trim().min(3).max(40).regex(/^[a-z0-9_-]+$/, {
    message: "Handle must be lowercase letters, numbers, underscores, or hyphens",
  }),
  displayName: z.string().trim().min(1).max(100),
  bio: z.string().max(2000).optional().or(z.literal("")),
  countryCode: z
    .string()
    .trim()
    .length(2)
    .regex(/^[A-Za-z]{2}$/, { message: "Country code must be 2 letters" })
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function updateProfile(formData: FormData) {
  const parsed = ProfileForm.safeParse({
    handle: String(formData.get("handle") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    countryCode: String(formData.get("countryCode") ?? ""),
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
  });

  if (!parsed.success) {
    redirect(
      `/account/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`,
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Capture the current avatar so we can clean up Storage if it's replaced.
  const { data: existing } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const newAvatar = parsed.data.avatarUrl?.trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({
      handle: parsed.data.handle,
      display_name: parsed.data.displayName,
      bio: parsed.data.bio?.trim() || null,
      country_code: parsed.data.countryCode?.toUpperCase() || null,
      avatar_url: newAvatar,
    })
    .eq("id", user.id);

  if (error) {
    // 23505 = unique_violation — the only realistic cause is handle collision.
    const msg =
      (error as any).code === "23505"
        ? "That handle is already taken"
        : error.message;
    redirect(`/account/edit?error=${encodeURIComponent(msg)}`);
  }

  // Drop the previous avatar from Storage if it changed and the old one
  // was hosted on our own bucket (external URLs we don't touch).
  if (existing?.avatar_url && existing.avatar_url !== newAvatar) {
    const oldPath = pathFromPublicUrl(existing.avatar_url);
    if (oldPath) {
      await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([oldPath]);
    }
  }

  revalidatePath("/account");
  revalidatePath("/account/edit");
  redirect("/account?ok=1");
}
