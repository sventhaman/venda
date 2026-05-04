// MCP tool definitions in JSON Schema. Hand-authored (not generated from Zod)
// so we can:
//   - keep descriptions readable in MCP-client UIs (Claude Desktop, Cursor)
//   - use a oneOf discriminator on `vertical` so agents see the exact valid
//     enum values for each vertical's `details` block instead of guessing
//
// All enums below are kept in sync with packages/schema/src/vertical/*. If you
// add a new enum value there, mirror it here so MCP clients see it.

const VERTICALS = ["goods", "cars", "realestate", "jobs", "services"] as const;

const CURRENCIES = ["NOK", "USD", "EUR", "GBP", "SEK", "DKK"] as const;

const Money = {
  type: "object",
  properties: {
    amount: {
      type: "integer",
      minimum: 0,
      description: "In the smallest currency unit (cents/øre). 100 NOK = 10000.",
    },
    currency: { type: "string", enum: CURRENCIES },
  },
  required: ["amount", "currency"],
} as const;

const Location = {
  type: "object",
  properties: {
    country: { type: "string", maxLength: 2, description: "ISO 3166-1 alpha-2, e.g. 'NO'" },
    region: { type: "string" },
    city: { type: "string" },
    postalCode: { type: "string" },
  },
  required: ["country"],
} as const;

const Image = {
  type: "object",
  properties: {
    url: { type: "string", format: "uri" },
    alt: { type: "string" },
  },
  required: ["url"],
} as const;

// ---- Per-vertical detail schemas -------------------------------------------

const GoodsDetails = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: [
        "clothing",
        "furniture",
        "electronics",
        "appliances",
        "sports_outdoors",
        "toys_games",
        "books_media",
        "home_garden",
        "tools",
        "kids_baby",
        "art_collectibles",
        "other",
      ],
    },
    condition: { type: "string", enum: ["new", "like_new", "good", "fair", "for_parts"] },
    brand: { type: "string" },
    size: { type: "string" },
    color: { type: "string" },
    shippingAvailable: { type: "boolean", default: false },
    pickupOnly: { type: "boolean", default: false },
  },
  required: ["category", "condition"],
} as const;

const CarsDetails = {
  type: "object",
  properties: {
    make: { type: "string" },
    model: { type: "string" },
    year: { type: "integer", minimum: 1900, maximum: 2100 },
    mileageKm: { type: "integer", minimum: 0 },
    fuelType: { type: "string", enum: ["petrol", "diesel", "hybrid", "phev", "electric", "lpg", "other"] },
    transmission: { type: "string", enum: ["manual", "automatic", "semi_auto"] },
    bodyType: {
      type: "string",
      enum: [
        "sedan",
        "hatchback",
        "wagon",
        "suv",
        "coupe",
        "convertible",
        "pickup",
        "van",
        "minivan",
        "other",
      ],
    },
    drivetrain: { type: "string", enum: ["fwd", "rwd", "awd", "4wd"] },
    enginePowerHp: { type: "integer", minimum: 1 },
    engineSizeCc: { type: "integer", minimum: 1 },
    exteriorColor: { type: "string" },
    interiorColor: { type: "string" },
    vin: { type: "string" },
    registrationNumber: { type: "string" },
    firstRegistration: { type: "string", description: "ISO date (YYYY-MM-DD)" },
    numberOfOwners: { type: "integer", minimum: 0 },
    hasServiceHistory: { type: "boolean" },
    accidentFree: { type: "boolean" },
  },
  required: ["make", "model", "year", "fuelType", "transmission", "bodyType"],
} as const;

const RealEstateDetails = {
  type: "object",
  properties: {
    dealType: { type: "string", enum: ["sale", "rent_long", "rent_short"] },
    propertyType: {
      type: "string",
      enum: ["apartment", "house", "townhouse", "cabin", "plot", "commercial", "room", "other"],
    },
    ownership: { type: "string", enum: ["freehold", "shared", "leasehold", "cooperative", "other"] },
    livingAreaSqm: { type: "number", minimum: 0 },
    plotAreaSqm: { type: "number", minimum: 0 },
    bedrooms: { type: "integer", minimum: 0 },
    bathrooms: { type: "integer", minimum: 0 },
    rooms: { type: "integer", minimum: 0 },
    yearBuilt: { type: "integer", minimum: 1000, maximum: 2100 },
    energyRating: { type: "string", description: "EU energy label, e.g. 'A', 'B', 'C'" },
    floor: { type: "integer" },
    hasElevator: { type: "boolean" },
    hasBalcony: { type: "boolean" },
    hasGarden: { type: "boolean" },
    hasParking: { type: "boolean" },
    furnished: { type: "boolean" },
    monthlyCosts: Money,
    depositAmount: Money,
    availableFrom: { type: "string", description: "ISO date" },
    minimumStayMonths: { type: "integer", minimum: 1 },
  },
  required: ["dealType", "propertyType"],
} as const;

