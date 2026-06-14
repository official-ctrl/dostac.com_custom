const WP_BASE = "https://blog.dostac.com/wp-json/wp/v2";
// dev: no cache (always fresh) / production: 1 hour ISR
const REVALIDATE = process.env.NODE_ENV === "development" ? 0 : 3600;

export type WPPost = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  categories: number[];
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      media_details?: {
        sizes?: {
          medium_large?: { source_url: string };
          medium?: { source_url: string };
          large?: { source_url: string };
        };
      };
    }>;
  };
};

export type WPCategory = {
  id: number;
  name: string;
  slug: string;
};

/** WordPress HTML에 포함된 마크다운 잔재를 HTML로 변환 */
export function transformWpContent(html: string): string {
  return html
    .replace(/<p>\s*#{4}\s*(.+?)<\/p>/gi, "<h4>$1</h4>")
    .replace(/<p>\s*#{3}\s*(.+?)<\/p>/gi, "<h3>$1</h3>")
    .replace(/<p>\s*#{2}\s*(.+?)<\/p>/gi, "<h2>$1</h2>")
    .replace(/<p>\s*#{1}\s*(.+?)<\/p>/gi, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

/** HTML 태그와 엔티티를 제거해 plain text 반환 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 날짜 포맷 (예: June 7, 2026) */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getPosts(perPage = 20): Promise<WPPost[]> {
  try {
    const res = await fetch(
      `${WP_BASE}/posts?per_page=${perPage}&_embed=wp:featuredmedia&orderby=date&order=desc`,
      { next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const res = await fetch(
      `${WP_BASE}/posts?slug=${encodeURIComponent(slug)}&_fields=id,slug,date,title,content,excerpt,categories,featured_media`,
      { next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) return null;
    const posts: WPPost[] = await res.json();
    return posts[0] ?? null;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<WPCategory[]> {
  try {
    const res = await fetch(
      `${WP_BASE}/categories?_fields=id,name,slug`,
      { next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getAllSlugs(): Promise<string[]> {
  try {
    const res = await fetch(
      `${WP_BASE}/posts?per_page=100&_fields=slug`,
      { next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) return [];
    const posts: { slug: string }[] = await res.json();
    return posts.map((p) => p.slug);
  } catch {
    return [];
  }
}
