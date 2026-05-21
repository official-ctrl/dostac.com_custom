import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, noticesTable, noticeTranslationsTable } from "@workspace/db";
import {
  ListPublicNoticesQueryParams,
  GetPublicNoticeParams,
  GetPublicNoticeQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function pickTranslation<T extends { lang: string }>(
  rows: T[],
  preferred: string,
): T | undefined {
  return (
    rows.find((r) => r.lang === preferred) ??
    rows.find((r) => r.lang === "ko") ??
    rows[0]
  );
}

function pickField(
  translations: Array<{ lang: string; title: string; excerpt: string; body: string }>,
  preferred: string,
  field: "title" | "excerpt" | "body",
): string {
  const preferred_row = translations.find((r) => r.lang === preferred);
  if (preferred_row?.[field]) return preferred_row[field];
  const ko_row = translations.find((r) => r.lang === "ko");
  if (ko_row?.[field]) return ko_row[field];
  return translations[0]?.[field] ?? "";
}

router.get("/public/notices", async (req, res): Promise<void> => {
  const q = ListPublicNoticesQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const { lang, category, search } = q.data;

  const conds = [eq(noticesTable.published, true)];
  if (category) conds.push(eq(noticesTable.category, category));

  const notices = await db
    .select()
    .from(noticesTable)
    .where(and(...conds))
    .orderBy(desc(noticesTable.publishedAt));

  if (notices.length === 0) {
    res.json([]);
    return;
  }

  const translations = await db.select().from(noticeTranslationsTable);
  const grouped = new Map<number, typeof translations>();
  for (const t of translations) {
    const list = grouped.get(t.noticeId) ?? [];
    list.push(t);
    grouped.set(t.noticeId, list);
  }

  let result = notices.map((n) => {
    const rows = grouped.get(n.id) ?? [];
    return {
      id: n.id,
      slug: n.slug,
      category: n.category,
      region: n.region,
      publishedAt: n.publishedAt.toISOString(),
      thumbnailUrl: n.thumbnailUrl,
      title: pickField(rows, lang, "title") || n.slug,
      excerpt: pickField(rows, lang, "excerpt"),
      body: pickField(rows, lang, "body"),
    };
  });

  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.excerpt.toLowerCase().includes(s) ||
        r.region.toLowerCase().includes(s),
    );
  }

  res.json(result);
});

router.get("/public/notices/:slug", async (req, res): Promise<void> => {
  const params = GetPublicNoticeParams.safeParse(req.params);
  const q = GetPublicNoticeQueryParams.safeParse(req.query);
  if (!params.success || !q.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [notice] = await db
    .select()
    .from(noticesTable)
    .where(eq(noticesTable.slug, params.data.slug));
  if (!notice || !notice.published) {
    res.status(404).json({ error: "Notice not found" });
    return;
  }
  const translations = await db
    .select()
    .from(noticeTranslationsTable)
    .where(eq(noticeTranslationsTable.noticeId, notice.id));
  res.json({
    id: notice.id,
    slug: notice.slug,
    category: notice.category,
    region: notice.region,
    publishedAt: notice.publishedAt.toISOString(),
    thumbnailUrl: notice.thumbnailUrl,
    title: pickField(translations, q.data.lang, "title") || notice.slug,
    excerpt: pickField(translations, q.data.lang, "excerpt"),
    body: pickField(translations, q.data.lang, "body"),
  });
});

export default router;
