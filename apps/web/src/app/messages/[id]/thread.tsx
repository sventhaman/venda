"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "./actions";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  sent_by_agent: boolean;
  created_at: string;
};

export function Thread({
  conversationId,
  meId,
  initial,
}: {
  conversationId: string;
  meId: string;
  initial: Message[];
}) {
  const [messages, setMessages] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Subscribe to new messages on this conversation. RLS ensures only participants
  // receive these — Realtime respects the same policies as the REST API.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
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
          const msg = payload.new as Message;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Scroll the page so the latest message is visible above the sticky composer.
  useEffect(() => {
    scrollerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return (
    <div className="flex flex-col">
      <div ref={scrollerRef} className="min-h-[40vh] py-4">
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
      </div>

      <form
        ref={formRef}
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const res = await sendMessage(conversationId, formData);
            if (res.ok) formRef.current?.reset();
            else setError(res.error ?? "Send failed");
          });
        }}
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

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <li className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          mine
            ? "rounded-br-md bg-ink text-white"
            : "rounded-bl-md bg-ink-fog text-ink"
        }`}
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
