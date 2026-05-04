import { ListingSearchQuery, NewListing, ProfileUpdate } from "@venda/schema";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { searchListings, getListing } from "../lib/listings.js";
import { startOrFindConversation } from "./../lib/conversations.js";

const VERTICAL_DETAIL_TABLE: Record<string, string> = {
  goods: "listing_goods",
  cars: "listing_cars",
  realestate: "listing_realestate",
  jobs: "listing_jobs",
  services: "listing_services",
};

export type CallContext = {
  supabase: SupabaseClient;
  userId: string;
  isAgent: boolean;
  scopes: string[];
};

export type ToolResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

function requireScope(ctx: CallContext, scope: string): ToolResult | null {
  if (ctx.scopes.includes("*")) return null;
  if (ctx.scopes.includes(scope)) return null;
  return { ok: false, error: `missing required scope: ${scope}` };
}

export async function callTool(
  name: string,
  rawArgs: unknown,
  ctx: CallContext,
): Promise<ToolResult> {
  const args = (rawArgs ?? {}) as Record<string, unknown>;

  switch (name) {
    case "search_listings": {
      const parsed = ListingSearchQuery.safeParse(args);
      if (!parsed.success) return { ok: false, error: parsed.error.message };
      const data = await searchListings(ctx.supabase, parsed.data);
      return { ok: true, data };
    }

    case "get_listing": {
      const parsed = z.object({ id: z.string().uuid() }).safeParse(args);
      if (!parsed.success) return { ok: false, error: parsed.error.message };
      const data = await getListing(ctx.supabase, parsed.data.id);
      if (!data) return { ok: false, error: "listing not found" };
      return { ok: true, data };
    }

    case "create_listing": {
      const scopeCheck = requireScope(ctx, "listings:write");
      if (scopeCheck) return scopeCheck;

      const parsed = NewListing.safeParse(args);
      if (!parsed.success) return { ok: false, error: parsed.error.message };
      const input = parsed.data;

      const { data: listing, error } = await ctx.supabase
        .from("listings")
        .insert({
          vertical: input.vertical,
          status: input.status,
          title: input.title,
          description: input.description,
          price_amount: input.price?.amount,
          price_currency: input.price?.currency,
          country_code: input.location?.country,
          region: input.location?.region,
          city: input.location?.city,
          postal_code: input.location?.postalCode,
          images: input.images ?? [],
          seller_id: ctx.userId,
          agent_created: ctx.isAgent,
          published_at: input.status === "active" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error || !listing) {
        return { ok: false, error: error?.message ?? "insert failed" };
      }

      const detail = mapDetailToRow(input);
      const { error: detailErr } = await ctx.supabase
        .from(VERTICAL_DETAIL_TABLE[input.vertical]!)
        .insert({ listing_id: listing.id, ...detail });

      if (detailErr) {
        await ctx.supabase.from("listings").delete().eq("id", listing.id);
        return { ok: false, error: detailErr.message };
      }

      const full = await getListing(ctx.supabase, listing.id);
      return { ok: true, data: full };
    }

    case "send_message": {
      const scopeCheck = requireScope(ctx, "messages:write");
      if (scopeCheck) return scopeCheck;

      const parsed = z
        .object({
          conversationId: z.string().uuid().optional(),
          listingId: z.string().uuid().optional(),
          body: z.string().trim().min(1).max(10000),
          attachments: z.array(z.string().url()).optional(),
        })
        .refine((d) => d.conversationId || d.listingId, {
          message: "Provide conversationId or listingId",
        })
        .safeParse(args);
      if (!parsed.success) return { ok: false, error: parsed.error.message };

      let conversationId = parsed.data.conversationId;

      // listingId path: resume or create the unique buyer↔seller thread.
      // Humans use the SECURITY DEFINER RPC (relies on auth.uid()). Agents
      // go through the service-role client where auth.uid() is null, so
      // we run the same flow inline using the userId we verified from the
      // api_key. Never accept arbitrary recipientId from the client.
      if (!conversationId) {
        if (ctx.isAgent) {
          const r = await startOrFindConversation(
            ctx.supabase,
            ctx.userId,
            parsed.data.listingId!,
          );
          if (!r.ok) return { ok: false, error: r.error };
          conversationId = r.id;
        } else {
          const { data: convoId, error: rpcErr } = await ctx.supabase.rpc(
            "start_conversation",
            { _listing_id: parsed.data.listingId },
          );
          if (rpcErr || !convoId) {
            return { ok: false, error: rpcErr?.message ?? "could not start conversation" };
          }
          conversationId = convoId as string;
        }
      } else {
        const { data: membership } = await ctx.supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("conversation_id", conversationId)
          .eq("user_id", ctx.userId)
          .maybeSingle();
        if (!membership) return { ok: false, error: "not a participant" };
      }

      const { data: msg, error } = await ctx.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: ctx.userId,
          body: parsed.data.body,
          attachments: parsed.data.attachments ?? [],
          sent_by_agent: ctx.isAgent,
        })
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: msg };
    }

    case "list_my_conversations": {
      const scopeCheck = requireScope(ctx, "messages:read");
      if (scopeCheck) return scopeCheck;

      const { data, error } = await ctx.supabase
        .from("conversation_participants")
        .select(
          "conversation_id, last_read_at, conversations!inner(id, listing_id, last_message_at, created_at)",
        )
        .eq("user_id", ctx.userId)
        .order("conversations(last_message_at)", { ascending: false, nullsFirst: false });

      if (error) return { ok: false, error: error.message };
      return { ok: true, data };
    }

    case "update_listing": {
      const scopeCheck = requireScope(ctx, "listings:write");
      if (scopeCheck) return scopeCheck;

      const parsed = z
        .object({
          id: z.string().uuid(),
          title: z.string().min(3).max(200).optional(),
          description: z.string().max(20000).optional(),
          status: z.enum(["draft", "active", "paused", "sold", "expired", "removed"]).optional(),
          price: z
            .object({
              amount: z.number().int().nonnegative(),
              currency: z.enum(["NOK", "USD", "EUR", "GBP", "SEK", "DKK"]),
            })
            .optional(),
          images: z
            .array(z.object({ url: z.string().url(), alt: z.string().optional() }))
            .optional(),
        })
        .safeParse(args);
      if (!parsed.success) return { ok: false, error: parsed.error.message };

      const updates: Record<string, any> = {};
      if (parsed.data.title !== undefined) updates.title = parsed.data.title;
      if (parsed.data.description !== undefined) updates.description = parsed.data.description;
      if (parsed.data.status !== undefined) updates.status = parsed.data.status;
      if (parsed.data.price) {
        updates.price_amount = parsed.data.price.amount;
        updates.price_currency = parsed.data.price.currency;
      }
      if (parsed.data.images) updates.images = parsed.data.images;
      if (parsed.data.status === "active") updates.published_at = new Date().toISOString();

      // Defense in depth: agent path uses service-role client which bypasses
      // RLS, so the explicit owner filter is what scopes the update.
      const { error, count } = await ctx.supabase
        .from("listings")
        .update(updates, { count: "exact" })
        .eq("id", parsed.data.id)
        .eq("seller_id", ctx.userId);

      if (error) return { ok: false, error: error.message };
      if ((count ?? 0) === 0) return { ok: false, error: "not found or not yours" };

      const full = await getListing(ctx.supabase, parsed.data.id);
      return { ok: true, data: full };
    }

    case "delete_listing": {
      const scopeCheck = requireScope(ctx, "listings:write");
      if (scopeCheck) return scopeCheck;

      const parsed = z.object({ id: z.string().uuid() }).safeParse(args);
      if (!parsed.success) return { ok: false, error: parsed.error.message };

      const { error, count } = await ctx.supabase
        .from("listings")
        .delete({ count: "exact" })
        .eq("id", parsed.data.id)
        .eq("seller_id", ctx.userId);

      if (error) return { ok: false, error: error.message };
      if ((count ?? 0) === 0) return { ok: false, error: "not found or not yours" };
      return { ok: true, data: { id: parsed.data.id, deleted: true } };
    }

    case "get_messages": {
      const scopeCheck = requireScope(ctx, "messages:read");
      if (scopeCheck) return scopeCheck;

      const parsed = z.object({ conversationId: z.string().uuid() }).safeParse(args);
      if (!parsed.success) return { ok: false, error: parsed.error.message };

      // Verify the caller is a participant before returning anything. Same
      // defense-in-depth as the REST handler — agents bypass RLS.
      const { data: membership } = await ctx.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("conversation_id", parsed.data.conversationId)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (!membership) return { ok: false, error: "not found" };

      const { data, error } = await ctx.supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", parsed.data.conversationId)
        .order("created_at", { ascending: true });

      if (error) return { ok: false, error: error.message };
      return { ok: true, data };
    }

    case "mark_thread_read": {
      const scopeCheck = requireScope(ctx, "messages:write");
      if (scopeCheck) return scopeCheck;

      const parsed = z.object({ conversationId: z.string().uuid() }).safeParse(args);
      if (!parsed.success) return { ok: false, error: parsed.error.message };

      const { error, count } = await ctx.supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() }, { count: "exact" })
        .eq("conversation_id", parsed.data.conversationId)
        .eq("user_id", ctx.userId);

      if (error) return { ok: false, error: error.message };
      if ((count ?? 0) === 0) return { ok: false, error: "not a participant" };
      return { ok: true, data: { ok: true } };
    }

    case "get_my_profile": {
      const scopeCheck = requireScope(ctx, "profile:read");
      if (scopeCheck) return scopeCheck;

      const { data, error } = await ctx.supabase
        .from("profiles")
        .select("*")
        .eq("id", ctx.userId)
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      if (!data) return { ok: false, error: "not found" };
      return { ok: true, data };
    }

    case "get_profile": {
      // Public — no scope required, mirrors the unauthenticated REST handler.
      const parsed = z
        .object({ handle: z.string().min(3).max(40) })
        .safeParse(args);
      if (!parsed.success) return { ok: false, error: parsed.error.message };

      const { data, error } = await ctx.supabase
        .from("profiles")
        .select(
          "id, handle, display_name, account_type, avatar_url, bio, country_code, is_verified, rating_avg, rating_count, created_at",
        )
        .eq("handle", parsed.data.handle)
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      if (!data) return { ok: false, error: "not found" };
      return { ok: true, data };
    }

    case "update_my_profile": {
      const scopeCheck = requireScope(ctx, "profile:write");
      if (scopeCheck) return scopeCheck;

      const parsed = ProfileUpdate.safeParse(args);
      if (!parsed.success) return { ok: false, error: parsed.error.message };

      const updates: Record<string, any> = {};
      if (parsed.data.displayName !== undefined) updates.display_name = parsed.data.displayName;
      if (parsed.data.avatarUrl !== undefined) updates.avatar_url = parsed.data.avatarUrl;
      if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio;
      if (parsed.data.countryCode !== undefined) updates.country_code = parsed.data.countryCode;

      const { data, error } = await ctx.supabase
        .from("profiles")
        .update(updates)
        .eq("id", ctx.userId)
        .select()
        .single();
      if (error) return { ok: false, error: error.message };
      return { ok: true, data };
    }

    default:
      return { ok: false, error: `unknown tool: ${name}` };
  }
}

