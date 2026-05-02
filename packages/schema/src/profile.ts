import { z } from "zod";

export const AccountType = z.enum(["personal", "business", "agent"]);
export type AccountType = z.infer<typeof AccountType>;

export const Profile = z.object({
  id: z.string().uuid(),
  handle: z.string().min(3).max(40),
  displayName: z.string().min(1).max(100),
  accountType: AccountType,
  avatarUrl: z.string().url().nullable(),
  bio: z.string().max(2000).nullable(),
  countryCode: z.string().length(2).nullable(),
  isVerified: z.boolean(),
  ratingAvg: z.number().min(0).max(5).nullable(),
  ratingCount: z.number().int().nonnegative(),
  createdAt: z.string(),
});
export type Profile = z.infer<typeof Profile>;

export const ProfileUpdate = Profile.pick({
  displayName: true,
  avatarUrl: true,
  bio: true,
  countryCode: true,
}).partial();
export type ProfileUpdate = z.infer<typeof ProfileUpdate>;
