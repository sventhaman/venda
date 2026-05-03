import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../lib/supabase.js";
import { authMiddleware, requireScope, type AuthVariables } from "../middleware/auth.js";
import { startOrFindConversation } from "../lib/conversations.js";

const UuidParam = z.string().uuid();

export const messagesRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

messagesRoutes.use("*", authMiddleware);

// List the authed user's conversations.
messagesRoutes.get("/conversations", requireScope("messages:read"), async (c) => {
  const supa = c.get("supabase");
  const userId = c.get("authedUserId");

  const { data, error } = await supa
    .from("conversation_participants")
    .select("conversation_id, last_read_at, conversations!inner(id, listing_id, last_message_at, created_at)")
    .eq("user_id", userId)
    .order("conversations(last_message_at)", { ascending: false, nullsFirst: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ items: data ?? [] });
});

// Messages in a conversation. Verify the caller is a participant before
// returning anything — agent auth uses the service-role client which bypasses
// RLS, so the explicit check is what gates this for agents.
messagesRoutes.get("/conversations/:id/messages", requireScope("messages:read"), async (c) => {
  const supa = c.get("supabase");
  const userId = c.get("authedUserId");
  const conversationId = c.req.param("id");
  if (!UuidParam.safeParse(conversationId).success) {
    return c.json({ error: "invalid conversation id" }, 400);
  }

  const { data: membership } = await supa
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!membership) return c.json({ error: "not found" }, 404);

  const { data, error } = await supa
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ items: data ?? [] });
});

// Send a message. Either:
//   - conversationId: post into an existing thread the caller already participates in.
//   - listingId: resume or start the (unique) buyer↔seller thread for that listing
//     via the start_conversation RPC. We never accept an arbitrary recipientId
//     from the client — that would let a caller wire two unrelated users into a
//     thread.
const SendBody = z.object({
  conversationId: z.string().uuid().optional(),
  listingId: z.string().uuid().optional(),
  body: z.string().trim().min(1).max(10000),
  attachments: z.array(z.string().url()).optional(),
}).refine((d) => d.conversationId || d.listingId, {
  message: "Provide conversationId or listingId",
});

messagesRoutes.post("/", requireScope("messages:write"), async (c) => {
  const parsed = SendBody.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const supa = c.get("supabase");
  const userId = c.get("authedUserId");
  const isAgent = c.get("authMethod") === "api_key";

  let conversationId = parsed.data.conversationId;

  // listingId path: look up or create the unique thread between caller and
  // seller. Humans use the SECURITY DEFINER RPC (relies on auth.uid()).
  // Agents go through the service-role client where auth.uid() is null, so
  // we run the same flow inline using the userId we already verified from
  // the api_key.
  if (!conversationId) {
    if (isAgent) {
      const r = await startOrFindConversation(supa, userId, parsed.data.listingId!);
      if (!r.ok) return c.json({ error: r.error }, 400);
      conversationId = r.id;
    } else {
      const { data: convoId, error: rpcErr } = await supa.rpc("start_conversation", {
        _listing_id: parsed.data.listingId,
      });
      if (rpcErr || !convoId) {
        return c.json({ error: rpcErr?.message ?? "could not start conversation" }, 400);
      }
      conversationId = convoId as string;
    }
  } else {
    // Verify the caller is a participant. RLS would catch this for human
    // sessions, but agents go through the service-role client.
    const { data: membership } = await supa
      .from("conversation_participants")
      .select("conversation_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!membership) return c.json({ error: "not a participant" }, 403);
  }

  const { data: msg, error } = await supa
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: parsed.data.body,
      attachments: parsed.data.attachments ?? [],
      sent_by_agent: isAgent,
    })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(msg, 201);
});
