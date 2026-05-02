import { z } from "zod";

export const ApiKeyScope = z.enum([
  "listings:read",
  "listings:write",
  "messages:read",
  "messages:write",
  "profile:read",
  "profile:write",
]);
export type ApiKeyScope = z.infer<typeof ApiKeyScope>;

export const ApiKey = z.object({
  id: z.string().uuid(),
  ownerUserId: z.string().uuid(),
  label: z.string().min(1).max(80),
  prefix: z.string(),
  scopes: z.array(ApiKeyScope),
  rateLimitPerMinute: z.number().int().positive(),
  expiresAt: z.string().nullable(),
  lastUsedAt: z.string().nullable(),
  createdAt: z.string(),
  revokedAt: z.string().nullable(),
});
export type ApiKey = z.infer<typeof ApiKey>;

export const NewApiKey = z.object({
  label: z.string().min(1).max(80),
  scopes: z.array(ApiKeyScope).min(1),
  rateLimitPerMinute: z.number().int().positive().max(10000).default(120),
  expiresAt: z.string().optional(),
});
export type NewApiKey = z.infer<typeof NewApiKey>;

export const ApiKeyCreated = ApiKey.extend({
  plaintext: z.string(),
});
export type ApiKeyCreated = z.infer<typeof ApiKeyCreated>;