function mapDetailToRow(input: any): Record<string, any> {
  const d = input.details;
  switch (input.vertical) {
    case "goods":
      return {
        category: d.category,
        condition: d.condition,
        brand: d.brand ?? null,
        size: d.size ?? null,
        color: d.color ?? null,
        shipping_available: d.shippingAvailable ?? false,
        pickup_only: d.pickupOnly ?? false,
      };
    case "cars":
      return {
        make: d.make,
        model: d.model,
        year: d.year,
        mileage_km: d.mileageKm ?? null,
        fuel_type: d.fuelType,
        transmission: d.transmission,
        body_type: d.bodyType,
        drivetrain: d.drivetrain ?? null,
        engine_power_hp: d.enginePowerHp ?? null,
      };
    case "realestate":
      return {
        deal_type: d.dealType,
        property_type: d.propertyType,
        living_area_sqm: d.livingAreaSqm ?? null,
        bedrooms: d.bedrooms ?? null,
        bathrooms: d.bathrooms ?? null,
        year_built: d.yearBuilt ?? null,
      };
    case "jobs":
      return {
        company_name: d.companyName,
        employment_type: d.employmentType,
        work_arrangement: d.workArrangement,
        experience_level: d.experienceLevel ?? null,
      };
    case "services":
      return {
        category: d.category,
        pricing_model: d.pricingModel,
        rate_amount: d.rate?.amount ?? null,
        rate_currency: d.rate?.currency ?? null,
        remote_available: d.remoteAvailable ?? false,
      };
    default:
      return {};
  }
}
