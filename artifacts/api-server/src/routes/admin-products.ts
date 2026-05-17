import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, productsTable, productTranslationsTable } from "@workspace/db";
import {
  AdminCreateProductBody,
  AdminUpdateProductBody,
  AdminGetProductParams,
  AdminUpdateProductParams,
  AdminDeleteProductParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

async function loadProductWithTranslations(id: number) {
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id));
  if (!product) return null;
  const translations = await db
    .select()
    .from(productTranslationsTable)
    .where(eq(productTranslationsTable.productId, id));
  return {
    id: product.id,
    slug: product.slug,
    category: product.category,
    subCategory: product.subCategory,
    sortOrder: product.sortOrder,
    imageUrl: product.imageUrl,
    published: product.published,
    certs: product.certs ?? [],
    translations: translations.map((t) => ({
      lang: t.lang,
      name: t.name,
      headline: t.headline,
      valueProp: t.valueProp,
      body: t.body,
      features: t.features,
      material: t.material,
    })),
  };
}

router.use("/admin/products", requireAdmin);
router.use("/admin/products/:id", requireAdmin);

router.get("/admin/products", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.sortOrder), asc(productsTable.id));
  const allT = await db.select().from(productTranslationsTable);
  const byProduct = new Map<number, typeof allT>();
  for (const t of allT) {
    const arr = byProduct.get(t.productId) ?? [];
    arr.push(t);
    byProduct.set(t.productId, arr);
  }
  res.json(
    products.map((p) => ({
      id: p.id,
      slug: p.slug,
      category: p.category,
      subCategory: p.subCategory,
      sortOrder: p.sortOrder,
      imageUrl: p.imageUrl,
      published: p.published,
      certs: p.certs ?? [],
      translations: (byProduct.get(p.id) ?? []).map((t) => ({
        lang: t.lang,
        name: t.name,
        headline: t.headline,
        valueProp: t.valueProp,
        body: t.body,
        features: t.features,
        material: t.material,
      })),
    })),
  );
});

router.post("/admin/products", async (req, res): Promise<void> => {
  const parsed = AdminCreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { translations, ...productData } = parsed.data;
  const [product] = await db
    .insert(productsTable)
    .values(productData)
    .returning();
  if (!product) {
    res.status(500).json({ error: "Failed to create product" });
    return;
  }
  if (translations.length > 0) {
    await db
      .insert(productTranslationsTable)
      .values(translations.map((t) => ({ ...t, productId: product.id })));
  }
  const result = await loadProductWithTranslations(product.id);
  res.status(201).json(result);
});

router.get("/admin/products/:id", async (req, res): Promise<void> => {
  const params = AdminGetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const result = await loadProductWithTranslations(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(result);
});

router.put("/admin/products/:id", async (req, res): Promise<void> => {
  const params = AdminUpdateProductParams.safeParse(req.params);
  const parsed = AdminUpdateProductBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res
      .status(400)
      .json({ error: params.success ? parsed.error!.message : params.error.message });
    return;
  }
  const id = params.data.id;
  const { translations, ...productData } = parsed.data;
  const [product] = await db
    .update(productsTable)
    .set(productData)
    .where(eq(productsTable.id, id))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  await db
    .delete(productTranslationsTable)
    .where(eq(productTranslationsTable.productId, id));
  if (translations.length > 0) {
    await db
      .insert(productTranslationsTable)
      .values(translations.map((t) => ({ ...t, productId: id })));
  }
  const result = await loadProductWithTranslations(id);
  res.json(result);
});

router.delete("/admin/products/:id", async (req, res): Promise<void> => {
  const params = AdminDeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db
    .delete(productTranslationsTable)
    .where(eq(productTranslationsTable.productId, params.data.id));
  const deleted = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
