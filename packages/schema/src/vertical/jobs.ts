import { z } from "zod";
import { Money } from "../common";

export const EmploymentType = z.enum([
  "full_time",
  "part_time",
  "contract",
  "temporary",
  "internship",
  "freelance",
  "volunteer",
]);
export type EmploymentType = z.infer<typeof EmploymentType>;

export const WorkArrangement = z.enum(["onsite", "remote", "hybrid"]);
export type WorkArrangement = z.infer<typeof WorkArrangement>;

export const ExperienceLevel = z.enum(["entry", "mid", "senior", "lead", "executive"]);

export const JobDetails = z.object({
  companyName: z.string(),
  employmentType: EmploymentType,
  workArrangement: WorkArrangement,
  experienceLevel: ExperienceLevel.optional(),
  industry: z.string().optional(),
  function: z.string().optional(),
  salaryMin: Money.optional(),
  salaryMax: Money.optional(),
  salaryPeriod: z.enum(["hour", "month", "year"]).optional(),
  applicationUrl: z.string().url().optional(),
  applicationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
});
export type JobDetails = z.infer<typeof JobDetails>;
