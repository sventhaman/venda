import { z } from "zod";

export const FuelType = z.enum(["petrol", "diesel", "hybrid", "phev", "electric", "lpg", "other"]);
export const Transmission = z.enum(["manual", "automatic", "semi_auto"]);
export const BodyType = z.enum([
  "sedan",
  "hatchback",
  "wagon",
  "suv",
  "coupe",
  "convertible",
  "pickup",
  "van",
  "minivan",
  "other",
]);
export const Drivetrain = z.enum(["fwd", "rwd", "awd", "4wd"]);

export const CarDetails = z.object({
  make: z.string(),
  model: z.string(),
  year: z.number().int().min(1900).max(2100),
  mileageKm: z.number().int().nonnegative().optional(),
  fuelType: FuelType,
  transmission: Transmission,
  bodyType: BodyType,
  drivetrain: Drivetrain.optional(),
  enginePowerHp: z.number().int().positive().optional(),
  engineSizeCc: z.number().int().positive().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  vin: z.string().optional(),
  registrationNumber: z.string().optional(),
  firstRegistration: z.string().optional(),
  numberOfOwners: z.number().int().nonnegative().optional(),
  hasServiceHistory: z.boolean().optional(),
  accidentFree: z.boolean().optional(),
});
export type CarDetails = z.infer<typeof CarDetails>;
