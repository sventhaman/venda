"use client";

import { useFormStatus } from "react-dom";

type Variant = "primary" | "secondary" | "danger";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: Variant;
  fullWidth?: boolean;
  className?: string;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white hover:bg-ink-soft disabled:opacity-60",
  secondary:
    "rounded-full border border-ink-line px-5 py-2.5 text-sm hover:border-ink disabled:opacity-60",
  danger:
    "rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60",
};

// Generic submit button that listens to its parent <form>'s server action and
// shows a pending state while it's in flight. Drop this into any form to get
// "Saving…" / "Sending…" feedback automatically.
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  fullWidth,
  className,
}: Props) {
  const { pending } = useFormStatus();

  const cls = [
    VARIANTS[variant],
    fullWidth ? "w-full" : "",
    "inline-flex items-center justify-center gap-2",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="submit" disabled={pending} className={cls}>
      {pending && <Spinner />}
      <span>{pending ? (pendingLabel ?? "Saving…") : children}</span>
    </button>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-spin"
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
