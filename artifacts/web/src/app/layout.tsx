export const runtime = "edge";

import type { Metadata, Viewport } from "next";
import { HOME_META, pickLangFromHeader } from "@/hooks/page-meta-config";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Script from "next/script";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import {
  getListPublicCategoryTranslationsQueryOptions,
  getListPublicSubCategoryTranslationsQueryOptions,
} from "@workspace/api-client-react";
import { Providers } from "./providers";
import { GoogleAnalytics } from "./google-analytics";
import "./globals.css";

/* Localized metadata based on Accept-Language header — Korean users see Korean
   title in search results, Japanese users see Japanese, etc. Falls back to EN. */
export async function generateMetadata(): Promise<Metadata> {
  const lang = await pickLangFromHeader();
  const localized = HOME_META[lang];
  return {
    metadataBase: new URL("https://dostac.com"),
    title: {
      default: localized.title,
      template: `%s | Dostac`,
    },
    description: localized.description,
  keywords: [
    "K-Beauty OEM", "Korean cosmetics manufacturer", "ODM cosmetics",
    "private label skincare", "Korean OEM beauty", "K-Beauty wholesale",
    "Korean cosmetics export", "Korean beauty OEM",
    "OEM 화장품", "한국 화장품 제조", "K-뷰티 OEM",
  ],
  authors: [{ name: "Dostac Co., Ltd.", url: "https://dostac.com" }],
  creator: "Dostac Co., Ltd.",
  publisher: "Dostac Co., Ltd.",
  alternates: {
    canonical: "/",
    languages: {
      "x-default": "https://dostac.com/",
      "en":    "https://dostac.com/",
      "ko":    "https://dostac.com/",
      "ja":    "https://dostac.com/",
      "zh":    "https://dostac.com/",
      "vi":    "https://dostac.com/",
    },
  },
  openGraph: {
    title: "Launch Your K-Beauty Brand — Korean OEM/ODM by Dostac",
    description:
      "From formulation to global fulfillment: Dostac delivers ISO-certified Korean cosmetics OEM/ODM to 30+ countries. Low MOQ. Fast turnaround. Private label ready.",
    url: "https://dostac.com",
    siteName: "Dostac",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 675,
        alt: "Dostac — Korean Cosmetics OEM & ODM Manufacturer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your K-Beauty Brand Starts Here | Dostac OEM/ODM",
    description:
      "ISO-certified Korean cosmetics manufacturer. Skincare, haircare & masks. Low MOQ, 30+ countries shipped. Get a quote in 24h.",
    images: ["/opengraph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  };
}

/* JSON-LD graph: combines Organization + LocalBusiness for richer Knowledge Panel.
   Uses @graph so both schemas register under one script tag. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://dostac.com/#organization",
      name: "Dostac Co., Ltd.",
      alternateName: ["dostac", "도스탁", "ドスタック"],
      url: "https://dostac.com",
      logo: {
        "@type": "ImageObject",
        url: "https://dostac.com/favicon.svg",
        width: 512,
        height: 512,
      },
      image: "https://dostac.com/opengraph.png",
      description:
        "Korean cosmetics OEM/ODM manufacturer specializing in private label skincare and K-beauty formulation for global brands. Trusted by buyers across 47 countries.",
      foundingDate: "2017",
      founders: [{ "@type": "Person", name: "Dostac Founder" }],
      sameAs: [
        "https://www.linkedin.com/company/dostac",
        "https://www.instagram.com/dostac.official",
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "official@dostac.com",
          telephone: "+82-70-4334-7333",
          availableLanguage: ["English", "Korean", "Japanese", "Chinese", "Vietnamese"],
          areaServed: ["KR", "US", "JP", "CN", "VN", "AE", "SA", "EG", "FR", "DE", "GB"],
          url: "https://dostac.com/contact",
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "46-32, Neungpyeong-ro",
        addressLocality: "Gwangju-si",
        addressRegion: "Gyeonggi-do",
        postalCode: "12772",
        addressCountry: "KR",
      },
      areaServed: "Worldwide",
      knowsAbout: [
        "OEM Cosmetics", "ODM Beauty Products", "Private Label Skincare",
        "K-Beauty Manufacturing", "Korean Cosmetics", "Cosmetic Formulation",
        "Cosmetic Compliance KGMP", "Cosmetic Compliance ISO 22716",
      ],
      knowsLanguage: ["en", "ko", "ja", "zh", "vi"],
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://dostac.com/#localbusiness",
      name: "Dostac Co., Ltd.",
      url: "https://dostac.com",
      image: "https://dostac.com/opengraph.png",
      telephone: "+82-70-4334-7333",
      faxNumber: "+82-504-488-4345",
      email: "official@dostac.com",
      priceRange: "B2B Inquiry",
      address: {
        "@type": "PostalAddress",
        streetAddress: "46-32, Neungpyeong-ro",
        addressLocality: "Gwangju-si",
        addressRegion: "Gyeonggi-do",
        postalCode: "12772",
        addressCountry: "KR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 37.4116,
        longitude: 127.2954,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
      ],
      sameAs: [
        "https://www.linkedin.com/company/dostac",
        "https://www.instagram.com/dostac.official",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://dostac.com/#website",
      url: "https://dostac.com",
      name: "Dostac",
      publisher: { "@id": "https://dostac.com/#organization" },
      inLanguage: ["en", "ko", "ja", "zh", "vi"],
      potentialAction: {
        "@type": "SearchAction",
        target: "https://dostac.com/products?search={search_term_string}",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

/* Mobile-first viewport configuration */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E8" },
    { media: "(prefers-color-scheme: dark)",  color: "#0D1117" },
  ],
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Server-side bootstrap: prefetch navigation data (categories) used by Layout.
  // Wrapped in Promise.race with a 3s timeout so a slow API never blocks SSR.
  const queryClient = getQueryClient();
  await Promise.race([
    Promise.all([
      queryClient.prefetchQuery(getListPublicCategoryTranslationsQueryOptions()),
      queryClient.prefetchQuery(getListPublicSubCategoryTranslationsQueryOptions()),
    ]),
    new Promise<void>((resolve) => setTimeout(resolve, 3000)),
  ]);
  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="en" className={`scroll-smooth ${dmSans.variable} ${cormorantGaramond.variable}`}>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0F172A" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2NJPJZLCY2"
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2NJPJZLCY2', { send_page_view: false });
          `}
        </Script>
        <Providers>
          <HydrationBoundary state={dehydratedState}>
            {/* GA analytics in Suspense to avoid forcing dynamic rendering */}
            <Suspense fallback={null}>
              <GoogleAnalytics />
            </Suspense>
            {children}
          </HydrationBoundary>
        </Providers>
      </body>
    </html>
  );
}
