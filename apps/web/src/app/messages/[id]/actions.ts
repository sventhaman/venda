"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(conversationId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { ok: false, error: "Message can't be empty" };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
    sent_by_agent: false,
  });
  if (error) return { ok: false, error: error.message };

  // Mark this conversation read for me as of now.
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath(`/messages`);
  return { ok: true };
}
