import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dostac.com";

// Static routes with their priorities and change frequencies
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  {
    url: `${BASE_URL}/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/production`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/products`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/insights`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.7,
  },
];

async function fetchDynamicRoutes(): Promise<MetadataRoute.Sitemap> {
  const internalApiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:4000";

  try {
    const [productsRes, noticesRes] = await Promise.allSettled([
      fetch(`${internalApiUrl}/api/public/product-translations?lang=en&limit=200`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${internalApiUrl}/api/public/notices?limit=200`, {
        next: { revalidate: 3600 },
      }),
    ]);

    const productRoutes: MetadataRoute.Sitemap = [];
    if (productsRes.status === "fulfilled" && productsRes.value.ok) {
      const data = await productsRes.value.json();
      const items: { slug?: string; updatedAt?: string }[] = data?.data ?? data ?? [];
      for (const item of items) {
        if (item.slug) {
          productRoutes.push({
            url: `${BASE_URL}/products/${item.slug}`,
            lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      }
    }

    const noticeRoutes: MetadataRoute.Sitemap = [];
    if (noticesRes.status === "fulfilled" && noticesRes.value.ok) {
      const data = await noticesRes.value.json();
      const items: { slug?: string; updatedAt?: string }[] = data?.data ?? data ?? [];
      for (const item of items) {
        if (item.slug) {
          noticeRoutes.push({
            url: `${BASE_URL}/insights/${item.slug}`,
            lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }

    return [...productRoutes, ...noticeRoutes];
  } catch {
    // If API is unreachable at build time, return empty (static routes still included)
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamic = await fetchDynamicRoutes();
  return [...STATIC_ROUTES, ...dynamic];
}
