import { z } from "zod";

export const VERTICALS = ["goods", "cars", "realestate", "jobs", "services"] as const;
export const Vertical = z.enum(VERTICALS);
export type Vertical = z.infer<typeof Vertical>;

export const ListingStatus = z.enum(["draft", "active", "paused", "sold", "expired", "removed"]);
export type ListingStatus = z.infer<typeof ListingStatus>;

export const Currency = z.enum(["NOK", "USD", "EUR", "GBP", "SEK", "DKK"]);
export type Currency = z.infer<typeof Currency>;

export const Money = z.object({
  amount: z.number().int().nonnegative(),
  currency: Currency,
});
export type Money = z.infer<typeof Money>;

export const GeoPoint = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof GeoPoint>;

export const Location = z.object({
  country: z.string().length(2),
  region: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  point: GeoPoint.optional(),
});
export type Location = z.infer<typeof Location>;

export const Image = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type Image = z.infer<typeof Image>;

export const Pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
});
export type Pagination = z.infer<typeof Pagination>;

export const SortOrder = z.enum(["newest", "oldest", "price_asc", "price_desc", "relevance"]);
export type SortOrder = z.infer<typeof SortOrder>;
