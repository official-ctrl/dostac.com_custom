import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Production Process",
  description:
    "Explore Dostac's ISO-certified K-beauty OEM/ODM production process — from custom formulation and quality testing to global fulfillment.",
  openGraph: {
    title: "OEM/ODM Production Process | Dostac",
    description:
      "ISO-certified Korean cosmetics manufacturing. Custom formulation, stringent QC, and end-to-end OEM/ODM solutions for global brands.",
  },
};

export default function ProductionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
