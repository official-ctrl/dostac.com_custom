import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "K-beauty industry trends, OEM/ODM strategies, and Korean cosmetics manufacturing insights from the Dostac team.",
  openGraph: {
    title: "Insights | Dostac",
    description:
      "K-beauty industry trends, OEM/ODM strategies, and Korean cosmetics manufacturing insights from the Dostac team.",
  },
};

export default function InsightsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
