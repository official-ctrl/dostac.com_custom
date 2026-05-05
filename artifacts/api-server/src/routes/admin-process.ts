import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, processContentTable } from "@workspace/db";
import { AdminUpdateProcessBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";
import { serializeProcess, EMPTY_PROCESS } from "./public-process";

const router: IRouter = Router();

const SINGLETON_ID = 1;

router.use("/admin/process", requireAdmin);

router.get("/admin/process", async (_req, res) => {
  const [row] = await db
    .select()
    .from(processContentTable)
    .where(eq(processContentTable.id, SINGLETON_ID))
    .limit(1);
  res.json(row ? serializeProcess(row) : EMPTY_PROCESS);
});

router.put("/admin/process", async (req, res): Promise<void> => {
  const parsed = AdminUpdateProcessBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const v = parsed.data;
  const values = {
    oemImageUrl: v.oemImageUrl ?? null,
    oemDescriptionKo: v.oemDescriptionKo,
    oemDescriptionEn: v.oemDescriptionEn,
    oemDescriptionJa: v.oemDescriptionJa,
    oemDescriptionZh: v.oemDescriptionZh,
    oemDescriptionVi: v.oemDescriptionVi,
    oemSteps: v.oemSteps,
    certIntroKo: v.certIntroKo,
    certIntroEn: v.certIntroEn,
    certIntroJa: v.certIntroJa,
    certIntroZh: v.certIntroZh,
    certIntroVi: v.certIntroVi,
    certItems: v.certItems.map((c) => ({ ...c, imageUrl: c.imageUrl ?? null })),
  };

  const [row] = await db
    .insert(processContentTable)
    .values({ id: SINGLETON_ID, ...values })
    .onConflictDoUpdate({
      target: processContentTable.id,
      set: values,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to upsert process content" });
    return;
  }
  res.json(serializeProcess(row));
});

export default router;
