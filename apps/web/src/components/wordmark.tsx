import Link from "next/link";

// Wordmark: a small persimmon-tinted square with the 市 kanji (ichi, the
// first kanji of 市場 ichiba — "marketplace"), followed by the lowercase
// wordmark. Free identity from the name's etymology.
export function Wordmark({ asLink = true }: { asLink?: boolean }) {
  const inner = (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className="flex h-7 w-7 items-center justify-center rounded-md bg-accent font-ja text-base font-medium leading-none text-white"
      >
        市
      </span>
      <span className="text-xl font-semibold tracking-tight">ichiba</span>
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link href="/" className="inline-flex items-center" aria-label="ichiba — home">
      {inner}
    </Link>
  );
}
