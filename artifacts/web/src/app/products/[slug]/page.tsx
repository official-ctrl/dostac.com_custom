import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { pickLangFromHeader } from "@/hooks/page-meta-config";

const SITE_URL = "https://dostac.com";
const ORG_ID = `${SITE_URL}/#organization`;

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* Try to fetch the real product translation from the API.
   Falls back to slug-derived data when the API is unreachable (e.g. static build). */
interface PublicProduct {
  slug: string;
  imageUrl?: string;
  category?: string;
  material?: string;
  nameKo?: string; nameEn?: string; nameJa?: string; nameZh?: string; nameVi?: string;
  descKo?: string; descEn?: string; descJa?: string; descZh?: string; descVi?: string;
}

async function fetchProduct(slug: string): Promise<PublicProduct | null> {
  const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(
      `${apiUrl}/api/public/products/${encodeURIComponent(slug)}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.data ?? data) as PublicProduct;
  } catch {
    return null;
  }
}

function pickName(p: PublicProduct | null, lang: string, fallback: string): string {
  if (!p) return fallback;
  const key = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof PublicProduct;
  const value = p[key];
  if (typeof value === "string" && value.trim()) return value;
  if (typeof p.nameEn === "string" && p.nameEn.trim()) return p.nameEn;
  return fallback;
}

function pickDesc(p: PublicProduct | null, lang: string, fallback: string): string {
  if (!p) return fallback;
  const key = `desc${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof PublicProduct;
  const value = p[key];
  if (typeof value === "string" && value.trim()) return value;
  if (typeof p.descEn === "string" && p.descEn.trim()) return p.descEn;
  return fallback;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lang = await pickLangFromHeader();
  const product = await fetchProduct(slug);
  const fallbackName = titleCase(slug);
  const name = pickName(product, lang, fallbackName);
  const desc = pickDesc(
    product,
    lang,
    `Explore ${name} — custom K-Beauty OEM/ODM formulation by Dostac, Korea's KGMP / ISO 22716 / FDA certified cosmetics manufacturer.`,
  );
  const imageUrl = product?.imageUrl ?? "/images/dostac/hero-products.webp";

  return {
    title: name,
    description: desc,
    alternates: {
      canonical: `/products/${slug}`,
      languages: {
        "x-default": `${SITE_URL}/products/${slug}`,
        en: `${SITE_URL}/products/${slug}`,
        ko: `${SITE_URL}/products/${slug}`,
        ja: `${SITE_URL}/products/${slug}`,
        zh: `${SITE_URL}/products/${slug}`,
        vi: `${SITE_URL}/products/${slug}`,
      },
    },
    openGraph: {
      title: `${name} | Dostac OEM/ODM`,
      description: desc,
      url: `/products/${slug}`,
      images: [imageUrl],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Dostac OEM/ODM`,
      description: desc,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lang = await pickLangFromHeader();
  const product = await fetchProduct(slug);
  const fallbackName = titleCase(slug);
  const name = pickName(product, lang, fallbackName);
  const description = pickDesc(
    product,
    lang,
    `${name} — custom K-Beauty OEM/ODM by Dostac. KGMP / ISO 22716 / FDA certified Korean cosmetics manufacturing for global brands.`,
  );
  const productImage = product?.imageUrl
    ? (product.imageUrl.startsWith("http") ? product.imageUrl : `${SITE_URL}${product.imageUrl}`)
    : `${SITE_URL}/images/dostac/hero-products.webp`;

  /* JSON-LD Product schema — enables Google product rich results */
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/products/${slug}#product`,
    name,
    description,
    image: [productImage],
    sku: slug,
    url: `${SITE_URL}/products/${slug}`,
    category: product?.category ?? "K-Beauty OEM/ODM Cosmetics",
    ...(product?.material ? { material: product.material } : {}),
    brand: { "@type": "Brand", name: "Dostac" },
    manufacturer: { "@type": "Organization", "@id": ORG_ID, name: "Dostac Co., Ltd." },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${slug}`,
      priceCurrency: "USD",
      price: "0",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        valueAddedTaxIncluded: false,
        eligibleQuantity: {
          "@type": "QuantitativeValue",
          minValue: 500,
          unitCode: "EA",
        },
      },
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      businessFunction: "https://purl.org/goodrelations/v1#Sell",
      eligibleCustomerType: "https://schema.org/Enterprise",
      seller: { "@id": ORG_ID },
      areaServed: "Worldwide",
    },
  };

  /* BreadcrumbList — secondary rich result enabling category navigation */
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${SITE_URL}/products`,
      },
      ...(product?.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category,
              item: `${SITE_URL}/products?category=${encodeURIComponent(product.category)}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name,
              item: `${SITE_URL}/products/${slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name,
              item: `${SITE_URL}/products/${slug}`,
            },
          ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductDetailClient />
    </>
  );
}
