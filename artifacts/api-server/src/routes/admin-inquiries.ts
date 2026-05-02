import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, contactInquiriesTable } from "@workspace/db";
import {
  AdminListInquiriesQueryParams,
  AdminGetInquiryParams,
  AdminUpdateInquiryParams,
  AdminUpdateInquiryBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.use("/admin/inquiries", requireAdmin);
router.use("/admin/inquiries/:id", requireAdmin);
router.use("/admin/inquiries/summary", requireAdmin);

function serialize(i: typeof contactInquiriesTable.$inferSelect) {
  return {
    id: i.id,
    company: i.company,
    name: i.name,
    email: i.email,
    phone: i.phone,
    country: i.country,
    projectType: i.projectType,
    productInterest: i.productInterest,
    monthlyVolume: i.monthlyVolume,
    message: i.message,
    status: i.status,
    adminNote: i.adminNote,
    source: i.source,
    createdAt: i.createdAt.toISOString(),
  };
}

router.get("/admin/inquiries/summary", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      status: contactInquiriesTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(contactInquiriesTable)
    .groupBy(contactInquiriesTable.status);
  const byStatus = { new: 0, in_progress: 0, done: 0 };
  let total = 0;
  for (const r of rows) {
    total += r.count;
    if (r.status === "new") byStatus.new = r.count;
    else if (r.status === "in_progress") byStatus.in_progress = r.count;
    else if (r.status === "done") byStatus.done = r.count;
  }
  const recent = await db
    .select()
    .from(contactInquiriesTable)
    .orderBy(desc(contactInquiriesTable.createdAt))
    .limit(5);
  res.json({ total, byStatus, recent: recent.map(serialize) });
});

router.get("/admin/inquiries", async (req, res): Promise<void> => {
  const q = AdminListInquiriesQueryParams.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ error: q.error.message });
    return;
  }
  const where = q.data.status
    ? eq(contactInquiriesTable.status, q.data.status)
    : undefined;
  const rows = await db
    .select()
    .from(contactInquiriesTable)
    .where(where)
    .orderBy(desc(contactInquiriesTable.createdAt));
  res.json(rows.map(serialize));
});

router.get("/admin/inquiries/:id", async (req, res): Promise<void> => {
  const params = AdminGetInquiryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(contactInquiriesTable)
    .where(eq(contactInquiriesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }
  res.json(serialize(row));
});

router.patch("/admin/inquiries/:id", async (req, res): Promise<void> => {
  const params = AdminUpdateInquiryParams.safeParse(req.params);
  const parsed = AdminUpdateInquiryBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const update: Partial<typeof contactInquiriesTable.$inferInsert> = {};
  if (parsed.data.status !== undefined) update.status = parsed.data.status;
  if (parsed.data.adminNote !== undefined) update.adminNote = parsed.data.adminNote;
  const [row] = await db
    .update(contactInquiriesTable)
    .set(update)
    .where(eq(contactInquiriesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }
  res.json(serialize(row));
});

export default router;
