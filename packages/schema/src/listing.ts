import { z } from "zod";
import { Vertical, ListingStatus, Money, Location, Image, Pagination, SortOrder } from "./common";
import { GoodsDetails } from "./vertical/goods";
import { CarDetails } from "./vertical/cars";
import { RealEstateDetails } from "./vertical/realestate";
import { JobDetails } from "./vertical/jobs";
import { ServiceDetails } from "./vertical/services";

const BaseListing = z.object({
  id: z.string().uuid(),
  vertical: Vertical,
  status: ListingStatus,
  title: z.string().min(3).max(200),
  description: z.string().max(20000).optional(),
  price: Money.optional(),
  location: Location.optional(),
  images: z.array(Image).default([]),
  sellerId: z.string().uuid(),
  agentCreated: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
});

export const Listing = z.discriminatedUnion("vertical", [
  BaseListing.extend({ vertical: z.literal("goods"), details: GoodsDetails }),
  BaseListing.extend({ vertical: z.literal("cars"), details: CarDetails }),
  BaseListing.extend({ vertical: z.literal("realestate"), details: RealEstateDetails }),
  BaseListing.extend({ vertical: z.literal("jobs"), details: JobDetails }),
  BaseListing.extend({ vertical: z.literal("services"), details: ServiceDetails }),
]);
export type Listing = z.infer<typeof Listing>;

const NewListingBase = BaseListing.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  expiresAt: true,
  sellerId: true,
  agentCreated: true,
}).extend({
  status: ListingStatus.default("draft"),
});

export const NewListing = z.discriminatedUnion("vertical", [
  NewListingBase.extend({ vertical: z.literal("goods"), details: GoodsDetails }),
  NewListingBase.extend({ vertical: z.literal("cars"), details: CarDetails }),
  NewListingBase.extend({ vertical: z.literal("realestate"), details: RealEstateDetails }),
  NewListingBase.extend({ vertical: z.literal("jobs"), details: JobDetails }),
  NewListingBase.extend({ vertical: z.literal("services"), details: ServiceDetails }),
]);
export type NewListing = z.infer<typeof NewListing>;

export const ListingSearchQuery = z.object({
  q: z.string().optional(),
  vertical: Vertical.optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  country: z.string().length(2).optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  near: z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    radiusKm: z.coerce.number().positive().max(500).default(50),
  }).optional(),
  sort: SortOrder.default("newest"),
  status: ListingStatus.default("active"),
}).merge(Pagination);
export type ListingSearchQuery = z.infer<typeof ListingSearchQuery>;

export const ListingSearchResult = z.object({
  items: z.array(Listing),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
});
export type ListingSearchResult = z.infer<typeof ListingSearchResult>;
