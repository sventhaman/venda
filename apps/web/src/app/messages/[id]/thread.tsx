"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, type SentMessage } from "./actions";

type LocalMessage = SentMessage & { pending?: boolean };

export function Thread({
  conversationId,
  meId,
  initial,
}: {
  conversationId: string;
  meId: string;
  initial: SentMessage[];
}) {
  // Single source of truth. We append a temp message on submit (with a
  // tempId), and on the action's response we drop the temp and add the real
  // row — unless Realtime already added it, in which case we just drop
  // the temp. Same dedupe handles every ordering of (action ↔ realtime).
  const [messages, setMessages] = useState<LocalMessage[]>(initial);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);

  // Realtime: subscribe to inserts in this conversation. The browser WS needs
  // the user's access token attached or RLS treats it as anon and filters
  // everything out, so we setAuth before subscribing.
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }

      channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const incoming = payload.new as SentMessage;
            setMessages((prev) => {
              // Already have it (e.g. from the action's response).
              if (prev.some((m) => m.id === incoming.id)) return prev;

              // If this is my own message coming back over Realtime, look for
              // the matching temp bubble and swap it in place — preserves
              // visual order and prevents the brief temp+real overlap.
              if (incoming.sender_id === meId) {
                const tempIdx = prev.findIndex(
                  (m) =>
                    m.id.startsWith("tmp_") &&
                    m.sender_id === meId &&
                    m.body === incoming.body,
                );
                if (tempIdx >= 0) {
                  const next = prev.slice();
                  next[tempIdx] = incoming;
                  return next;
                }
              }

              return [...prev, incoming];
            });
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Auto-scroll to the latest message on change.
  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function submit(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    setError(null);
    formRef.current?.reset();

    const tempId = `tmp_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36)}`;
    const tempMessage: LocalMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: meId,
      body,
      sent_by_agent: false,
      created_at: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    startTransition(async () => {
      const res = await sendMessage(conversationId, formData);
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        if (!res.ok) return withoutTemp;
        // Realtime may have already delivered the same row (matched by id);
        // either way, ensure the real message is in state exactly once.
        return withoutTemp.some((m) => m.id === res.message.id)
          ? withoutTemp
          : [...withoutTemp, res.message];
      });
      if (!res.ok) setError(res.error ?? "Send failed");
    });
  }

  return (
    <div className="flex flex-col">
      <div className="min-h-[40vh] py-4">
        {messages.length === 0 ? (
          <p className="my-12 text-center text-sm text-ink-mute">
            No messages yet — type below to say hello.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} mine={m.sender_id === meId} />
            ))}
          </ul>
        )}
        <div ref={tailRef} />
      </div>

      <form
        ref={formRef}
        action={submit}
        className="sticky bottom-0 -mx-6 border-t border-ink-line bg-white/95 px-6 pb-4 pt-3 backdrop-blur"
      >
        <div className="flex items-end gap-2">
          <textarea
            name="body"
            required
            rows={2}
            placeholder="Write a message…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-ink-line px-3 py-2 text-base focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-soft disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <p className="mt-1 text-[10px] text-ink-mute">Enter to send · Shift+Enter for newline</p>
      </form>
    </div>
  );
}

function Bubble({ message, mine }: { message: LocalMessage; mine: boolean }) {
  return (
    <li className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed transition-opacity ${
          mine
            ? "rounded-br-md bg-ink text-white"
            : "rounded-bl-md bg-ink-fog text-ink"
        } ${message.pending ? "opacity-60" : ""}`}
      >
        {message.sent_by_agent && (
          <div className="mb-0.5 text-[10px] uppercase tracking-wide opacity-60">
            via agent
          </div>
        )}
        <div className="whitespace-pre-wrap">{message.body}</div>
      </div>
    </li>
  );
}
