import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, subCategoryTranslationsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/public/sub-category-translations", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(subCategoryTranslationsTable)
    .orderBy(asc(subCategoryTranslationsTable.slug));
  res.json(rows);
});

export default router;
