import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = titleCase(slug);
  return {
    title: name,
    description: `Explore ${name} — custom K-beauty OEM/ODM formulation by Dostac, Korea's ISO-certified cosmetics manufacturer.`,
    openGraph: {
      title: `${name} | Dostac OEM/ODM`,
      description: `Private label ${name} manufactured to your spec. Low MOQ, fast sampling, global delivery.`,
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
