// MCP tool definitions in JSON Schema. We hand-author these instead of
// converting from Zod so the schemas stay readable for clients that surface
// them in UI (Claude Desktop, Cursor, etc).

const VERTICALS = ["goods", "cars", "realestate", "jobs", "services"] as const;

export const MCP_TOOLS = [
  {
    name: "search_listings",
    description:
      "Search across all five marketplace verticals (goods, cars, realestate, jobs, services). " +
      "Supports text search, price range, country/region/city filters, and sort. Returns paginated results.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Free-text search query" },
        vertical: { type: "string", enum: VERTICALS, description: "Limit to one vertical" },
        minPrice: { type: "integer", minimum: 0 },
        maxPrice: { type: "integer", minimum: 0 },
        country: {
          type: "string",
          description: "ISO 3166-1 alpha-2 country code, e.g. 'NO'",
        },
        region: { type: "string" },
        city: { type: "string" },
        sort: {
          type: "string",
          enum: ["newest", "oldest", "price_asc", "price_desc"],
          default: "newest",
        },
        page: { type: "integer", minimum: 1, default: 1 },
        pageSize: { type: "integer", minimum: 1, maximum: 100, default: 24 },
      },
    },
  },
  {
    name: "get_listing",
    description: "Fetch a single listing by id, including its vertical-specific details.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", format: "uuid" } },
      required: ["id"],
    },
  },
  {
    name: "create_listing",
    description:
      "Create a new listing in any of the five verticals. Requires the listings:write scope. " +
      "If status is 'active', the listing is published immediately. The shape of `details` " +
      "depends on `vertical` — see the schema for each vertical's required fields.",
    inputSchema: {
      type: "object",
      properties: {
        vertical: { type: "string", enum: VERTICALS },
        title: { type: "string", minLength: 3, maxLength: 200 },
        description: { type: "string", maxLength: 20000 },
        status: {
          type: "string",
          enum: ["draft", "active"],
          default: "active",
        },
        price: {
          type: "object",
          properties: {
            amount: { type: "integer", minimum: 0 },
            currency: { type: "string", enum: ["NOK", "USD", "EUR", "GBP", "SEK", "DKK"] },
          },
          required: ["amount", "currency"],
        },
        location: {
          type: "object",
          properties: {
            country: { type: "string", maxLength: 2, description: "ISO-2 country code" },
            region: { type: "string" },
            city: { type: "string" },
            postalCode: { type: "string" },
          },
          required: ["country"],
        },
        images: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: { type: "string", format: "uri" },
              alt: { type: "string" },
            },
            required: ["url"],
          },
        },
        details: {
          type: "object",
          description:
            "Vertical-specific fields. For goods: { category, condition }. " +
            "For cars: { make, model, year, fuelType, transmission, bodyType }. " +
            "For realestate: { dealType, propertyType }. " +
            "For jobs: { companyName, employmentType, workArrangement }. " +
            "For services: { category, pricingModel }. See API docs for full field list.",
        },
      },
      required: ["vertical", "title", "details"],
    },
  },
  {
    name: "send_message",
    description:
      "Send a message in an existing conversation, or start a new thread. Provide " +
      "either `conversationId` for an existing thread, or `recipientId` (with optional " +
      "`listingId`) to start a new one. Requires messages:write scope.",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string", format: "uuid" },
        recipientId: { type: "string", format: "uuid" },
        listingId: { type: "string", format: "uuid" },
        body: { type: "string", minLength: 1, maxLength: 10000 },
      },
      required: ["body"],
    },
  },
  {
    name: "list_my_conversations",
    description: "List the authenticated agent or user's conversations, newest activity first.",
    inputSchema: { type: "object", properties: {} },
  },
] as const;

export type McpToolName = (typeof MCP_TOOLS)[number]["name"];
