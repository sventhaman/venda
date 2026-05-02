import Link from "next/link";
import { signIn } from "./actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-ink-mute">
          Welcome back. Sign in with your email and password.
        </p>
      </div>

      <form action={signIn} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-lg border border-ink-line px-3 py-2 text-base focus:border-ink focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            minLength={6}
            className="rounded-lg border border-ink-line px-3 py-2 text-base focus:border-ink focus:outline-none"
          />
        </label>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="mt-2 rounded-full bg-ink py-3 text-sm font-medium text-white hover:bg-ink-soft"
        >
          Sign in
        </button>
      </form>

      <div className="text-sm text-ink-mute">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-ink underline-offset-4 hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
}
