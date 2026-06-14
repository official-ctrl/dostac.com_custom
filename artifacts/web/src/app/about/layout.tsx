import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ABOUT_META, pickLangFromHeader } from "@/hooks/page-meta-config";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await pickLangFromHeader();
  const localized = ABOUT_META[lang];
  return {
    title: localized.title,
    description: localized.description,
  keywords: [
    "About Dostac", "Korean cosmetics manufacturer", "K-Beauty company",
    "Dostac founder", "Korean OEM company", "K-Beauty heritage",
    "도스탁 소개", "한국 화장품 제조사",
  ],
  alternates: {
    canonical: "/about",
    languages: {
      "x-default": "https://dostac.com/about",
      en: "https://dostac.com/about",
      ko: "https://dostac.com/about",
      ja: "https://dostac.com/about",
      zh: "https://dostac.com/about",
      vi: "https://dostac.com/about",
    },
  },
  openGraph: {
    title: "About Dostac | Korean OEM/ODM Cosmetics Manufacturer",
    description:
      "Dostac connects Korean manufacturers with global buyers through trusted OEM, private label, and K-beauty formulation services.",
    url: "/about",
    images: ["/images/dostac/hero-about.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: localized.title,
    description: localized.description,
    images: ["/images/dostac/hero-about.webp"],
  },
  };
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
