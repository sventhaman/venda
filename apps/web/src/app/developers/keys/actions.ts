"use server";

import { revalidatePath } from "next/cache";
import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { ApiKeyScope } from "@ichiba/schema";
import { z } from "zod";

const KEY_PREFIX = "ichiba_";
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomToken(len: number) {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += ALPHABET[bytes[i]! % ALPHABET.length];
  return out;
}

function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

const NewKeyInput = z.object({
  label: z.string().trim().min(1).max(80),
  scopes: z.array(ApiKeyScope).min(1),
  rateLimitPerMinute: z.number().int().positive().max(10000).default(120),
  expiresAt: z.string().optional(),
});

export async function mintApiKey(formData: FormData): Promise<
  | { ok: true; plaintext: string; prefix: string; label: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const scopesRaw = formData.getAll("scopes").map(String);
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

  const parsed = NewKeyInput.safeParse({
    label: String(formData.get("label") ?? ""),
    scopes: scopesRaw,
    rateLimitPerMinute: Number(formData.get("rateLimitPerMinute") ?? 120),
    expiresAt: expiresAtRaw || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const plaintext = `${KEY_PREFIX}${randomToken(40)}`;
  const prefix = plaintext.slice(0, 14);
  const keyHash = sha256Hex(plaintext);

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      owner_user_id: user.id,
      label: parsed.data.label,
      prefix,
      key_hash: keyHash,
      scopes: parsed.data.scopes,
      rate_limit_per_minute: parsed.data.rateLimitPerMinute,
      expires_at: parsed.data.expiresAt
        ? new Date(parsed.data.expiresAt).toISOString()
        : null,
    })
    .select()
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Could not create key" };

  revalidatePath("/developers/keys");
  return { ok: true, plaintext, prefix: data.prefix, label: data.label };
}

export async function revokeApiKey(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_user_id", user.id);

  revalidatePath("/developers/keys");
}
