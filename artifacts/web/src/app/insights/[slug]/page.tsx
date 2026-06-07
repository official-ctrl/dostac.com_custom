import type { Metadata } from "next";
import InsightDetailClient from "./InsightDetailClient";

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
    description: `${name} — K-beauty industry insights and news from Dostac, Korea's leading OEM/ODM cosmetics manufacturer.`,
    openGraph: {
      title: `${name} | Dostac Insights`,
      description: `${name} — Read the latest K-beauty trends, OEM/ODM news, and manufacturing updates from Dostac.`,
    },
  };
}

export default function InsightDetailPage() {
  return <InsightDetailClient />;
}
