import { Hono } from "hono";
import { NewApiKey } from "@venda/schema";
import type { Env } from "../lib/supabase.js";
import { authMiddleware, type AuthVariables } from "../middleware/auth.js";

export const apiKeysRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// All key management requires a real human session — agents cannot mint keys.
apiKeysRoutes.use("*", authMiddleware, async (c, next) => {
  if (c.get("authMethod") !== "session") {
    return c.json({ error: "session required" }, 403);
  }
  return next();
});

apiKeysRoutes.get("/", async (c) => {
  const supa = c.get("supabase");
  const { data, error } = await supa
    .from("api_keys")
    .select("id, label, prefix, scopes, rate_limit_per_minute, expires_at, last_used_at, created_at, revoked_at")
    .eq("owner_user_id", c.get("authedUserId"))
    .order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ items: data ?? [] });
});

apiKeysRoutes.post("/", async (c) => {
  const parsed = NewApiKey.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const plaintext = `venda_${randomToken(40)}`;
  const prefix = plaintext.slice(0, 14);
  const keyHash = await sha256Hex(plaintext);

  const supa = c.get("supabase");
  const { data, error } = await supa
    .from("api_keys")
    .insert({
      owner_user_id: c.get("authedUserId"),
      label: parsed.data.label,
      prefix,
      key_hash: keyHash,
      scopes: parsed.data.scopes,
      rate_limit_per_minute: parsed.data.rateLimitPerMinute ?? 120,
      expires_at: parsed.data.expiresAt ?? null,
    })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);

  // Plaintext returned exactly once.
  return c.json({ ...data, plaintext }, 201);
});

apiKeysRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return c.json({ error: "invalid api key id" }, 400);
  }
  const supa = c.get("supabase");
  const { error } = await supa
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_user_id", c.get("authedUserId"));
  if (error) return c.json({ error: error.message }, 400);
  return c.body(null, 204);
});

function randomToken(len: number) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += alphabet[bytes[i]! % alphabet.length];
  return out;
}

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
