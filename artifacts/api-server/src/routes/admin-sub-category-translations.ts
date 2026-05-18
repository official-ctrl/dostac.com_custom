import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, subCategoryTranslationsTable } from "@workspace/db";
import { AdminSaveSubCategoryTranslationsBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.use("/admin/sub-category-translations", requireAdmin);

router.get("/admin/sub-category-translations", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(subCategoryTranslationsTable)
    .orderBy(asc(subCategoryTranslationsTable.slug));
  res.json(rows);
});

router.put("/admin/sub-category-translations", async (req, res): Promise<void> => {
  const parsed = AdminSaveSubCategoryTranslationsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const rows = parsed.data;
  await db.transaction(async (tx) => {
    await tx.delete(subCategoryTranslationsTable);
    if (rows.length > 0) {
      await tx.insert(subCategoryTranslationsTable).values(rows);
    }
  });
  const saved = await db
    .select()
    .from(subCategoryTranslationsTable)
    .orderBy(asc(subCategoryTranslationsTable.slug));
  res.json(saved);
});

export default router;
