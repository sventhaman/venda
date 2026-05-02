import { z } from "zod";

export const GoodsCondition = z.enum(["new", "like_new", "good", "fair", "for_parts"]);
export type GoodsCondition = z.infer<typeof GoodsCondition>;

export const GoodsCategory = z.enum([
  "clothing",
  "furniture",
  "electronics",
  "appliances",
  "sports_outdoors",
  "toys_games",
  "books_media",
  "home_garden",
  "tools",
  "kids_baby",
  "art_collectibles",
  "other",
]);
export type GoodsCategory = z.infer<typeof GoodsCategory>;

export const GoodsDetails = z.object({
  category: GoodsCategory,
  condition: GoodsCondition,
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  shippingAvailable: z.boolean().default(false),
  pickupOnly: z.boolean().default(false),
});
export type GoodsDetails = z.infer<typeof GoodsDetails>;