const JobsDetails = {
  type: "object",
  properties: {
    companyName: { type: "string" },
    employmentType: {
      type: "string",
      enum: ["full_time", "part_time", "contract", "temporary", "internship", "freelance", "volunteer"],
    },
    workArrangement: { type: "string", enum: ["onsite", "remote", "hybrid"] },
    experienceLevel: { type: "string", enum: ["entry", "mid", "senior", "lead", "executive"] },
    industry: { type: "string" },
    function: { type: "string" },
    salaryMin: Money,
    salaryMax: Money,
    salaryPeriod: { type: "string", enum: ["hour", "month", "year"] },
    applicationUrl: { type: "string", format: "uri" },
    applicationDeadline: { type: "string", description: "ISO date" },
    startDate: { type: "string", description: "ISO date" },
    requirements: { type: "array", items: { type: "string" } },
    benefits: { type: "array", items: { type: "string" } },
  },
  required: ["companyName", "employmentType", "workArrangement"],
} as const;

const ServicesDetails = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: [
        "home_repair",
        "cleaning",
        "moving",
        "tutoring",
        "design",
        "development",
        "writing",
        "marketing",
        "consulting",
        "health_wellness",
        "events",
        "transportation",
        "other",
      ],
    },
    pricingModel: { type: "string", enum: ["hourly", "fixed", "daily", "project", "quote_only"] },
    rate: Money,
    remoteAvailable: { type: "boolean", default: false },
    serviceArea: { type: "array", items: { type: "string" } },
    responseTimeHours: { type: "integer", minimum: 1 },
    yearsOfExperience: { type: "integer", minimum: 0 },
    credentials: { type: "array", items: { type: "string" } },
  },
  required: ["category", "pricingModel"],
} as const;

// Build a `create_listing` schema with a oneOf discriminator on `vertical` so
// the per-vertical `details` shape is fully specified for the agent.
const createListingSchema = {
  type: "object",
  required: ["vertical", "title", "details"],
  properties: {
    vertical: { type: "string", enum: VERTICALS },
    title: { type: "string", minLength: 3, maxLength: 200 },
    description: { type: "string", maxLength: 20000 },
    status: { type: "string", enum: ["draft", "active"], default: "active" },
    price: Money,
    location: Location,
    images: { type: "array", items: Image },
    details: { type: "object", description: "Vertical-specific fields. See `oneOf` below for the exact shape per vertical." },
  },
  oneOf: [
    {
      properties: {
        vertical: { const: "goods" },
        details: GoodsDetails,
      },
    },
    {
      properties: {
        vertical: { const: "cars" },
        details: CarsDetails,
      },
    },
    {
      properties: {
        vertical: { const: "realestate" },
        details: RealEstateDetails,
      },
    },
    {
      properties: {
        vertical: { const: "jobs" },
        details: JobsDetails,
      },
    },
    {
      properties: {
        vertical: { const: "services" },
        details: ServicesDetails,
      },
    },
  ],
} as const;

