import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { db, aboutContentTable } from "@workspace/db";
import { AdminUpdateAboutBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/require-admin";
import { serializeAbout, EMPTY_ABOUT } from "./public-about";

const router: IRouter = Router();

const SINGLETON_ID = 1;

const sanitizeOpts: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "blockquote",
    "h1", "h2", "h3", "h4", "ul", "ol", "li",
    "a", "img", "span", "div",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    span: ["style"],
    div: ["style"],
    "*": ["style"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" },
    }),
  },
};
const cleanHtml = (s: string): string => sanitizeHtml(s ?? "", sanitizeOpts);

router.use("/admin/about", requireAdmin);

router.get("/admin/about", async (_req, res) => {
  const [row] = await db
    .select()
    .from(aboutContentTable)
    .where(eq(aboutContentTable.id, SINGLETON_ID))
    .limit(1);
  res.json(row ? serializeAbout(row) : EMPTY_ABOUT);
});

router.put("/admin/about", async (req, res): Promise<void> => {
  const parsed = AdminUpdateAboutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const v = parsed.data;
  const values = {
    greetingImageUrl: v.greetingImageUrl ?? null,
    greetingMessageKo: cleanHtml(v.greetingMessageKo),
    greetingMessageEn: cleanHtml(v.greetingMessageEn),
    greetingMessageJa: cleanHtml(v.greetingMessageJa),
    greetingMessageZh: cleanHtml(v.greetingMessageZh),
    greetingMessageVi: cleanHtml(v.greetingMessageVi),
    greetingSignatureKo: v.greetingSignatureKo,
    greetingSignatureEn: v.greetingSignatureEn,
    greetingSignatureJa: v.greetingSignatureJa,
    greetingSignatureZh: v.greetingSignatureZh,
    greetingSignatureVi: v.greetingSignatureVi,
    historyItems: v.historyItems,
    worldwideImageUrl: v.worldwideImageUrl ?? null,
    worldwideIntroKo: v.worldwideIntroKo,
    worldwideIntroEn: v.worldwideIntroEn,
    worldwideIntroJa: v.worldwideIntroJa,
    worldwideIntroZh: v.worldwideIntroZh,
    worldwideIntroVi: v.worldwideIntroVi,
    worldwideItems: v.worldwideItems.map((w) => ({ ...w, imageUrl: w.imageUrl ?? null })),
    directionsAddressKo: v.directionsAddressKo,
    directionsAddressEn: v.directionsAddressEn,
    directionsAddressJa: v.directionsAddressJa,
    directionsAddressZh: v.directionsAddressZh,
    directionsAddressVi: v.directionsAddressVi,
    directionsMapEmbed: v.directionsMapEmbed ?? null,
    directionsImageUrl: v.directionsImageUrl ?? null,
  };

  const [row] = await db
    .insert(aboutContentTable)
    .values({ id: SINGLETON_ID, ...values })
    .onConflictDoUpdate({
      target: aboutContentTable.id,
      set: values,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to upsert about content" });
    return;
  }
  res.json(serializeAbout(row));
});

export default router;
