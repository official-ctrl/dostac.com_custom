import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Dostac — Korea's trusted OEM/ODM cosmetics manufacturer with ISO certification, 30+ export countries, and a global sales team.",
  openGraph: {
    title: "About Dostac | Korean OEM/ODM Cosmetics Manufacturer",
    description:
      "Dostac connects Korean manufacturers with global buyers through trusted OEM, private label, and K-beauty formulation services.",
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