export const MCP_TOOLS = [
  {
    name: "search_listings",
    description:
      "Search across all five marketplace verticals (goods, cars, realestate, jobs, services). " +
      "Public — no scope required. Supports text search, price range, country/region/city filters, " +
      "and sort. Pagination defaults: page=1, pageSize=24, max=100. Returns { items, total, page, pageSize }.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Free-text search query (matches title + description + city/region)" },
        vertical: { type: "string", enum: VERTICALS, description: "Limit to one vertical" },
        minPrice: { type: "integer", minimum: 0, description: "In smallest currency unit (cents/øre)" },
        maxPrice: { type: "integer", minimum: 0, description: "In smallest currency unit (cents/øre)" },
        country: { type: "string", description: "ISO 3166-1 alpha-2, e.g. 'NO'" },
        region: { type: "string" },
        city: { type: "string" },
        sort: {
          type: "string",
          enum: ["newest", "oldest", "price_asc", "price_desc", "relevance"],
          default: "newest",
        },
        status: {
          type: "string",
          enum: ["draft", "active", "paused", "sold", "expired", "removed"],
          default: "active",
          description: "Defaults to 'active'. Use other values to surface non-active listings (only your own will be returned).",
        },
        page: { type: "integer", minimum: 1, default: 1 },
        pageSize: { type: "integer", minimum: 1, maximum: 100, default: 24 },
      },
    },
  },
  {
    name: "get_listing",
    description:
      "Fetch a single listing by id, including its vertical-specific details object. " +
      "Public — no scope required.",
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
      "If status is 'active' (default), the listing is published immediately. The shape of " +
      "`details` depends on `vertical` — see the `oneOf` block in inputSchema for required " +
      "fields and the exact enum values per vertical. All money amounts are in the smallest " +
      "currency unit (cents/øre).",
    inputSchema: createListingSchema,
  },
  {
    name: "update_listing",
    description:
      "Update fields on a listing the caller owns. Only the fields you pass are changed. " +
      "Cannot change vertical or seller. To change a listing's vertical, delete it and " +
      "re-create. Setting status to 'active' republishes (sets published_at to now). " +
      "Requires listings:write scope.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        title: { type: "string", minLength: 3, maxLength: 200 },
        description: { type: "string", maxLength: 20000 },
        status: { type: "string", enum: ["draft", "active", "paused", "sold", "expired", "removed"] },
        price: Money,
        images: { type: "array", items: Image },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_listing",
    description:
      "Permanently delete a listing the caller owns. Cascades to the listing's detail row " +
      "and removes it from all favorites. Requires listings:write scope.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", format: "uuid" } },
      required: ["id"],
    },
  },
  {
    name: "list_my_conversations",
    description:
      "List the authenticated agent or user's conversations, newest activity first. " +
      "Returns conversation_id, last_read_at, and the parent conversation row. " +
      "Use get_messages with a conversation_id to read its messages. Requires messages:read.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_messages",
    description:
      "Read all messages in a conversation the caller participates in, oldest first. " +
      "Each message has { id, conversation_id, sender_id, body, attachments, sent_by_agent, created_at }. " +
      "Requires messages:read scope.",
    inputSchema: {
      type: "object",
      properties: { conversationId: { type: "string", format: "uuid" } },
      required: ["conversationId"],
    },
  },
  {
    name: "send_message",
    description:
      "Send a message into a thread. Two modes:\n" +
      "  - Pass `conversationId` to post into an existing thread you participate in.\n" +
      "  - Pass `listingId` to start (or resume) the unique buyer↔seller thread for that listing.\n" +
      "We never accept an arbitrary recipientId — that would let an agent wire two unrelated users " +
      "into a thread. Use `listingId` to start any new conversation. Requires messages:write scope.",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string", format: "uuid" },
        listingId: { type: "string", format: "uuid" },
        body: { type: "string", minLength: 1, maxLength: 10000 },
        attachments: {
          type: "array",
          items: { type: "string", format: "uri" },
          description: "Optional: image/file URLs to attach.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "mark_thread_read",
    description:
      "Mark a conversation as read up to the current moment. Idempotent — calling repeatedly " +
      "just bumps last_read_at. Requires messages:write scope.",
    inputSchema: {
      type: "object",
      properties: { conversationId: { type: "string", format: "uuid" } },
      required: ["conversationId"],
    },
  },
  {
    name: "get_my_profile",
    description:
      "Fetch the authenticated user's full profile (id, handle, display_name, account_type, " +
      "avatar_url, bio, country_code, is_verified, rating_avg, rating_count, created_at). " +
      "Requires profile:read scope.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_profile",
    description:
      "Fetch a public profile by handle. Public — no scope required. Useful before sending a " +
      "message: humans recognise display_name and avatar.",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", minLength: 3, maxLength: 40, description: "URL-safe handle, e.g. 'sven_502f'" },
      },
      required: ["handle"],
    },
  },
  {
    name: "update_my_profile",
    description:
      "Update display name, avatar URL, bio, or country on the authenticated user's profile. " +
      "Only the fields you pass are changed. Cannot change handle (immutable) or account_type. " +
      "Requires profile:write scope.",
    inputSchema: {
      type: "object",
      properties: {
        displayName: { type: "string", minLength: 1, maxLength: 100 },
        avatarUrl: { type: "string", format: "uri" },
        bio: { type: "string", maxLength: 2000 },
        countryCode: { type: "string", minLength: 2, maxLength: 2, description: "ISO 3166-1 alpha-2" },
      },
    },
  },
] as const;

export type McpToolName = (typeof MCP_TOOLS)[number]["name"];
