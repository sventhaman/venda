"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Thin top progress bar that fires on any link click and sticks until the
// path or search params change. Gives an instant "click registered" signal
// even before the new page server-renders, which is the bit the app was
// missing — clicks felt unresponsive because nothing painted for ~200ms
// while the server worked.
//
// Implementation: capture-phase listener for clicks anywhere on the page;
// if the click hits an internal anchor, start the bar. Reset whenever the
// pathname or query string changes.
export function RouteProgress() {
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hide whenever the route actually changes.
  useEffect(() => {
    if (active) {
      // Snap to 100, fade out.
      setProgress(100);
      const t = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 180);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams.toString()]);

  // Listen for internal-link clicks globally.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      // Ignore modified clicks (open in new tab etc).
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      const target = a.getAttribute("target");
      if (target && target !== "_self") return;
      // External link?
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // Same path + query? No nav.
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }
      start();
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function start() {
    setActive(true);
    setProgress(8);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      // Asymptote toward 90% — never reaches it on its own; the path-change
      // effect snaps it to 100% on completion.
      setProgress((p) => (p < 90 ? p + (90 - p) * 0.08 : p));
    }, 200);
  }

  // Stop the ticker when bar is hidden.
  useEffect(() => {
    if (!active && tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div
        className="h-full bg-accent shadow-[0_0_8px_rgba(0,99,251,0.6)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
