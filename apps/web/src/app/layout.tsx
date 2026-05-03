import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "ichiba — agent-first marketplace",
  description: "Buy and sell goods, cars, real estate, jobs and services. Built for humans and agents.",
};

// Best-effort preconnect to Supabase so the TLS handshake starts in parallel
// with HTML parsing — shaves the first network call's setup cost on cold loads.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {SUPABASE_URL && (
          <>
            <link rel="preconnect" href={SUPABASE_URL} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={SUPABASE_URL} />
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
