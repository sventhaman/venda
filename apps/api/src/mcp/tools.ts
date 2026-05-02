import { z } from "zod";
import { ListingSearchQuery, NewListing, NewMessage } from "@ichiba/schema";

// MCP tools are thin descriptors — the Hono endpoints already implement the logic.
// At wire time, both REST and MCP transports call the same handlers in src/lib/.
// This keeps tools and REST in lockstep: schema package is the single source of truth.

export const mcpTools = [
  {
    name: "search_listings",
    description:
      "Search across all five marketplace verticals (goods, cars, realestate, jobs, services). " +
      "Supports text search, price range, country/region/city filters, and sort. Returns paginated results.",
    inputSchema: ListingSearchQuery,
  },
  {
    name: "get_listing",
    description: "Fetch a single listing by id, including its vertical-specific details.",
    inputSchema: z.object({ id: z.string().uuid() }),
  },
  {
    name: "create_listing",
    description:
      "Create a new listing in any of the five verticals. Requires `listings:write` scope. " +
      "If status is 'active', the listing is published immediately.",
    inputSchema: NewListing,
  },
  {
    name: "send_message",
    description:
      "Send a message in an existing thread, or start a new thread by providing recipientId " +
      "(and optionally listingId to anchor the conversation to a listing).",
    inputSchema: NewMessage,
  },
  {
    name: "list_my_conversations",
    description: "List the authenticated agent or user's conversations, newest activity first.",
    inputSchema: z.object({}),
  },
] as const;

export type McpToolName = (typeof mcpTools)[number]["name"];
