import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get a custom OEM/ODM quote or ask our global sales team anything. Dostac responds within 24–48 business hours. Low MOQ, 30+ countries served.",
  openGraph: {
    title: "Contact Dostac | OEM/ODM Quote & Global Sales",
    description:
      "Reach Dostac's global sales team for K-beauty OEM/ODM inquiries. Fast turnaround, low MOQ, ISO-certified manufacturing.",
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
