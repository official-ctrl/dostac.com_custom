import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PRODUCTION_META, pickLangFromHeader } from "@/hooks/page-meta-config";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await pickLangFromHeader();
  const localized = PRODUCTION_META[lang];
  return {
    title: localized.title,
    description: localized.description,
  keywords: [
    "Korean cosmetics production", "K-Beauty OEM process",
    "KGMP certified manufacturer", "ISO 22716 cosmetics",
    "Korean cosmetics QC", "K-Beauty private label production",
    "한국 화장품 생산", "K-뷰티 제조 공정",
  ],
  alternates: {
    canonical: "/production",
    languages: {
      "x-default": "https://dostac.com/production",
      en: "https://dostac.com/production",
      ko: "https://dostac.com/production",
      ja: "https://dostac.com/production",
      zh: "https://dostac.com/production",
      vi: "https://dostac.com/production",
    },
  },
  openGraph: {
    title: "OEM/ODM Production Process | Dostac",
    description:
      "KGMP + ISO 22716 + FDA certified Korean cosmetics manufacturing. Custom formulation, stringent QC, and end-to-end OEM/ODM solutions for global brands.",
    url: "/production",
    images: ["/images/dostac/hero-production.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: localized.title,
    description: localized.description,
    images: ["/images/dostac/hero-production.webp"],
  },
  };
}

export default function ProductionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
