import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./lib/supabase.js";
import { listingsRoutes } from "./routes/listings.js";
import { messagesRoutes } from "./routes/messages.js";
import { profilesRoutes } from "./routes/profiles.js";
import { apiKeysRoutes } from "./routes/api-keys.js";
import { mcpRoutes } from "./mcp/server.js";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"] }));

app.get("/", (c) =>
  c.json({
    name: "venda-api",
    description:
      "Agent-first marketplace API. Auth: X-API-Key (agents) or Authorization: Bearer (humans).",
    endpoints: {
      rest: {
        listings: "/v1/listings",
        messages: "/v1/messages",
        profiles: "/v1/profiles",
        apiKeys: "/v1/api-keys (session only)",
      },
      mcp: {
        endpoint: "/mcp",
        transport: "streamable-http",
        protocol: "2025-03-26",
      },
    },
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/v1/listings", listingsRoutes);
app.route("/v1/messages", messagesRoutes);
app.route("/v1/profiles", profilesRoutes);
app.route("/v1/api-keys", apiKeysRoutes);
app.route("/mcp", mcpRoutes);

export default app;
