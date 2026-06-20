// Server-safe utility — no "use client" directive
import type { WPPost, WPCategory } from "@/lib/wordpress";
import { stripHtml } from "@/lib/wordpress";

export const TYPE_MAP: Record<string, { label: string; color: string }> = {
  "alibaba":      { label: "B2B Guide",        color: "#8B5E3C" },
  "b2b-sourcing": { label: "Sourcing Guide",    color: "#8B5E3C" },
  "k-trends":     { label: "Trend Report",      color: "#6B7F3E" },
  "oem-odm":      { label: "Manufacturing",     color: "#3E5E7F" },
  "regulation":   { label: "Regulation",        color: "#7F3E5E" },
  "formulation":  { label: "Formulation Guide", color: "#5E3E7F" },
};

export interface PostWithMeta extends Omit<WPPost, "excerpt"> {
  excerpt: { rendered: string };
  catName: string | undefined;
  catSlug: string | undefined;
  type: { label: string; color: string } | undefined;
  readMin: number;
  excerptText: string;
  imageUrl: string | undefined;
}

function readingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function enrichPosts(
  posts: WPPost[],
  catMap: Map<number, WPCategory>
): PostWithMeta[] {
  return posts.map((p) => {
    const cat = p.categories
      .map((id) => catMap.get(id))
      .find((c) => c && c.slug !== "uncategorized");

    const excerptText = stripHtml(p.excerpt.rendered).slice(0, 160);

    const sizes = p._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes;
    const imageUrl =
      sizes?.medium_large?.source_url ??
      sizes?.large?.source_url ??
      sizes?.medium?.source_url ??
      p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

    return {
      ...p,
      catName: cat?.name,
      catSlug: cat?.slug,
      type: cat ? TYPE_MAP[cat.slug] : undefined,
      readMin: readingTime(p.excerpt.rendered),
      excerptText,
      imageUrl,
    };
  });
}
