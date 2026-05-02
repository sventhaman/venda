import { z } from "zod";
import { Money } from "../common";

export const ServiceCategory = z.enum([
  "home_repair",
  "cleaning",
  "moving",
  "tutoring",
  "design",
  "development",
  "writing",
  "marketing",
  "consulting",
  "health_wellness",
  "events",
  "transportation",
  "other",
]);
export type ServiceCategory = z.infer<typeof ServiceCategory>;

export const PricingModel = z.enum(["hourly", "fixed", "daily", "project", "quote_only"]);
export type PricingModel = z.infer<typeof PricingModel>;

export const ServiceDetails = z.object({
  category: ServiceCategory,
  pricingModel: PricingModel,
  rate: Money.optional(),
  remoteAvailable: z.boolean().default(false),
  serviceArea: z.array(z.string()).optional(),
  responseTimeHours: z.number().int().positive().optional(),
  yearsOfExperience: z.number().int().nonnegative().optional(),
  credentials: z.array(z.string()).optional(),
});
export type ServiceDetails = z.infer<typeof ServiceDetails>;
