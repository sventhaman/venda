import { Hono } from "hono";
import { NewMessage } from "@ichiba/schema";
import type { Env } from "../lib/supabase.js";
import { authMiddleware, requireScope, type AuthVariables } from "../middleware/auth.js";

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

// Messages in a conversation.
messagesRoutes.get("/conversations/:id/messages", requireScope("messages:read"), async (c) => {
  const supa = c.get("supabase");
  const { data, error } = await supa
    .from("messages")
    .select("*")
    .eq("conversation_id", c.req.param("id"))
    .order("created_at", { ascending: true });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ items: data ?? [] });
});

// Send a message. Either:
//  - conversationId: post into existing thread, or
//  - recipientId (+ optional listingId): start a new thread.
messagesRoutes.post("/", requireScope("messages:write"), async (c) => {
  const body = await c.req.json();
  const parsed = NewMessage.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const supa = c.get("supabase");
  const userId = c.get("authedUserId");
  const isAgent = c.get("authMethod") === "api_key";

  let conversationId = parsed.data.conversationId;

  if (!conversationId) {
    if (!parsed.data.recipientId) return c.json({ error: "recipientId required" }, 400);

    const { data: convo, error: convoErr } = await supa
      .from("conversations")
      .insert({ listing_id: parsed.data.listingId ?? null })
      .select()
      .single();
    if (convoErr || !convo) return c.json({ error: convoErr?.message ?? "convo insert failed" }, 500);

    const { error: partErr } = await supa.from("conversation_participants").insert([
      { conversation_id: convo.id, user_id: userId },
      { conversation_id: convo.id, user_id: parsed.data.recipientId },
    ]);
    if (partErr) return c.json({ error: partErr.message }, 500);

    conversationId = convo.id;
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
