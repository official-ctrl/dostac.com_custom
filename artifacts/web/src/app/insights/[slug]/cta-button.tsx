"use client";

import Link from "next/link";
import { trackCtaClick } from "@/lib/analytics";

export function InsightsCtaButton() {
  return (
    <Link
      href="/contact"
      onClick={() => trackCtaClick("Get OEM Quote", "insights_article")}
      className="inline-flex items-center gap-1.5 text-sm font-semibold bg-accent text-white px-4 py-2 rounded-full hover:bg-accent/90 transition-colors"
    >
      Get OEM Quote
    </Link>
  );
}
