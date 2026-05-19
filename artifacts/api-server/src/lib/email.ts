import type { ContactInquiry } from "@workspace/db";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { logger } from "./logger";

const ADMIN_EMAIL = "admin@dostac.co.kr";

const connectors = new ReplitConnectors();

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  oem: "OEM",
  odm: "ODM",
  sample: "Sample request",
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
    const display = productNameKo
      ? `${productNameKo} (${inquiry.productSlug})`
      : inquiry.productSlug;
    lines.push(`문의 제품:   ${display}`);
  }
  if (inquiry.productInterest) lines.push(`Product:     ${inquiry.productInterest}`);
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtmlBody(inquiry: ContactInquiry, productNameKo?: string): string {
  const row = (label: string, value: string | null | undefined) =>
    `<tr><td style="padding:6px 12px;color:#64748b;font-weight:600;white-space:nowrap;">${label}</td><td style="padding:6px 12px;color:#0f172a;">${escapeHtml(fmt(value))}</td></tr>`;
  const highlightRow = (label: string, value: string | null | undefined) =>
    `<tr style="background:#eff6ff;"><td style="padding:8px 12px;color:#1e3a5f;font-weight:700;white-space:nowrap;border-left:3px solid #1e3a5f;">${label}</td><td style="padding:8px 12px;color:#0f172a;font-weight:600;">${escapeHtml(fmt(value))}</td></tr>`;

  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f8fafc;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
    <div style="background:#1e3a5f;color:white;padding:20px 24px;">
      <div style="font-size:13px;opacity:0.8;letter-spacing:0.06em;text-transform:uppercase;">DOSTAC Inquiry</div>
      <div style="font-size:20px;font-weight:600;margin-top:4px;">New contact inquiry received</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${row("Name", inquiry.name)}
      ${row("Email", inquiry.email)}
      ${row("Company", inquiry.company)}
      ${row("Type", inquiryTypeLabel(inquiry.inquiryType))}
      ${inquiry.productSlug ? highlightRow("문의 제품", productNameKo ? `${productNameKo} (${inquiry.productSlug})` : inquiry.productSlug) : ""}
      ${inquiry.productInterest ? highlightRow("Product of Interest", inquiry.productInterest) : ""}
      ${inquiry.material ? highlightRow("Material", inquiry.material) : ""}
      ${inquiry.whatsapp ? highlightRow("WhatsApp", inquiry.whatsapp) : ""}
      ${inquiry.country ? row("Country", inquiry.country) : ""}
      ${inquiry.quantity ? highlightRow("Desired Quantity", inquiry.quantity) : ""}
      ${inquiry.customization ? row("Customization", inquiry.customization) : ""}
      ${row("Inquiry ID", String(inquiry.id))}
    </table>
    <div style="padding:0 24px 24px;">
      <div style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Message</div>
      <div style="background:#f1f5f9;border-radius:8px;padding:14px;font-size:14px;color:#0f172a;white-space:pre-wrap;">${escapeHtml(inquiry.message)}</div>
    </div>
  </div>
</body></html>`;
}

/**
 * Strip CR/LF and other control characters that could be used to inject
 * additional headers into an RFC822 message. Returns null if the input is
 * empty or fails a basic email-shape sanity check.
 */
function safeHeaderEmail(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/[\r\n\t]+/g, "").trim();
  if (!cleaned) return null;
  if (cleaned.length > 254) return null;
  if (!/^[^\s<>",;@]+@[^\s<>",;@]+\.[^\s<>",;@]+$/.test(cleaned)) return null;
  return cleaned;
}

function safeHeaderText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, 200);
}

/**
 * Encode a UTF-8 body for transport over an RFC2822-compliant SMTP path.
 * We use base64 with 76-character lines per RFC 2045 §6.8.
 */
function base64Body(input: string): string {
  const b64 = Buffer.from(input, "utf8").toString("base64");
  return b64.replace(/(.{76})/g, "$1\r\n");
}

function buildRfc822(inquiry: ContactInquiry, productNameKo?: string): string {
  const safeName = safeHeaderText(inquiry.name);
  const safeCompany = safeHeaderText(inquiry.company ?? "");
  const safeProduct = inquiry.productInterest ? safeHeaderText(inquiry.productInterest.trim()) : "";
  const subject = safeProduct
    ? `[DOSTAC] New inquiry re: ${safeProduct} from ${safeName}`
    : `[DOSTAC] New inquiry from ${safeName}${safeCompany ? ` (${safeCompany})` : ""}`;
  const boundary = `dostac_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  const replyTo = safeHeaderEmail(inquiry.email);

  const headers = [
    `To: ${ADMIN_EMAIL}`,
    replyTo ? `Reply-To: ${replyTo}` : null,
    `Subject: =?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ]
    .filter((h): h is string => typeof h === "string")
    .join("\r\n");

  const plainPart = [
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    base64Body(buildPlainBody(inquiry, productNameKo)),
  ].join("\r\n");

  const htmlPart = [
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    base64Body(buildHtmlBody(inquiry, productNameKo)),
  ].join("\r\n");

  return `${headers}\r\n\r\n${plainPart}\r\n${htmlPart}\r\n--${boundary}--\r\n`;
}

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * Send a notification email to admin@dostac.co.kr when a new contact inquiry
 * arrives. Uses the Gmail connector via Replit's connectors SDK.
 *
 * Failures are logged but never thrown — the public contact endpoint must
 * always succeed for the visitor even if the alert delivery is degraded.
 */
export async function sendInquiryAlert(inquiry: ContactInquiry, productNameKo?: string): Promise<void> {
  logger.info(
    {
      inquiryId: inquiry.id,
      company: inquiry.company,
      name: inquiry.name,
      email: inquiry.email,
    },
    "New contact inquiry received",
  );

  try {
    const raw = toBase64Url(buildRfc822(inquiry, productNameKo));
    const response = await connectors.proxy(
      "google-mail",
      "/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      logger.warn(
        { inquiryId: inquiry.id, status: response.status, body: text.slice(0, 500) },
        "Gmail send returned non-2xx; admin alert not delivered",
      );
      return;
    }

    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      threadId?: string;
    };
    logger.info(
      { inquiryId: inquiry.id, gmailMessageId: data.id, threadId: data.threadId },
      "Inquiry alert email sent to admin@dostac.co.kr",
    );
  } catch (err) {
    logger.warn(
      { err, inquiryId: inquiry.id },
      "Failed to send inquiry alert email; visitor request still succeeded",
    );
  }
}
