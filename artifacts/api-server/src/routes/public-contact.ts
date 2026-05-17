import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, contactInquiriesTable } from "@workspace/db";
import { CreateContactInquiryBody } from "@workspace/api-zod";
import { sendInquiryAlert } from "../lib/email";

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
      source: "web",
    })
    .returning();

  if (inquiry) {
    sendInquiryAlert(inquiry).catch((err) => {
      req.log.error({ err }, "Failed to send inquiry alert email");
    });
  }

  res.status(201).json({ ok: true });
});

export default router;
