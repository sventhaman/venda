import Link from "next/link";
import { signUp } from "./actions";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;

  if (ok) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-ink-mute">
          We sent a confirmation link to your inbox. Click it to finish creating your
          account, then return here to sign in.
        </p>
        <p className="text-sm text-ink-mute">
          (If your project has email confirmations turned off, you can{" "}
          <Link href="/sign-in" className="text-ink underline-offset-4 hover:underline">
            sign in
          </Link>{" "}
          directly.)
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
        <p className="mt-2 text-sm text-ink-mute">
          One account for buying, selling, and minting agent API keys.
        </p>
      </div>

      <form action={signUp} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Display name</span>
          <input
            name="displayName"
            type="text"
            required
            minLength={1}
            maxLength={100}
            className="rounded-lg border border-ink-line px-3 py-2 text-base focus:border-ink focus:outline-none"
          />
        </label>

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
            autoComplete="new-password"
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
          Create account
        </button>
      </form>

      <div className="text-sm text-ink-mute">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-ink underline-offset-4 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
