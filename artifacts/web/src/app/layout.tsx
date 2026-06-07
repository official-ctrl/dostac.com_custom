export const runtime = "edge";

import type { Metadata } from "next";
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
  getListPublicBannersQueryOptions,
} from "@workspace/api-client-react";
import { Providers } from "./providers";
import { GoogleAnalytics } from "./google-analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dostac.com"),
  title: {
    default: "Korean Cosmetics OEM & ODM Manufacturer | Dostac",
    template: "%s | Dostac",
  },
  description:
    "Dostac is a Korean cosmetics OEM/ODM manufacturer specializing in private label skincare, K-beauty formulation, and global distribution.",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Dostac",
  url: "https://dostac.com",
  logo: "https://dostac.com/favicon.svg",
  description:
    "Korean cosmetics OEM/ODM manufacturer specializing in private label skincare and K-beauty formulation for global brands.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    availableLanguage: ["English", "Korean", "Japanese", "Chinese", "Vietnamese"],
    url: "https://dostac.com/contact",
  },
  areaServed: "Worldwide",
  knowsAbout: [
    "OEM Cosmetics",
    "ODM Beauty Products",
    "Private Label Skincare",
    "K-Beauty Manufacturing",
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Server-side bootstrap: prefetch navigation data (categories) used by Layout.
  // Wrapped in Promise.race with a 3s timeout so a slow API never blocks SSR.
  const queryClient = getQueryClient();
  await Promise.race([
    Promise.all([
      queryClient.prefetchQuery(getListPublicCategoryTranslationsQueryOptions()),
      queryClient.prefetchQuery(getListPublicSubCategoryTranslationsQueryOptions()),
      queryClient.prefetchQuery(getListPublicBannersQueryOptions()),
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
