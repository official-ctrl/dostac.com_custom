import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Script from "next/script";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import {
  getListPublicCategoryTranslationsQueryOptions,
  getListPublicSubCategoryTranslationsQueryOptions,
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
  // Server-side bootstrap: prefetch navigation data used by Layout component
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(getListPublicCategoryTranslationsQueryOptions()),
    queryClient.prefetchQuery(getListPublicSubCategoryTranslationsQueryOptions()),
  ]);
  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..500&display=swap"
          rel="stylesheet"
        />
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
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
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
