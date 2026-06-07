import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Industry news, K-beauty trends, and OEM/ODM updates from Dostac. Stay informed about the latest in Korean cosmetics manufacturing.",
  openGraph: {
    title: "Insights | Dostac",
    description:
      "K-beauty industry trends, product news, and OEM/ODM manufacturing updates from Dostac's global team.",
  },
};

export default function InsightsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
