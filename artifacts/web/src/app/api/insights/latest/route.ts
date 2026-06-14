import { NextResponse } from "next/server";

/* Edge runtime — runs at every Cloudflare PoP, very low latency */
export const runtime = "edge";
/* Revalidate cache every 1 hour (3600s). Stale-while-revalidate at edge. */
export const revalidate = 3600;

const WP_BASE = "https://blog.dostac.com/wp-json/wp/v2";

/* Minimal post + category shape — matches what the UI needs */
interface WPPost {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  categories: number[];
  featured_media?: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      media_details?: {
        sizes?: {
          medium_large?: { source_url: string };
          medium?: { source_url: string };
          large?: { source_url: string };
          full?: { source_url: string };
        };
      };
      source_url?: string;
    }>;
  };
}

interface WPCategory {
  id: number;
  name: string;
  slug: string;
}

interface EnrichedCard {
  id: number;
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  catSlug: string | undefined;
  catName: string | undefined;
  readMin: number;
  imageUrl: string | undefined;
}

/* Tiny HTML-tag stripper — runs server-side so client receives plain text */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\"")
    .replace(/&#8221;/g, "\"")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* Fetch posts + categories in parallel, enrich, and return a small JSON */
async function fetchEnriched(limit: number): Promise<EnrichedCard[]> {
  const [postsRes, catsRes] = await Promise.all([
    fetch(
      `${WP_BASE}/posts?per_page=${limit}&_embed=wp:featuredmedia&orderby=date&order=desc`,
      { next: { revalidate: 3600 } },
    ),
    fetch(`${WP_BASE}/categories?_fields=id,name,slug&per_page=50`, {
      next: { revalidate: 3600 },
    }),
  ]);

  if (!postsRes.ok || !catsRes.ok) return [];

  const [posts, categories] = await Promise.all([
    postsRes.json() as Promise<WPPost[]>,
    catsRes.json() as Promise<WPCategory[]>,
  ]);

  const catMap = new Map<number, WPCategory>(categories.map((c) => [c.id, c]));

  return posts.map((p) => {
    /* Prefer non-uncategorized; fall back to first category if only uncategorized */
    const categorized = p.categories
      .map((id) => catMap.get(id))
      .find((c) => c && c.slug !== "uncategorized");
    const fallback = p.categories
      .map((id) => catMap.get(id))
      .find((c) => Boolean(c));
    const cat = categorized ?? fallback;

    const excerptText = stripHtml(p.excerpt.rendered);
    const words = excerptText.split(/\s+/).filter(Boolean).length;

    const sizes = p._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes;
    const imageUrl =
      sizes?.medium_large?.source_url ??
      sizes?.large?.source_url ??
      sizes?.medium?.source_url ??
      p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

    return {
      id: p.id,
      slug: p.slug,
      date: p.date,
      title: p.title.rendered,
      excerpt: excerptText.slice(0, 140),
      catSlug: cat?.slug,
      catName: cat?.name,
      readMin: Math.max(1, Math.ceil(words / 200)),
      imageUrl,
    };
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const limit = Math.max(1, Math.min(20, Number(limitParam) || 3));

  try {
    const cards = await fetchEnriched(limit);
    return NextResponse.json(
      { cards, fetchedAt: new Date().toISOString() },
      {
        headers: {
          /* Browser cache: 60s · CDN cache: 1h · stale-while-revalidate 24h */
          "Cache-Control":
            "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    /* On WP outage, return empty list with short cache so we retry sooner */
    return NextResponse.json(
      { cards: [], error: err instanceof Error ? err.message : "fetch failed" },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60",
        },
      },
    );
  }
}
