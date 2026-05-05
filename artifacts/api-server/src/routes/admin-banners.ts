import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, bannersTable } from "@workspace/db";
import {
  AdminCreateBannerBody,
  AdminUpdateBannerBody,
  AdminUpdateBannerParams,
  AdminGetBannerParams,
  AdminDeleteBannerParams,
  AdminReorderBannersBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

function serialize(b: typeof bannersTable.$inferSelect) {
  return {
    id: b.id,
    imageUrl: b.imageUrl,
    linkUrl: b.linkUrl,
    sortOrder: b.sortOrder,
    active: b.active,
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
  };
}

router.use("/admin/banners", requireAdmin);
router.use("/admin/banners/:id", requireAdmin);
router.use("/admin/banners/reorder", requireAdmin);

router.get("/admin/banners", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(bannersTable)
    .orderBy(asc(bannersTable.sortOrder), asc(bannersTable.id));
  res.json(rows.map(serialize));
});

router.post("/admin/banners", async (req, res): Promise<void> => {
  const parsed = AdminCreateBannerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { translations, sortOrder, linkUrl, imageUrl, active } = parsed.data;
  const [row] = await db
    .insert(bannersTable)
    .values({
      imageUrl,
      linkUrl: linkUrl ?? null,
      active,
      sortOrder: sortOrder ?? 0,
      titleKo: translations.titleKo,
      titleEn: translations.titleEn,
      titleJa: translations.titleJa,
      titleZh: translations.titleZh,
      titleVi: translations.titleVi,
      descriptionKo: translations.descriptionKo,
      descriptionEn: translations.descriptionEn,
      descriptionJa: translations.descriptionJa,
      descriptionZh: translations.descriptionZh,
      descriptionVi: translations.descriptionVi,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create banner" });
    return;
  }
  res.status(201).json(serialize(row));
});

router.post("/admin/banners/reorder", async (req, res): Promise<void> => {
  const parsed = AdminReorderBannersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { order } = parsed.data;

  const uniqueOrder = new Set(order);
  if (uniqueOrder.size !== order.length) {
    res.status(400).json({ error: "Order must contain unique banner IDs" });
    return;
  }

  const allRows = await db.select({ id: bannersTable.id }).from(bannersTable);
  const allIds = new Set(allRows.map((r) => r.id));

  if (
    order.length !== allIds.size ||
    !order.every((id) => allIds.has(id))
  ) {
    res
      .status(400)
      .json({ error: "Order must be a complete permutation of existing banner IDs" });
    return;
  }

  await db.transaction(async (tx) => {
    for (let idx = 0; idx < order.length; idx++) {
      await tx
        .update(bannersTable)
        .set({ sortOrder: idx })
        .where(eq(bannersTable.id, order[idx]!));
    }
  });
  res.json({ ok: true });
});

router.get("/admin/banners/:id", async (req, res): Promise<void> => {
  const params = AdminGetBannerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(bannersTable)
    .where(eq(bannersTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Banner not found" });
    return;
  }
  res.json(serialize(row));
});

router.put("/admin/banners/:id", async (req, res): Promise<void> => {
  const params = AdminUpdateBannerParams.safeParse(req.params);
  const body = AdminUpdateBannerBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res
      .status(400)
      .json({ error: params.success ? body.error!.message : params.error.message });
    return;
  }
  const { translations, sortOrder, linkUrl, imageUrl, active } = body.data;
  const [row] = await db
    .update(bannersTable)
    .set({
      imageUrl,
      linkUrl: linkUrl ?? null,
      active,
      sortOrder: sortOrder ?? 0,
      titleKo: translations.titleKo,
      titleEn: translations.titleEn,
      titleJa: translations.titleJa,
      titleZh: translations.titleZh,
      titleVi: translations.titleVi,
      descriptionKo: translations.descriptionKo,
      descriptionEn: translations.descriptionEn,
      descriptionJa: translations.descriptionJa,
      descriptionZh: translations.descriptionZh,
      descriptionVi: translations.descriptionVi,
    })
    .where(eq(bannersTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Banner not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/admin/banners/:id", async (req, res): Promise<void> => {
  const params = AdminDeleteBannerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(bannersTable).where(eq(bannersTable.id, params.data.id));
  res.json({ ok: true });
});

export default router;
