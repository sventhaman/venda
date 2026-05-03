"use client";

import { useFormStatus } from "react-dom";

// Tiny submit button used inside the Pause / Publish forms in the dashboard.
// Uses useFormStatus to flip into a pending state while the server action
// runs, so users see immediate feedback instead of clicking and waiting.
export function RowActionButton({
  children,
  pendingLabel,
  variant,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant: "publish" | "secondary";
}) {
  const { pending } = useFormStatus();
  const cls =
    variant === "publish"
      ? "rounded-full bg-ink px-3 py-1 text-white hover:bg-ink-soft disabled:opacity-60"
      : "rounded-full border border-ink-line px-3 py-1 hover:border-ink disabled:opacity-60";

  return (
    <button type="submit" disabled={pending} className={cls}>
      {pending ? pendingLabel : children}
    </button>
  );
}
