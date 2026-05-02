import { Hono } from "hono";
import type { Env } from "../lib/supabase.js";
import { authMiddleware, type AuthVariables } from "../middleware/auth.js";
import { mcpTools } from "./tools.js";
import { searchListings, getListing } from "../lib/listings.js";
import { ListingSearchQuery } from "@ichiba/schema";
import { z } from "zod";

// Minimal MCP-over-HTTP shim. We expose:
//   GET  /mcp/tools        — list tool descriptors with JSON Schema
//   POST /mcp/call         — call { name, arguments } and return the result
// Agents authenticate the same way as REST: X-API-Key or Bearer JWT.
// When we wire up the official MCP SDK transport (stdio, SSE, streamable HTTP),
// these handlers stay; only the framing changes.

export const mcpRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

mcpRoutes.get("/tools", (c) => {
  return c.json({
    tools: mcpTools.map((t) => ({
      name: t.name,
      description: t.description,
      // Zod schema → loose JSON Schema; clients introspect for help text.
      inputSchema: zodToJsonSchemaShallow(t.inputSchema),
    })),
  });
});

mcpRoutes.post("/call", authMiddleware, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { name, arguments: args } = body as { name?: string; arguments?: unknown };
  if (!name) return c.json({ error: "missing tool name" }, 400);

  const supa = c.get("supabase");

  switch (name) {
    case "search_listings": {
      const parsed = ListingSearchQuery.safeParse(args ?? {});
      if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
      const result = await searchListings(supa, parsed.data);
      return c.json({ result });
    }
    case "get_listing": {
      const parsed = z.object({ id: z.string().uuid() }).safeParse(args ?? {});
      if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
      const result = await getListing(supa, parsed.data.id);
      return c.json({ result });
    }
    case "create_listing":
    case "send_message":
    case "list_my_conversations":
      // These delegate to the REST handlers — keeping them as TODO until the
      // streamable-HTTP MCP transport is wired up so we don't duplicate logic.
      return c.json({ error: "not implemented in HTTP shim — call the REST endpoint" }, 501);
    default:
      return c.json({ error: `unknown tool ${name}` }, 404);
  }
});

// Very small Zod → JSON Schema shim. Just enough for tool listings; swap to
// `zod-to-json-schema` package once we install it.
function zodToJsonSchemaShallow(schema: z.ZodTypeAny): unknown {
  return { type: "object", description: schema._def?.description ?? undefined };
}
