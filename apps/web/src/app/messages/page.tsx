import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+see+your+messages");

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>
      <p className="mt-3 max-w-prose text-ink-mute">
        Your conversations will appear here. Start one from any listing&apos;s detail page,
        or have an agent send a message via{" "}
        <code className="rounded bg-ink-fog px-1.5 py-0.5 text-sm">POST /v1/messages</code>.
      </p>
      <div className="mt-10 rounded-2xl border border-ink-line bg-ink-fog/50 p-12 text-center text-ink-mute">
        No conversations yet.
        <div className="mt-4">
          <Link
            href="/goods"
            className="rounded-full bg-ink px-5 py-2 text-sm text-white hover:bg-ink-soft"
          >
            Browse listings
          </Link>
        </div>
      </div>
    </div>
  );
}
