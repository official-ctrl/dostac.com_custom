import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse Dostac's full K-beauty OEM/ODM product catalogue — skincare, haircare, body care, masks, and more. Low MOQ, custom formulation available.",
  openGraph: {
    title: "K-Beauty OEM/ODM Products | Dostac",
    description:
      "Custom-formulated skincare, haircare, and beauty products by Dostac. Private label ready, ISO-certified, shipped to 30+ countries.",
  },
};

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
