import { z } from "zod";
import { Money } from "../common";

export const PropertyDealType = z.enum(["sale", "rent_long", "rent_short"]);
export type PropertyDealType = z.infer<typeof PropertyDealType>;

export const PropertyType = z.enum([
  "apartment",
  "house",
  "townhouse",
  "cabin",
  "plot",
  "commercial",
  "room",
  "other",
]);
export type PropertyType = z.infer<typeof PropertyType>;

export const OwnershipType = z.enum(["freehold", "shared", "leasehold", "cooperative", "other"]);

export const RealEstateDetails = z.object({
  dealType: PropertyDealType,
  propertyType: PropertyType,
  ownership: OwnershipType.optional(),
  livingAreaSqm: z.number().positive().optional(),
  plotAreaSqm: z.number().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  rooms: z.number().int().nonnegative().optional(),
  yearBuilt: z.number().int().min(1000).max(2100).optional(),
  energyRating: z.string().optional(),
  floor: z.number().int().optional(),
  hasElevator: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  furnished: z.boolean().optional(),
  monthlyCosts: Money.optional(),
  depositAmount: Money.optional(),
  availableFrom: z.string().optional(),
  minimumStayMonths: z.number().int().positive().optional(),
});
export type RealEstateDetails = z.infer<typeof RealEstateDetails>;
