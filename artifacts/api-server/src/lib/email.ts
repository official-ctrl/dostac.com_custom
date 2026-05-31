import type { ContactInquiry } from "@workspace/db";
import { logger } from "./logger";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@dostac.co.kr";

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  oem: "OEM",
  odm: "ODM",
  sample: "Sample request",
  other: "Other",
};

const INQUIRY_TYPE_SUBJECT_LABELS: Record<string, string> = {
  oem: "OEM",
  odm: "ODM",
  sample: "Sample",
  other: "Other",
};

function fmt(value: string | null | undefined): string {
  if (value == null) return "-";
  return value.length ? value : "-";
}

function inquiryTypeLabel(value: string): string {
  if (!value) return "-";
  return INQUIRY_TYPE_LABELS[value] ?? value;
}

function buildSubject(inquiry: ContactInquiry): string {
  const safeName = inquiry.name.replace(/[\r\n]+/g, " ").slice(0, 100);
  const rawType = inquiry.inquiryType ?? "";
  const typeLabel = rawType ? (INQUIRY_TYPE_SUBJECT_LABELS[rawType] ?? rawType) : "";
  const inquiryWord = typeLabel ? `${typeLabel} inquiry` : "inquiry";
  const product = inquiry.productInterest?.trim().slice(0, 80) ?? "";
  return product
    ? `[DOSTAC] New ${inquiryWord} re: ${product} from ${safeName}`
    : `[DOSTAC] New ${inquiryWord} from ${safeName}`;
}

function buildPlainBody(inquiry: ContactInquiry, productNameKo?: string): string {
  const lines = [
    `New inquiry received from the DOSTAC website.`,
    ``,
    `Name:        ${inquiry.name}`,
    `Email:       ${inquiry.email}`,
    `Company:     ${fmt(inquiry.company)}`,
    `Type:        ${inquiryTypeLabel(inquiry.inquiryType)}`,
  ];
  if (inquiry.productSlug) {
    const display = productNameKo ? `${productNameKo} (${inquiry.productSlug})` : inquiry.productSlug;
    lines.push(`Product:     ${display}`);
  }
  if (inquiry.productInterest) lines.push(`Interest:    ${inquiry.productInterest}`);
  if (inquiry.material) lines.push(`Material:    ${inquiry.material}`);
  if (inquiry.whatsapp) lines.push(`WhatsApp:    ${inquiry.whatsapp}`);
  if (inquiry.country) lines.push(`Country:     ${inquiry.country}`);
  if (inquiry.quantity) lines.push(`Quantity:    ${inquiry.quantity}`);
  if (inquiry.customization) lines.push(`Custom:      ${inquiry.customization}`);
  lines.push(
    `Inquiry ID:  ${inquiry.id}`,
    `Received:    ${inquiry.createdAt instanceof Date ? inquiry.createdAt.toISOString() : String(inquiry.createdAt)}`,
    ``,
    `Message:`,
    `${inquiry.message}`,
    ``,
    `--`,
    `Open the admin to reply: /admin/inquiries/${inquiry.id}`,
  );
  return lines.join("\n");
}

/**
 * Send a notification email to the admin when a new contact inquiry arrives.
 * Configure SMTP via environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL
 *
 * Failures are logged but never thrown — the contact endpoint always succeeds.
 */
export async function sendInquiryAlert(inquiry: ContactInquiry, productNameKo?: string): Promise<void> {
  logger.info(
    { inquiryId: inquiry.id, company: inquiry.company, name: inquiry.name, email: inquiry.email },
    "New contact inquiry received",
  );

  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    logger.warn({ inquiryId: inquiry.id }, "SMTP_HOST not configured — email alert skipped");
    return;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"DOSTAC Contact" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      replyTo: inquiry.email,
      subject: buildSubject(inquiry),
      text: buildPlainBody(inquiry, productNameKo),
    });

    logger.info({ inquiryId: inquiry.id }, "Inquiry alert email sent");
  } catch (err) {
    logger.warn({ err, inquiryId: inquiry.id }, "Failed to send inquiry alert email; visitor request still succeeded");
  }
}

/**
 * Send an auto-reply confirmation to the customer who submitted an inquiry.
 * Silently skips if SMTP is not configured.
 */
export async function sendAutoReply(inquiry: ContactInquiry): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) return;

  const LANG_CONTENT: Record<string, { subject: string; greeting: string; body: string; closing: string }> = {
    ko: {
      subject: `[DOSTAC] 문의가 접수되었습니다 (ID: ${inquiry.id})`,
      greeting: `안녕하세요, ${inquiry.name}님`,
      body: `저희 DOSTAC에 문의해 주셔서 감사합니다.\n귀하의 문의가 정상적으로 접수되었습니다.\n영업팀에서 1~2 영업일 내로 회신드리겠습니다.`,
      closing: "감사합니다.",
    },
    en: {
      subject: `[DOSTAC] We received your inquiry (ID: ${inquiry.id})`,
      greeting: `Dear ${inquiry.name}`,
      body: `Thank you for contacting Dostac.\nYour inquiry has been received successfully.\nOur team will get back to you within 1–2 business days.`,
      closing: "Best regards,",
    },
    ja: {
      subject: `[DOSTAC] お問い合わせを受け付けました (ID: ${inquiry.id})`,
      greeting: `${inquiry.name} 様`,
      body: `Dostacへのお問い合わせありがとうございます。\nお問い合わせを正常に受け付けました。\n担当者より1〜2営業日以内にご連絡いたします。`,
      closing: "よろしくお願いいたします。",
    },
  };

  const lang = LANG_CONTENT.en;

  const text = [
    lang.greeting + ",",
    "",
    lang.body,
    "",
    `Reference: #${inquiry.id}`,
    "",
    "---",
    lang.closing,
    "Dostac Global Sales Team",
    "info@dostac.com",
    "https://dostac.com",
  ].join("\n");

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"DOSTAC" <${process.env.SMTP_USER}>`,
      to: inquiry.email,
      subject: lang.subject,
      text,
    });

    logger.info({ inquiryId: inquiry.id, to: inquiry.email }, "Auto-reply sent to customer");
  } catch (err) {
    logger.warn({ err, inquiryId: inquiry.id }, "Failed to send auto-reply");
  }
}
