import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, categoryTranslationsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/public/category-translations", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(categoryTranslationsTable)
    .orderBy(asc(categoryTranslationsTable.slug));
  res.json(rows);
});

export default router;
