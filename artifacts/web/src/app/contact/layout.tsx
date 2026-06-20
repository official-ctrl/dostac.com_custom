import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { Lang } from "@/components/dostac/i18n";
import { CONTACT_META, pickLangFromHeader } from "@/hooks/page-meta-config";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await pickLangFromHeader();
  const localized = CONTACT_META[lang];
  return {
    title: localized.title,
    description: localized.description,
    keywords: [
      "Contact Dostac", "Korean OEM quote", "K-Beauty manufacturer contact",
      "Korean cosmetics RFQ", "OEM sourcing inquiry",
      "도스탁 문의", "K-뷰티 OEM 견적",
    ],
    alternates: {
      canonical: "/contact",
      languages: {
        "x-default": "https://dostac.com/contact",
        en: "https://dostac.com/contact",
        ko: "https://dostac.com/contact",
        ja: "https://dostac.com/contact",
        zh: "https://dostac.com/contact",
        vi: "https://dostac.com/contact",
      },
    },
    openGraph: {
      title: "Contact Dostac | OEM/ODM Quote & Global Sales",
      description:
        "Reach Dostac's Korean sourcing team for K-Beauty OEM/ODM inquiries. 24h response, low MOQ, KGMP-certified manufacturing.",
      url: "/contact",
      images: ["/images/dostac/hero-contact.webp"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: localized.title,
      description: localized.description,
      images: ["/images/dostac/hero-contact.webp"],
    },
  };
}

/* Server-side dynamic import of locale dict for FAQ data — keeps the bundled
   layout chunk tiny while letting Google index localized FAQ rich-results. */
async function loadFaq(lang: Lang): Promise<Array<{ q: string; a: string }>> {
  try {
    let dict: { contact?: { faqs?: Array<{ q: string; a: string }> } };
    switch (lang) {
      case "ko": dict = (await import("@/components/dostac/locales/ko")).ko as typeof dict; break;
      case "ja": dict = (await import("@/components/dostac/locales/ja")).ja as typeof dict; break;
      case "zh": dict = (await import("@/components/dostac/locales/zh")).zh as typeof dict; break;
      case "vi": dict = (await import("@/components/dostac/locales/vi")).vi as typeof dict; break;
      case "en":
      default:   dict = (await import("@/components/dostac/locales/en")).en as typeof dict;
    }
    if (Array.isArray(dict.contact?.faqs)) return dict.contact.faqs;
    /* Fallback to EN if user's locale doesn't have FAQ yet (ja/zh/vi) */
    const enDict = (await import("@/components/dostac/locales/en")).en as typeof dict;
    return enDict.contact?.faqs ?? [];
  } catch {
    return [];
  }
}

export default async function ContactLayout({ children }: { children: ReactNode }) {
  const lang = await pickLangFromHeader();
  const faqs = await loadFaq(lang);

  /* FAQPage JSON-LD — enables Google "People also ask" / FAQ rich snippet.
     Schema spec: https://schema.org/FAQPage */
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://dostac.com/contact#faqpage",
    inLanguage: lang,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      {children}
    </>
  );
}
