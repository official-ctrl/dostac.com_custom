import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db, contactInquiriesTable, productsTable, productTranslationsTable } from "@workspace/db";
import { CreateContactInquiryBody } from "@workspace/api-zod";
import { sendInquiryAlert, sendAutoReply } from "../lib/email";

const router: IRouter = Router();

const ALLOWED_INQUIRY_TYPES = ["", "oem", "odm", "sample", "other"] as const;

const StrictContactBody = CreateContactInquiryBody.extend({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(200).optional(),
  inquiryType: z.enum(ALLOWED_INQUIRY_TYPES).optional(),
  message: z.string().trim().min(1).max(5000),
  whatsapp: z.string().trim().max(60).optional(),
  country: z.string().trim().max(80).optional(),
  quantity: z.string().trim().max(80).optional(),
  productInterest: z.string().trim().max(2000).optional(),
  customization: z.string().trim().max(2000).optional(),
  material: z.string().trim().max(500).optional(),
  productSlug: z.string().trim().max(200).optional(),
});

router.post("/public/contact-inquiries", async (req, res): Promise<void> => {
  const parsed = StrictContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [inquiry] = await db
    .insert(contactInquiriesTable)
    .values({
      name: data.name,
      email: data.email,
      company: data.company ?? "",
      inquiryType: data.inquiryType ?? "",
      message: data.message,
      whatsapp: data.whatsapp ?? "",
      country: data.country ?? "",
      quantity: data.quantity ?? "",
      productInterest: data.productInterest ?? "",
      customization: data.customization ?? "",
      material: data.material ?? "",
      productSlug: data.productSlug ?? null,
      source: "web",
    })
    .returning();

  if (inquiry) {
    (async () => {
      let productNameKo: string | undefined;
      if (inquiry.productSlug) {
        const [row] = await db
          .select({ name: productTranslationsTable.name })
          .from(productTranslationsTable)
          .innerJoin(productsTable, eq(productsTable.id, productTranslationsTable.productId))
          .where(
            and(
              eq(productsTable.slug, inquiry.productSlug),
              eq(productTranslationsTable.lang, "ko"),
            ),
          )
          .limit(1);
        productNameKo = row?.name;
      }
      await Promise.all([
        sendInquiryAlert(inquiry, productNameKo),
        sendAutoReply(inquiry),
      ]);
    })().catch((err) => {
      req.log.error({ err }, "Failed to send inquiry email");
    });
  }

  res.status(201).json({ ok: true });
});

export default router;
