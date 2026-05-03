import type { MiddlewareHandler } from "hono";
import { serviceClient, userClient, type Env } from "../lib/supabase.js";
import { checkRateLimit } from "../lib/rate-limit.js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthVariables = {
  authedUserId: string;
  authMethod: "session" | "api_key";
  scopes: string[];
  supabase: SupabaseClient;
};

const API_KEY_PREFIX = "venda_";

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Resolve auth from either:
//   Authorization: Bearer <supabase-jwt>     (human session)
//   X-API-Key: venda_<...>                   (agent key)
// On success, sets a Supabase client on the context that respects RLS as that user.
export const authMiddleware: MiddlewareHandler<{
  Bindings: Env;
  Variables: AuthVariables;
}> = async (c, next) => {
  const apiKey = c.req.header("X-API-Key");
  const bearer = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");

  if (apiKey && apiKey.startsWith(API_KEY_PREFIX)) {
    const hash = await sha256Hex(apiKey);
    const svc = serviceClient(c.env);
    const { data, error } = await svc
      .from("api_keys")
      .select("owner_user_id, scopes, revoked_at, expires_at, rate_limit_per_minute")
      .eq("key_hash", hash)
      .maybeSingle();

    if (error || !data || data.revoked_at) return c.json({ error: "invalid api key" }, 401);
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return c.json({ error: "api key expired" }, 401);
    }

    // Per-key sliding-window rate limit. Bucket lives in module memory so
    // each Worker isolate enforces its own copy — slightly leaky under load
    // but enough to prevent obvious abuse from a single key.
    const limit = data.rate_limit_per_minute ?? 120;
    const rl = checkRateLimit(hash, limit);
    c.header("X-RateLimit-Limit", String(rl.limit));
    c.header("X-RateLimit-Remaining", String(rl.remaining));
    c.header("X-RateLimit-Reset", String(Math.floor(rl.resetAt / 1000)));
    if (!rl.ok) {
      const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
      c.header("Retry-After", String(retryAfter));
      return c.json(
        { error: "rate limit exceeded", limit: rl.limit, retryAfter },
        429,
      );
    }

    // Touch last_used_at without blocking the request.
    c.executionCtx.waitUntil(
      svc.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key_hash", hash),
    );

    c.set("authedUserId", data.owner_user_id);
    c.set("authMethod", "api_key");
    c.set("scopes", data.scopes ?? []);
    // Agents act as their owner against RLS — service client lets us scope manually
    // by always filtering on the owner's id in queries.
    c.set("supabase", svc);
    return next();
  }

  if (bearer) {
    const svc = serviceClient(c.env);
    const { data, error } = await svc.auth.getUser(bearer);
    if (error || !data.user) return c.json({ error: "invalid session" }, 401);

    c.set("authedUserId", data.user.id);
    c.set("authMethod", "session");
    c.set("scopes", ["*"]);
    c.set("supabase", userClient(c.env, bearer));
    return next();
  }

  return c.json({ error: "unauthorized" }, 401);
};

export function requireScope(...required: string[]): MiddlewareHandler<{
  Bindings: Env;
  Variables: AuthVariables;
}> {
  return async (c, next) => {
    const scopes = c.get("scopes");
    if (scopes.includes("*")) return next();
    const ok = required.every((r) => scopes.includes(r));
    if (!ok) return c.json({ error: "insufficient scope", required }, 403);
    return next();
  };
}
