import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db, bannersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/public/banners", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(bannersTable)
    .where(eq(bannersTable.active, true))
    .orderBy(asc(bannersTable.sortOrder), asc(bannersTable.id));

  res.json(
    rows.map((b) => ({
      id: b.id,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl,
      sortOrder: b.sortOrder,
      translations: {
        titleKo: b.titleKo,
        titleEn: b.titleEn,
        titleJa: b.titleJa,
        titleZh: b.titleZh,
        titleVi: b.titleVi,
        descriptionKo: b.descriptionKo,
        descriptionEn: b.descriptionEn,
        descriptionJa: b.descriptionJa,
        descriptionZh: b.descriptionZh,
        descriptionVi: b.descriptionVi,
      },
    })),
  );
});

export default router;
