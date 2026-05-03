import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { NewKeyDialog } from "./new-key-dialog";
import { RevokeKeyButton } from "./revoke-key-button";
import { formatTimeAgo } from "@/lib/format";

type ApiKeyRow = {
  id: string;
  label: string;
  prefix: string;
  scopes: string[] | null;
  rate_limit_per_minute: number;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
};

export default async function KeysPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?error=Sign+in+to+manage+API+keys");
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("api_keys")
    .select("id, label, prefix, scopes, rate_limit_per_minute, expires_at, last_used_at, created_at, revoked_at")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  const keys = (rows ?? []) as ApiKeyRow[];

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">API keys</h1>
          <p className="mt-3 max-w-2xl text-ink-mute">
            Each key gives an agent the permissions you scope it with. Keys are hashed
            at rest — the plaintext is shown only at creation time.
          </p>
          <p className="mt-2 text-sm text-ink-mute">
            Use a key by sending it as the <code className="rounded bg-ink-fog px-1.5 py-0.5">X-API-Key</code>{" "}
            header on requests to the ichiba API.
          </p>
        </div>
        <NewKeyDialog />
      </div>

      {keys.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-ink-line bg-ink-fog/50 p-12 text-center text-ink-mute">
          You haven&apos;t created any API keys yet. Click{" "}
          <span className="font-medium text-ink">Create new key</span> to mint your first one.
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-ink-line border-y border-ink-line">
          {keys.map((k) => (
            <KeyRow key={k.id} k={k} />
          ))}
        </ul>
      )}
    </div>
  );
}

function KeyRow({ k }: { k: ApiKeyRow }) {
  const status = computeStatus(k);
  const isActive = status === "active";

  return (
    <li className={`grid grid-cols-1 gap-3 py-5 sm:grid-cols-[1fr_auto] ${!isActive ? "opacity-60" : ""}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{k.label}</span>
          <StatusBadge status={status} />
        </div>
        <div className="mt-1 font-mono text-xs text-ink-mute">{k.prefix}…</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(k.scopes ?? []).map((s) => (
            <span key={s} className="rounded-full bg-ink-fog px-2 py-0.5 text-[10px] tracking-wide text-ink-mute">
              {s}
            </span>
          ))}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-ink-mute sm:grid-cols-4">
          <Item label="Rate limit" value={`${k.rate_limit_per_minute}/min`} />
          <Item label="Last used" value={k.last_used_at ? formatTimeAgo(k.last_used_at) : "never"} />
          <Item label="Created" value={formatTimeAgo(k.created_at)} />
          <Item
            label="Expires"
            value={k.expires_at ? new Date(k.expires_at).toLocaleDateString() : "never"}
          />
        </dl>
      </div>

      <div className="sm:self-start">
        {isActive ? (
          <RevokeKeyButton keyId={k.id} label={k.label} prefix={k.prefix} />
        ) : (
          <span className="text-xs text-ink-mute">{status === "revoked" ? "Revoked" : "Expired"}</span>
        )}
      </div>
    </li>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "revoked" | "expired" }) {
  const base = "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest";
  if (status === "active") {
    return <span className={`${base} bg-emerald-50 text-emerald-700`}>Active</span>;
  }
  if (status === "revoked") {
    return <span className={`${base} bg-red-50 text-red-700`}>Revoked</span>;
  }
  return <span className={`${base} bg-ink-fog text-ink-mute`}>Expired</span>;
}

function computeStatus(k: ApiKeyRow): "active" | "revoked" | "expired" {
  if (k.revoked_at) return "revoked";
  if (k.expires_at && new Date(k.expires_at) < new Date()) return "expired";
  return "active";
}
