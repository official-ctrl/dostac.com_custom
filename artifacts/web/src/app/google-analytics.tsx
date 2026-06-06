"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Must be rendered inside a <Suspense> boundary in layout.tsx.
 * useSearchParams() requires Suspense to avoid opting the page into dynamic rendering.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const search = searchParams.toString();
    window.gtag("event", "page_view", {
      page_path: pathname + (search ? `?${search}` : ""),
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
