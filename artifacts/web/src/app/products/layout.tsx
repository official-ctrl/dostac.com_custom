import type { Metadata } from "next";
import type { ReactNode } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { getListPublicProductsQueryOptions } from "@workspace/api-client-react";
import { PRODUCTS_META, pickLangFromHeader } from "@/hooks/page-meta-config";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await pickLangFromHeader();
  const localized = PRODUCTS_META[lang];
  return {
    title: localized.title,
    description: localized.description,
  keywords: [
    "K-Beauty products", "Korean cosmetics catalog", "OEM skincare",
    "PDRN skincare", "Heartleaf toner", "Mugwort essence",
    "Centella skincare", "K-Beauty sheet masks", "private label cosmetics",
    "K-뷰티 카탈로그", "한국 화장품 OEM",
  ],
  alternates: {
    canonical: "/products",
    languages: {
      "x-default": "https://dostac.com/products",
      en: "https://dostac.com/products",
      ko: "https://dostac.com/products",
      ja: "https://dostac.com/products",
      zh: "https://dostac.com/products",
      vi: "https://dostac.com/products",
    },
  },
  openGraph: {
    title: "K-Beauty OEM/ODM Products | Dostac",
    description:
      "Custom-formulated K-Beauty skincare, sun care, ampoules, sheet masks and skin boosters. Private label ready, KGMP certified, shipped to 47+ countries.",
    url: "/products",
    images: ["/images/dostac/hero-products.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: localized.title,
    description: localized.description,
    images: ["/images/dostac/hero-products.webp"],
  },
  };
}

/* Server-side prefetch of the full products list so the rendered HTML contains
   the actual product names, descriptions, and links — critical for Naver / Bing
   / Baidu indexing (those crawlers don't always execute client JS).

   Detects user's language from Accept-Language so SSR HTML matches what an
   indexer in that locale would see (Korean indexer → Korean product names).
   Client-side hydration handles filters, search, language switching, etc. */
export default async function ProductsLayout({ children }: { children: ReactNode }) {
  const userLang = await pickLangFromHeader();
  const queryClient = getQueryClient();

  /* IMPORTANT: LanguageProvider always starts with "en" during initial render
     to prevent hydration mismatch (it switches to localStorage lang in useEffect).
     So SSR uses "en" — we MUST prefetch with "en" for the cache to hit.

     We also prefetch the user's detected language so it's instantly available
     when the client switches over after hydration (no loading spinner). */
  const prefetches: Promise<unknown>[] = [
    queryClient.prefetchQuery(getListPublicProductsQueryOptions({ lang: "en" })),
  ];
  if (userLang !== "en") {
    prefetches.push(
      queryClient.prefetchQuery(getListPublicProductsQueryOptions({ lang: userLang })),
    );
  }
  /* Race against a 2.5s timeout so a slow API never blocks SSR. */
  await Promise.race([
    Promise.all(prefetches),
    new Promise<void>((resolve) => setTimeout(resolve, 2500)),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      {children}
    </HydrationBoundary>
  );
}
