/**
 * GA4 event tracking helpers.
 * All events are no-ops when gtag is not loaded (e.g. during SSR or ad-block).
 */

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag(...args);
}

// ── CTA Clicks ──────────────────────────────────────────────────────────────

export type CtaLocation =
  | "hero"
  | "hero_marquee"
  | "terra_cta"
  | "nav"
  | "product_card"
  | "insights_article"
  | "rfq_section"
  | "contact_hero"
  | "footer"
  | "production_page"
  | "about_page";

export function trackCtaClick(label: string, location: CtaLocation) {
  gtag("event", "cta_click", {
    button_label: label,
    button_location: location,
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
  });
}

// ── Form Events ──────────────────────────────────────────────────────────────

export type FormId = "contact" | "rfq_homepage";

export function trackFormSubmit(formId: FormId, inquiryType?: string) {
  gtag("event", "form_submit", {
    form_id: formId,
    inquiry_type: inquiryType || "not_specified",
  });
}

export function trackFormSuccess(formId: FormId, inquiryType?: string) {
  gtag("event", "form_success", {
    form_id: formId,
    inquiry_type: inquiryType || "not_specified",
  });
}

export function trackFormError(formId: FormId, errorMessage: string) {
  gtag("event", "form_error", {
    form_id: formId,
    error_message: errorMessage.slice(0, 100),
  });
}
