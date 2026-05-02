import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function KeysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+manage+API+keys");

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">API keys</h1>
      <p className="mt-3 max-w-prose text-ink-mute">
        Each key gives an agent the permissions you scope it with. Keys are hashed at
        rest — the plaintext is shown to you exactly once.
      </p>

      <div className="mt-10 rounded-2xl border border-ink-line bg-ink-fog/50 p-12 text-center text-ink-mute">
        Key management UI coming soon.
        <p className="mt-3 text-sm">
          For now, mint a key by calling{" "}
          <code className="rounded bg-white px-1.5 py-0.5">POST /v1/api-keys</code>{" "}
          with your session JWT.
        </p>
      </div>
    </div>
  );
}
