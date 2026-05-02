import { Router, type IRouter } from "express";
import { AdminTranslateBody } from "@workspace/api-zod";
import { translateText, type SupportedLang } from "../lib/translate";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.use("/admin/translate", requireAdmin);

router.post("/admin/translate", async (req, res): Promise<void> => {
  const parsed = AdminTranslateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const {
    sourceText,
    targetLangs,
    sourceLang = "ko",
    context,
    format = "text",
  } = parsed.data;

  const results = await Promise.all(
    targetLangs.map(async (lang) => {
      try {
        const text = await translateText({
          sourceText,
          sourceLang: sourceLang as SupportedLang,
          targetLang: lang as SupportedLang,
          context,
          format,
        });
        return { lang, text };
      } catch (err) {
        req.log.error({ err, lang }, "Translation failed for language");
        return { lang, text: "" };
      }
    }),
  );

  res.json({ translations: results });
});

export default router;
