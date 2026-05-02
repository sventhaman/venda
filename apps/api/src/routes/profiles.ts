import { Hono } from "hono";
import { ProfileUpdate } from "@ichiba/schema";
import type { Env } from "../lib/supabase.js";
import { authMiddleware, type AuthVariables } from "../middleware/auth.js";
import { serviceClient } from "../lib/supabase.js";

export const profilesRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Public: lookup any profile by handle.
profilesRoutes.get("/:handle", async (c) => {
  const supa = serviceClient(c.env);
  const { data, error } = await supa
    .from("profiles")
    .select("id, handle, display_name, account_type, avatar_url, bio, country_code, is_verified, rating_avg, rating_count, created_at")
    .eq("handle", c.req.param("handle"))
    .maybeSingle();
  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "not found" }, 404);
  return c.json(data);
});

// Authed: get me.
profilesRoutes.get("/", authMiddleware, async (c) => {
  const supa = c.get("supabase");
  const userId = c.get("authedUserId");
  const { data, error } = await supa.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// Authed: update me.
profilesRoutes.patch("/", authMiddleware, async (c) => {
  const parsed = ProfileUpdate.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const supa = c.get("supabase");
  const userId = c.get("authedUserId");
  const updates: Record<string, any> = {};
  if (parsed.data.displayName) updates.display_name = parsed.data.displayName;
  if (parsed.data.avatarUrl !== undefined) updates.avatar_url = parsed.data.avatarUrl;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
  if (parsed.data.countryCode !== undefined) updates.country_code = parsed.data.countryCode;

  const { data, error } = await supa.from("profiles").update(updates).eq("id", userId).select().single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});
