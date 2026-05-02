"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SentMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  sent_by_agent: boolean;
  created_at: string;
};

export async function sendMessage(
  conversationId: string,
  formData: FormData,
): Promise<
  | { ok: true; message: SentMessage }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { ok: false, error: "Message can't be empty" };

  const { data: msg, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body,
      sent_by_agent: false,
    })
    .select()
    .single();

  if (error || !msg) return { ok: false, error: error?.message ?? "Send failed" };

  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  revalidatePath(`/messages`);
  return { ok: true, message: msg as SentMessage };
}
