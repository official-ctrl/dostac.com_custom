import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, categoryTranslationsTable } from "@workspace/db";
import { AdminSaveCategoryTranslationsBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.use("/admin/category-translations", requireAdmin);

router.get("/admin/category-translations", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(categoryTranslationsTable)
    .orderBy(asc(categoryTranslationsTable.slug));
  res.json(rows);
});

router.put("/admin/category-translations", async (req, res): Promise<void> => {
  const parsed = AdminSaveCategoryTranslationsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const rows = parsed.data;
  await db.transaction(async (tx) => {
    await tx.delete(categoryTranslationsTable);
    if (rows.length > 0) {
      await tx.insert(categoryTranslationsTable).values(rows);
    }
  });
  const saved = await db
    .select()
    .from(categoryTranslationsTable)
    .orderBy(asc(categoryTranslationsTable.slug));
  res.json(saved);
});

export default router;
