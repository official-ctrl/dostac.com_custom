import { Router, type IRouter } from "express";
import { db, aboutContentTable } from "@workspace/db";

const router: IRouter = Router();

function serialize(a: typeof aboutContentTable.$inferSelect) {
  return {
    greetingImageUrl: a.greetingImageUrl,
    greetingMessageKo: a.greetingMessageKo,
    greetingMessageEn: a.greetingMessageEn,
    greetingMessageJa: a.greetingMessageJa,
    greetingMessageZh: a.greetingMessageZh,
    greetingMessageVi: a.greetingMessageVi,
    greetingSignatureKo: a.greetingSignatureKo,
    greetingSignatureEn: a.greetingSignatureEn,
    greetingSignatureJa: a.greetingSignatureJa,
    greetingSignatureZh: a.greetingSignatureZh,
    greetingSignatureVi: a.greetingSignatureVi,
    historyItems: a.historyItems,
    worldwideImageUrl: a.worldwideImageUrl,
    worldwideIntroKo: a.worldwideIntroKo,
    worldwideIntroEn: a.worldwideIntroEn,
    worldwideIntroJa: a.worldwideIntroJa,
    worldwideIntroZh: a.worldwideIntroZh,
    worldwideIntroVi: a.worldwideIntroVi,
    worldwideItems: a.worldwideItems,
    companyDescKo: a.companyDescKo,
    companyDescEn: a.companyDescEn,
    companyDescJa: a.companyDescJa,
    companyDescZh: a.companyDescZh,
    companyDescVi: a.companyDescVi,
    whyDostacItems: a.whyDostacItems,
    directionsAddressKo: a.directionsAddressKo,
    directionsAddressEn: a.directionsAddressEn,
    directionsAddressJa: a.directionsAddressJa,
    directionsAddressZh: a.directionsAddressZh,
    directionsAddressVi: a.directionsAddressVi,
    directionsMapEmbed: a.directionsMapEmbed,
    directionsImageUrl: a.directionsImageUrl,
  };
}

const EMPTY = {
  greetingImageUrl: null,
  greetingMessageKo: "",
  greetingMessageEn: "",
  greetingMessageJa: "",
  greetingMessageZh: "",
  greetingMessageVi: "",
  greetingSignatureKo: "",
  greetingSignatureEn: "",
  greetingSignatureJa: "",
  greetingSignatureZh: "",
  greetingSignatureVi: "",
  historyItems: [],
  worldwideImageUrl: null,
  worldwideIntroKo: "",
  worldwideIntroEn: "",
  worldwideIntroJa: "",
  worldwideIntroZh: "",
  worldwideIntroVi: "",
  worldwideItems: [],
  companyDescKo: "",
  companyDescEn: "",
  companyDescJa: "",
  companyDescZh: "",
  companyDescVi: "",
  whyDostacItems: [],
  directionsAddressKo: "",
  directionsAddressEn: "",
  directionsAddressJa: "",
  directionsAddressZh: "",
  directionsAddressVi: "",
  directionsMapEmbed: null,
  directionsImageUrl: null,
};

router.get("/public/about", async (_req, res) => {
  const [row] = await db
    .select()
    .from(aboutContentTable)
    .orderBy(aboutContentTable.id)
    .limit(1);
  res.json(row ? serialize(row) : EMPTY);
});

export default router;
export { serialize as serializeAbout, EMPTY as EMPTY_ABOUT };
