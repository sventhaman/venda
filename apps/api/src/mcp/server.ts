import { Hono } from "hono";
import type { Env } from "../lib/supabase.js";
import { authMiddleware, type AuthVariables } from "../middleware/auth.js";
import { MCP_TOOLS } from "./tools.js";
import { callTool, type CallContext } from "./handlers.js";

// Streamable HTTP MCP transport (https://modelcontextprotocol.io/specification).
//
// This is the canonical wire protocol that Claude Desktop, Cursor, mcp-remote,
// and other MCP clients speak. Single endpoint:
//
//   POST /mcp           JSON-RPC 2.0 messages (one request, single or batch)
//   GET  /mcp           405 — we don't support server-initiated streams yet
//
// Auth: X-API-Key (agents) or Authorization: Bearer <jwt> (humans). Same path
// the REST endpoints use, so credentials are interchangeable.

const PROTOCOL_VERSION = "2025-03-26";
const SERVER_INFO = { name: "ichiba", version: "0.1.0" } as const;

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

export const mcpRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// MCP clients expect a single endpoint at /mcp. Auth runs on every request
// so each JSON-RPC call is independently authorized — no session state to
// keep across requests, which is friendly to edge runtimes.
mcpRoutes.post("/", authMiddleware, async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" },
      } satisfies JsonRpcResponse,
      400,
    );
  }

  const ctx: CallContext = {
    supabase: c.get("supabase"),
    userId: c.get("authedUserId"),
    isAgent: c.get("authMethod") === "api_key",
    scopes: c.get("scopes"),
  };

  const isBatch = Array.isArray(body);
  const messages = isBatch ? (body as JsonRpcRequest[]) : [body as JsonRpcRequest];

  const responses: JsonRpcResponse[] = [];
  for (const msg of messages) {
    const r = await handleMessage(msg, ctx);
    if (r) responses.push(r);
  }

  // All-notifications batch → 202 Accepted with no body, per JSON-RPC 2.0.
  if (responses.length === 0) return new Response(null, { status: 202 });

  return c.json(isBatch ? responses : responses[0]);
});

mcpRoutes.get("/", (c) =>
  c.json({ error: "method not allowed; use POST" }, 405, {
    Allow: "POST",
  }),
);

async function handleMessage(
  msg: JsonRpcRequest,
  ctx: CallContext,
): Promise<JsonRpcResponse | null> {
  const id = msg.id ?? null;

  // Notifications (no id) get no response, per JSON-RPC.
  const isNotification = msg.id === undefined || msg.id === null;

  switch (msg.method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions:
            "ichiba is an agent-first marketplace. Use search_listings to find " +
            "items across goods/cars/realestate/jobs/services. Use create_listing " +
            "to post (requires listings:write). Use send_message to contact " +
            "sellers (requires messages:write).",
        },
      };

    case "notifications/initialized":
    case "notifications/cancelled":
      // Notifications: no response.
      return null;

    case "ping":
      return { jsonrpc: "2.0", id, result: {} };

    case "tools/list":
      return {
        jsonrpc: "2.0",
        id,
        result: { tools: MCP_TOOLS },
      };

    case "tools/call": {
      const params = (msg.params ?? {}) as { name?: string; arguments?: unknown };
      if (!params.name) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "tools/call requires `name`" },
        };
      }

      const result = await callTool(params.name, params.arguments, ctx);
      if (!result.ok) {
        // Tool errors are returned in `result` with isError, not as protocol
        // errors — that's the MCP convention.
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: result.error }],
            isError: true,
          },
        };
      }

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
        },
      };
    }

    default:
      if (isNotification) return null;
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${msg.method}` },
      };
  }
}
