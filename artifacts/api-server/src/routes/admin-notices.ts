import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, noticesTable, noticeTranslationsTable } from "@workspace/db";
import {
  AdminCreateNoticeBody,
  AdminUpdateNoticeBody,
  AdminGetNoticeParams,
  AdminUpdateNoticeParams,
  AdminDeleteNoticeParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

async function loadNoticeWithTranslations(id: number) {
  const [notice] = await db.select().from(noticesTable).where(eq(noticesTable.id, id));
  if (!notice) return null;
  const translations = await db
    .select()
    .from(noticeTranslationsTable)
    .where(eq(noticeTranslationsTable.noticeId, id));
  return {
    id: notice.id,
    slug: notice.slug,
    category: notice.category,
    region: notice.region,
    thumbnailUrl: notice.thumbnailUrl,
    published: notice.published,
    publishedAt: notice.publishedAt.toISOString(),
    translations: translations.map((t) => ({
      lang: t.lang,
      title: t.title,
      excerpt: t.excerpt,
      body: t.body,
    })),
  };
}

router.use("/admin/notices", requireAdmin);
router.use("/admin/notices/:id", requireAdmin);

router.get("/admin/notices", async (_req, res): Promise<void> => {
  const notices = await db
    .select()
    .from(noticesTable)
    .orderBy(desc(noticesTable.publishedAt));
  const allT = await db.select().from(noticeTranslationsTable);
  const byNotice = new Map<number, typeof allT>();
  for (const t of allT) {
    const arr = byNotice.get(t.noticeId) ?? [];
    arr.push(t);
    byNotice.set(t.noticeId, arr);
  }
  res.json(
    notices.map((n) => ({
      id: n.id,
      slug: n.slug,
      category: n.category,
      region: n.region,
      thumbnailUrl: n.thumbnailUrl,
      published: n.published,
      publishedAt: n.publishedAt.toISOString(),
      translations: (byNotice.get(n.id) ?? []).map((t) => ({
        lang: t.lang,
        title: t.title,
        excerpt: t.excerpt,
        body: t.body,
      })),
    })),
  );
});

router.post("/admin/notices", async (req, res): Promise<void> => {
  const parsed = AdminCreateNoticeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { translations, publishedAt, ...rest } = parsed.data;
  const [notice] = await db
    .insert(noticesTable)
    .values({ ...rest, publishedAt: new Date(publishedAt) })
    .returning();
  if (!notice) {
    res.status(500).json({ error: "Failed to create notice" });
    return;
  }
  if (translations.length > 0) {
    await db
      .insert(noticeTranslationsTable)
      .values(translations.map((t) => ({ ...t, noticeId: notice.id })));
  }
  res.status(201).json(await loadNoticeWithTranslations(notice.id));
});

router.get("/admin/notices/:id", async (req, res): Promise<void> => {
  const params = AdminGetNoticeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const result = await loadNoticeWithTranslations(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Notice not found" });
    return;
  }
  res.json(result);
});

router.put("/admin/notices/:id", async (req, res): Promise<void> => {
  const params = AdminUpdateNoticeParams.safeParse(req.params);
  const parsed = AdminUpdateNoticeBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res
      .status(400)
      .json({ error: params.success ? parsed.error!.message : params.error.message });
    return;
  }
  const id = params.data.id;
  const { translations, publishedAt, ...rest } = parsed.data;
  const [notice] = await db
    .update(noticesTable)
    .set({ ...rest, publishedAt: new Date(publishedAt) })
    .where(eq(noticesTable.id, id))
    .returning();
  if (!notice) {
    res.status(404).json({ error: "Notice not found" });
    return;
  }
  await db
    .delete(noticeTranslationsTable)
    .where(eq(noticeTranslationsTable.noticeId, id));
  if (translations.length > 0) {
    await db
      .insert(noticeTranslationsTable)
      .values(translations.map((t) => ({ ...t, noticeId: id })));
  }
  res.json(await loadNoticeWithTranslations(id));
});

router.delete("/admin/notices/:id", async (req, res): Promise<void> => {
  const params = AdminDeleteNoticeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db
    .delete(noticeTranslationsTable)
    .where(eq(noticeTranslationsTable.noticeId, params.data.id));
  const deleted = await db
    .delete(noticesTable)
    .where(eq(noticesTable.id, params.data.id))
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Notice not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
