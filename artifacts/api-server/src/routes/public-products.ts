import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db, productsTable, productTranslationsTable } from "@workspace/db";
import {
  ListPublicProductsQueryParams,
  GetPublicProductParams,
  GetPublicProductQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function pickTranslation<T extends { lang: string }>(
  rows: T[],
  preferred: string,
): T | undefined {
  const exact = rows.find((r) => r.lang === preferred);
  if (exact) return exact;
  const ko = rows.find((r) => r.lang === "ko");
  return ko ?? rows[0];
}

function featuresToList(raw: string): string[] {
  return raw
    .split(/\r\n|\r|\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

router.get("/public/products", async (req, res): Promise<void> => {
  const q = ListPublicProductsQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const { lang, category, subCategory } = q.data;

  const conditions = [eq(productsTable.published, true)];
  if (category) conditions.push(eq(productsTable.category, category));
  if (subCategory) conditions.push(eq(productsTable.subCategory, subCategory));
  const where = conditions.length === 1 ? conditions[0] : and(...conditions);

  const products = await db
    .select()
    .from(productsTable)
    .where(where)
    .orderBy(asc(productsTable.sortOrder), asc(productsTable.id));

  if (products.length === 0) {
    res.json([]);
    return;
  }

  const translations = await db.select().from(productTranslationsTable);
  const grouped = new Map<number, typeof translations>();
  for (const t of translations) {
    const list = grouped.get(t.productId) ?? [];
    list.push(t);
    grouped.set(t.productId, list);
  }

  const result = products.map((p) => {
    const t = pickTranslation(grouped.get(p.id) ?? [], lang);
    return {
      id: p.id,
      slug: p.slug,
      category: p.category,
      subCategory: p.subCategory,
      sortOrder: p.sortOrder,
      imageUrl: p.imageUrl,
      name: t?.name ?? p.slug,
      headline: t?.headline ?? "",
      valueProp: t?.valueProp ?? "",
      body: t?.body ?? "",
      features: featuresToList(t?.features ?? ""),
      material: t?.material ?? "",
      certs: p.certs ?? [],
    };
  });

  res.json(result);
});

router.get("/public/products/:slug", async (req, res): Promise<void> => {
  const params = GetPublicProductParams.safeParse(req.params);
  const q = GetPublicProductQueryParams.safeParse(req.query);
  if (!params.success || !q.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, params.data.slug));
  if (!product || !product.published) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const translations = await db
    .select()
    .from(productTranslationsTable)
    .where(eq(productTranslationsTable.productId, product.id));
  const t = pickTranslation(translations, q.data.lang);
  res.json({
    id: product.id,
    slug: product.slug,
    category: product.category,
    subCategory: product.subCategory,
    sortOrder: product.sortOrder,
    imageUrl: product.imageUrl,
    name: t?.name ?? product.slug,
    headline: t?.headline ?? "",
    valueProp: t?.valueProp ?? "",
    body: t?.body ?? "",
    features: featuresToList(t?.features ?? ""),
    material: t?.material ?? "",
    certs: product.certs ?? [],
  });
});

export default router;
