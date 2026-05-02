import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, contactInquiriesTable } from "@workspace/db";
import { CreateContactInquiryBody } from "@workspace/api-zod";
import { sendInquiryAlert } from "../lib/email";

const router: IRouter = Router();

const StrictContactBody = CreateContactInquiryBody.extend({
  company: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional(),
  country: z.string().trim().max(80).optional(),
  projectType: z.string().trim().max(30).optional(),
  productInterest: z.array(z.string().trim().max(80)).max(20).optional(),
  monthlyVolume: z.string().trim().max(60).optional(),
  message: z.string().trim().min(1).max(5000),
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
      company: data.company,
      name: data.name,
      email: data.email,
      phone: data.phone ?? "",
      country: data.country ?? "",
      projectType: data.projectType ?? "",
      productInterest: data.productInterest ?? [],
      monthlyVolume: data.monthlyVolume ?? "",
      message: data.message,
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
