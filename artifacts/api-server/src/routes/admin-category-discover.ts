import { Router, type IRouter } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.use("/admin/category-discover", requireAdmin);

router.get("/admin/category-discover", async (_req, res): Promise<void> => {
  const catRows = await db
    .selectDistinct({ category: productsTable.category })
    .from(productsTable)
    .where(and(eq(productsTable.published, true), sql`${productsTable.category} != ''`))
    .orderBy(productsTable.category);

  const subCatRows = await db
    .selectDistinct({ subCategory: productsTable.subCategory })
    .from(productsTable)
    .where(and(eq(productsTable.published, true), sql`${productsTable.subCategory} != ''`))
    .orderBy(productsTable.subCategory);

  res.json({
    categories: catRows.map((r) => r.category),
    subCategories: subCatRows.map((r) => r.subCategory),
  });
});

export default router;
