import { Router, type IRouter, type Request, type Response } from "express";
import { db, productsTable, noticesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const BASE_URL = "https://dostac.com";

const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/about", priority: "0.8", changefreq: "monthly" },
  { loc: "/production", priority: "0.8", changefreq: "monthly" },
  { loc: "/products", priority: "0.9", changefreq: "weekly" },
  { loc: "/insights", priority: "0.8", changefreq: "daily" },
  { loc: "/contact", priority: "0.7", changefreq: "monthly" },
];

router.get("/sitemap.xml", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [products, notices] = await Promise.all([
      db.select({ slug: productsTable.slug, updatedAt: productsTable.updatedAt })
        .from(productsTable)
        .where(eq(productsTable.published, true)),
      db.select({ slug: noticesTable.slug, updatedAt: noticesTable.updatedAt })
        .from(noticesTable)
        .where(eq(noticesTable.published, true)),
    ]);

    const now = new Date().toISOString().split("T")[0];

    const urls = [
      ...STATIC_PAGES.map(({ loc, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`),
      ...products.map((p) => `
  <url>
    <loc>${BASE_URL}/products/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`),
      ...notices.map((n) => `
  <url>
    <loc>${BASE_URL}/insights/${n.slug}</loc>
    <lastmod>${n.updatedAt.toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
    ].join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate sitemap" });
  }
});

export default router;
