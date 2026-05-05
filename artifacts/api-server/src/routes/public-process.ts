import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, processContentTable } from "@workspace/db";

const SINGLETON_ID = 1;

const router: IRouter = Router();

function serialize(p: typeof processContentTable.$inferSelect) {
  return {
    oemImageUrl: p.oemImageUrl,
    oemDescriptionKo: p.oemDescriptionKo,
    oemDescriptionEn: p.oemDescriptionEn,
    oemDescriptionJa: p.oemDescriptionJa,
    oemDescriptionZh: p.oemDescriptionZh,
    oemDescriptionVi: p.oemDescriptionVi,
    oemSteps: p.oemSteps,
    certIntroKo: p.certIntroKo,
    certIntroEn: p.certIntroEn,
    certIntroJa: p.certIntroJa,
    certIntroZh: p.certIntroZh,
    certIntroVi: p.certIntroVi,
    certItems: p.certItems,
  };
}

const EMPTY = {
  oemImageUrl: null,
  oemDescriptionKo: "",
  oemDescriptionEn: "",
  oemDescriptionJa: "",
  oemDescriptionZh: "",
  oemDescriptionVi: "",
  oemSteps: [],
  certIntroKo: "",
  certIntroEn: "",
  certIntroJa: "",
  certIntroZh: "",
  certIntroVi: "",
  certItems: [],
};

router.get("/public/process", async (_req, res) => {
  const [row] = await db
    .select()
    .from(processContentTable)
    .where(eq(processContentTable.id, SINGLETON_ID))
    .limit(1);
  res.json(row ? serialize(row) : EMPTY);
});

export default router;
export { serialize as serializeProcess, EMPTY as EMPTY_PROCESS };
