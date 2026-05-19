import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, productsTable, productTranslationsTable } from "@workspace/db";
import {
  AdminCreateProductBody,
  AdminUpdateProductBody,
  AdminGetProductParams,
  AdminUpdateProductParams,
  AdminDeleteProductParams,
  AdminUpsertProductsBySlugBody,
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

router.put("/admin/products/upsert-by-slug", async (req, res): Promise<void> => {
  const parsed = AdminUpsertProductsBySlugBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const results: Array<{ action: "created" | "updated"; product: unknown }> = [];

  for (const item of parsed.data) {
    const { translations, ...productData } = item;

    const [existing] = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.slug, productData.slug));

    let productId: number;
    let action: "created" | "updated";

    if (existing) {
      // Load existing translations before updating so we can merge fields
      const existingTranslations = await db
        .select()
        .from(productTranslationsTable)
        .where(eq(productTranslationsTable.productId, existing.id));

      const existingByLang = new Map(existingTranslations.map((t) => [t.lang, t]));

      // Merge incoming with existing: incoming name/features/material overwrite;
      // existing headline/valueProp/body are preserved unless the incoming value is non-empty.
      const mergedTranslations = translations.map((incoming) => {
        const ex = existingByLang.get(incoming.lang);
        if (!ex) return incoming;
        return {
          lang: incoming.lang,
          name: incoming.name || ex.name,
          features: incoming.features || ex.features,
          material: incoming.material || ex.material,
          headline: incoming.headline || ex.headline,
          valueProp: incoming.valueProp || ex.valueProp,
          body: incoming.body || ex.body,
        };
      });

      // Keep any languages that exist in DB but were not in the incoming payload
      for (const [lang, ex] of existingByLang) {
        if (!mergedTranslations.some((t) => t.lang === lang)) {
          mergedTranslations.push({
            lang: ex.lang as "ko" | "en" | "ja" | "zh" | "vi",
            name: ex.name,
            headline: ex.headline,
            valueProp: ex.valueProp,
            body: ex.body,
            features: ex.features,
            material: ex.material,
          });
        }
      }

      const [updated] = await db
        .update(productsTable)
        .set(productData)
        .where(eq(productsTable.id, existing.id))
        .returning({ id: productsTable.id });
      if (!updated) {
        res.status(500).json({ error: `Failed to update product: ${productData.slug}` });
        return;
      }
      productId = updated.id;
      action = "updated";

      await db
        .delete(productTranslationsTable)
        .where(eq(productTranslationsTable.productId, productId));

      if (mergedTranslations.length > 0) {
        await db
          .insert(productTranslationsTable)
          .values(mergedTranslations.map((t) => ({ ...t, productId })));
      }
    } else {
      const [created] = await db
        .insert(productsTable)
        .values(productData)
        .returning({ id: productsTable.id });
      if (!created) {
        res.status(500).json({ error: `Failed to create product: ${productData.slug}` });
        return;
      }
      productId = created.id;
      action = "created";

      if (translations.length > 0) {
        await db
          .insert(productTranslationsTable)
          .values(translations.map((t) => ({ ...t, productId })));
      }
    }

    const product = await loadProductWithTranslations(productId);
    results.push({ action, product });
  }

  res.json(results);
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
