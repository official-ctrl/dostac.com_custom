"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, CheckCircle2, Package, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang } from "@/components/dostac/i18n";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useCreateContactInquiry, useGetPublicProduct, getGetPublicProductQueryKey } from "@workspace/api-client-react";
import { CONTACT_META } from "@/hooks/page-meta-config";
import { trackFormSubmit, trackFormSuccess, trackFormError, trackCtaClick } from "@/lib/analytics";

const VALID_INQUIRY_TYPES = ["oem", "odm", "sample", "other"] as const;
type InquiryType = (typeof VALID_INQUIRY_TYPES)[number];

function parseInquiryType(search: string): InquiryType | "" {
  const params = new URLSearchParams(search);
  const raw = params.get("inquiryType") ?? params.get("source");
  if (!raw) return "";
  if ((VALID_INQUIRY_TYPES as readonly string[]).includes(raw)) return raw as InquiryType;
  if (raw === "production") return "oem";
  return "";
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const SUCCESS_MSG: Record<string, { title: string; body: string }> = {
  ko: {
    title: "문의가 정상적으로 접수되었습니다.",
    body: "영업일 기준 1~2일 내에 info@dostac.com 에서 회신드리겠습니다. 감사합니다.",
  },
  en: {
    title: "Your inquiry has been received.",
    body: "Our team will reply from info@dostac.com within 1–2 business days. Thank you.",
  },
  ja: {
    title: "お問い合わせを受け付けました。",
    body: "info@dostac.com より1〜2営業日以内にご返信いたします。ありがとうございました。",
  },
  zh: {
    title: "我们已收到您的咨询。",
    body: "我们将在 1–2 个工作日内通过 info@dostac.com 与您联系。感谢您的来信。",
  },
  vi: {
    title: "Yêu cầu của bạn đã được tiếp nhận.",
    body: "Chúng tôi sẽ phản hồi từ info@dostac.com trong vòng 1–2 ngày làm việc. Cảm ơn bạn.",
  },
};

const NONE_VALUE = "__none__";


function ContactContent() {
  const { t, lang } = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const successRef = useRef<HTMLDivElement>(null);
  const inquiryTypeOptions = t("contact.inquiryTypeOptions") as {
    oem: string;
    odm: string;
    sample: string;
    other: string;
  };

  const prefillInquiryType = parseInquiryType(searchParams.toString());
  const prefillProductSlug = searchParams.get("product") ?? "";
  const prefillMaterial = searchParams.get("material") ?? "";

  const { data: prefillProduct } = useGetPublicProduct(
    prefillProductSlug || "_",
    { lang },
    {
      query: {
        enabled: !!prefillProductSlug,
        queryKey: getGetPublicProductQueryKey(prefillProductSlug || "_", { lang }),
      },
    },
  );

  const [formHighlight, setFormHighlight] = useState(false);

  useEffect(() => {
    let focusTimer: ReturnType<typeof setTimeout> | undefined;

    const scrollAndHighlight = (el: HTMLElement) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
      if (!reduced) {
        setFormHighlight(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setFormHighlight(true));
        });
      }
      const isTouch = navigator.maxTouchPoints > 0;
      if (!isTouch) {
        clearTimeout(focusTimer);
        focusTimer = setTimeout(() => {
          const nameInput = document.getElementById("name") as HTMLInputElement | null;
          nameInput?.focus({ preventScroll: true });
        }, reduced ? 0 : 700);
      }
    };

    const source = searchParams.get("source");
    const hasContactHash = window.location.hash === "#contact-form";
    const shouldScroll =
      hasContactHash ||
      source === "about" ||
      source === "production";
    if (shouldScroll) {
      const el = document.getElementById("contact-form");
      if (el) {
        scrollAndHighlight(el);
        if (hasContactHash) {
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
    }

    const handleHashChange = () => {
      if (window.location.hash === "#contact-form") {
        const el = document.getElementById("contact-form");
        if (el) {
          scrollAndHighlight(el);
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      clearTimeout(focusTimer);
    };
  }, [searchParams]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: prefillInquiryType as "" | "oem" | "odm" | "sample" | "other",
    whatsapp: "",
    country: "",
    productInterest: "",
    material: prefillMaterial,
    quantity: "",
    customization: "",
    message: "",
  });

  useEffect(() => {
    if (prefillProduct?.name) {
      setForm((prev) => ({
        ...prev,
        productInterest: prev.productInterest === "" ? prefillProduct.name : prev.productInterest,
        material: prev.material === "" && prefillProduct.material ? prefillProduct.material : prev.material,
        message: prev.message === "" ? prefillProduct.name : prev.message,
      }));
    }
  }, [prefillProduct?.name, prefillProduct?.material, lang]);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInquiry = useCreateContactInquiry({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        setError(null);
        trackFormSuccess("contact", form.inquiryType || undefined);
        setForm({ name: "", email: "", company: "", inquiryType: "", whatsapp: "", country: "", productInterest: "", material: "", quantity: "", customization: "", message: "" });
        setTimeout(() => {
          successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
        setError(msg);
        setSuccess(false);
        trackFormError("contact", msg);
      },
    },
  });

  const shakeField = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    if (reducedMotion) return;
    el.classList.remove("field-shake");
    void el.offsetWidth;
    el.classList.add("field-shake");
    const cleanup = () => {
      el.classList.remove("field-shake");
      el.removeEventListener("animationend", cleanup);
    };
    el.addEventListener("animationend", cleanup);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    if (!form.name.trim()) {
      setError(t("contact.validationRequired") as string);
      shakeField("name");
      return;
    }
    if (!form.email.trim()) {
      setError(t("contact.validationRequired") as string);
      shakeField("email");
      return;
    }
    if (!form.message.trim()) {
      setError(t("contact.validationRequired") as string);
      shakeField("desc");
      return;
    }
    trackFormSubmit("contact", form.inquiryType || undefined);
    createInquiry.mutate({
      data: {
        name: form.name,
        email: form.email,
        company: form.company || undefined,
        inquiryType: form.inquiryType || undefined,
        whatsapp: form.whatsapp || undefined,
        country: form.country || undefined,
        productInterest: form.productInterest || undefined,
        material: form.material || undefined,
        quantity: form.quantity || undefined,
        customization: form.customization || undefined,
        message: form.message,
        productSlug: prefillProductSlug || undefined,
      },
    });
  };

  return (
    <>
      {/* ════════════════ PREMIUM HERO ════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ backgroundColor: "#0D1117" }}>
        <div className="absolute inset-0 z-0">
          <Image
            src={dostacImage("hero-contact.webp")}
            alt="Contact Dostac — Korean K-Beauty OEM/ODM sourcing concierge in Gwangju, Gyeonggi-do"
            fill
            sizes="100vw"
            priority
            quality={75}
            className="object-cover object-center"
            style={{ transform: "scale(1.04)" }}
          />
          {/* Cinematic dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117]/86 via-[#0D1117]/72 to-[#0D1117]/90" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(139,94,60,0.20) 0%, transparent 65%)",
            }}
          />
        </div>

        {/* Corner marks */}
        <div aria-hidden="true" className="absolute top-24 left-6 w-5 h-5 border-l border-t border-[#8B5E3C]/45 z-10 hidden sm:block" />
        <div aria-hidden="true" className="absolute top-24 right-6 w-5 h-5 border-r border-t border-[#8B5E3C]/45 z-10 hidden sm:block" />
        <div aria-hidden="true" className="absolute bottom-6 left-6 w-5 h-5 border-l border-b border-[#8B5E3C]/45 z-10 hidden sm:block" />
        <div aria-hidden="true" className="absolute bottom-6 right-6 w-5 h-5 border-r border-b border-[#8B5E3C]/45 z-10 hidden sm:block" />

        <div className="container relative z-10 mx-auto px-5 sm:px-6 py-20 sm:py-24 md:py-32 min-h-[400px] sm:min-h-[460px] md:min-h-[520px] flex flex-col justify-center text-white max-w-5xl">
          {/* Eyebrow with live pulse */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#E9A052] opacity-70 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E9A052]" />
            </span>
            <p className="text-[10.5px] uppercase tracking-[0.32em] text-[#E9A052] font-semibold">
              {t("contact.heroEyebrow") as string}
            </p>
          </motion.div>

          {/* Premium headline */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold leading-[1.04] mb-6 tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4.25rem)" }}
          >
            {t("contact.heroTitleLead") as string}
            <br />
            <span className="text-[#E9A052]/90 italic">
              {t("contact.heroTitleAccent") as string}
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#F5F0E8]/70 leading-relaxed max-w-2xl mb-10"
            style={{ fontSize: "clamp(1rem, 1.35vw, 1.125rem)" }}
          >
            {t("contact.heroBody") as string}
          </motion.p>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-[#F5F0E8]/15 max-w-2xl"
          >
            {((t("contact.heroTrust") as unknown as string[]) ?? []).map((trust, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#F5F0E8]/55 font-semibold"
              >
                <span className="text-[#E9A052]">✓</span>
                {trust}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════ MULTI-CHANNEL CONTACT ════════════════ */}
      <section className="relative bg-[#F5F0E8] py-14 md:py-18 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(139,94,60,0.07) 0%, transparent 65%)",
          }}
        />

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="max-w-2xl mx-auto text-center mb-10"
          >
            <motion.p
              variants={fadeUp}
              className="text-[#8B5E3C] text-[10.5px] font-bold tracking-[0.3em] uppercase mb-3 inline-flex items-center gap-2.5"
            >
              <span className="w-5 h-px bg-[#8B5E3C]/60" />
              {t("contact.channelsEyebrow") as string}
              <span className="w-5 h-px bg-[#8B5E3C]/60" />
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-2xl md:text-[32px] font-bold text-[#2D2D2D] leading-[1.08] tracking-tight mb-3"
            >
              {t("contact.channelsHeading") as string}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#2D2D2D]/55 text-[13.5px] leading-relaxed"
            >
              {t("contact.channelsSub") as string}
            </motion.p>
          </motion.div>

          {/* 4-channel grid — option A: each card is a clickable action.
              Sidebar (#contact-form-info) holds the authoritative details. */}
          {(() => {
            const channels = (t("contact.channels") as unknown as Array<{ type: string; value: string; note: string }>) ?? [];
            const ICONS = [Mail, Phone, MapPin, Send];
            /* href targets — mailto/tel for direct actions, in-page anchors for
               head-office details and the RFQ form. Maps URL points to the
               actual headquarters coordinates (37.4116, 127.2954). */
            const HREFS = [
              "mailto:official@dostac.com",
              "tel:+82-70-4334-7333",
              "https://www.google.com/maps/search/?api=1&query=37.4116,127.2954",
              "#contact-form",
            ];
            const TARGETS: Array<"_self" | "_blank"> = ["_self", "_self", "_blank", "_self"];
            const ARIA_LABELS = ["Send email to official@dostac.com", "Call 070-4334-7333", "Open head office on Google Maps", "Jump to RFQ form"];

            return (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                variants={stagger}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                  gap: "16px",
                }}
              >
                {channels.map((c, i) => {
                  const Icon = ICONS[i] ?? Mail;
                  const href = HREFS[i] ?? "#";
                  const target = TARGETS[i] ?? "_self";
                  return (
                    <motion.a
                      key={i}
                      href={href}
                      target={target}
                      rel={target === "_blank" ? "noopener noreferrer" : undefined}
                      aria-label={ARIA_LABELS[i]}
                      onClick={() => trackCtaClick(`channel_${c.type.toLowerCase().replace(/\s+/g, "_")}`, "contact_hero")}
                      variants={fadeUp}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="relative rounded-2xl border bg-white p-5 contact-channel-shadow block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E3C]/40 focus-visible:ring-offset-2"
                      style={{ borderColor: "rgba(139,94,60,0.12)", textDecoration: "none" }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#8B5E3C]/10 border border-[#8B5E3C]/15 flex items-center justify-center mb-3">
                        <Icon className="w-4 h-4 text-[#8B5E3C]" strokeWidth={1.7} />
                      </div>
                      <p className="text-[9.5px] uppercase tracking-[0.22em] text-[#8B5E3C] font-bold mb-1.5">
                        {c.type}
                      </p>
                      <p className="font-display text-[15px] font-bold text-[#2D2D2D] leading-tight mb-1.5 break-words">
                        {c.value}
                      </p>
                      <p className="text-[10.5px] text-[#2D2D2D]/45 leading-snug">
                        {c.note}
                      </p>
                    </motion.a>
                  );
                })}
              </motion.div>
            );
          })()}
        </div>

        <style jsx>{`
          .contact-channel-shadow {
            box-shadow:
              0 1px 2px rgba(139, 94, 60, 0.04),
              0 8px 24px -8px rgba(139, 94, 60, 0.10);
            transition: box-shadow 0.3s ease-out;
          }
          .contact-channel-shadow:hover {
            box-shadow:
              0 4px 12px rgba(139, 94, 60, 0.06),
              0 16px 40px -10px rgba(139, 94, 60, 0.18);
          }
        `}</style>
      </section>

      {/* MAIN FORM SECTION */}
      <section id="contact-form" className="scroll-mt-20 py-24 bg-[#F5F7FA]">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14"
          >
            {/* FORM CARD */}
            <motion.div variants={fadeUp} className="lg:col-span-2">
              <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-7 md:p-10${formHighlight ? " form-highlight-pulse" : ""}`}>
                <h2 className="font-display text-2xl font-bold text-[#0F172A] mb-7">
                  {t("contact.formHeading") as string}
                </h2>

                {prefillProductSlug && (
                  <div className="flex items-center gap-3 mb-6 rounded-xl bg-accent/8 border border-accent/20 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-accent uppercase tracking-wide leading-none mb-0.5">
                        {t("contact.productContext") as string}
                      </p>
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {prefillProduct?.name ?? prefillProductSlug}
                      </p>
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait" initial={false}>
                {success ? (
                  <motion.div
                    key="contact-success"
                    ref={successRef}
                    role="status"
                    data-testid="contact-success"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="mb-6 flex flex-col items-center text-center py-10 gap-4">
                      <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                        <CheckCircle2 className="h-7 w-7 text-accent" />
                      </div>
                      <h3 className="font-bold text-[#0F172A] text-lg">
                        {(SUCCESS_MSG[lang] ?? SUCCESS_MSG.en).title}
                      </h3>
                      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                        {(SUCCESS_MSG[lang] ?? SUCCESS_MSG.en).body}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full mt-1"
                        onClick={() => setSuccess(false)}
                      >
                        {t("contact.anotherInquiry") as string}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="contact-form"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                  <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                          {t("contact.name") as string} <span className="text-accent">*</span>
                        </Label>
                        <Input
                          id="name"
                          required
                          placeholder={t("contact.namePh") as string}
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="h-10 text-sm"
                          data-testid="input-name"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                          {t("contact.email") as string} <span className="text-accent">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder={t("contact.emailPh") as string}
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="h-10 text-sm"
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="whatsapp" className="text-sm font-semibold text-slate-700">
                          {t("contact.whatsapp") as string}
                        </Label>
                        <Input
                          id="whatsapp"
                          placeholder={t("contact.whatsappPh") as string}
                          value={form.whatsapp}
                          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                          className="h-10 text-sm"
                          data-testid="input-whatsapp"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="country" className="text-sm font-semibold text-slate-700">
                          {t("contact.country") as string}
                        </Label>
                        <Input
                          id="country"
                          placeholder={t("contact.countryPh") as string}
                          value={form.country}
                          onChange={(e) => setForm({ ...form, country: e.target.value })}
                          className="h-10 text-sm"
                          data-testid="input-country"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="company" className="text-sm font-semibold text-slate-700">
                          {t("contact.company") as string}
                        </Label>
                        <Input
                          id="company"
                          placeholder={t("contact.companyPh") as string}
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          className="h-10 text-sm"
                          data-testid="input-company"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="inquiry-type" className="text-sm font-semibold text-slate-700">
                          {t("contact.inquiryType") as string}
                        </Label>
                        <Select
                          value={form.inquiryType === "" ? NONE_VALUE : form.inquiryType}
                          onValueChange={(v) =>
                            setForm({
                              ...form,
                              inquiryType:
                                v === NONE_VALUE
                                  ? ""
                                  : (v as "oem" | "odm" | "sample" | "other"),
                            })
                          }
                        >
                          <SelectTrigger id="inquiry-type" className="h-10 text-sm" data-testid="select-inquiry-type" aria-label={t("contact.inquiryTypePh") as string}>
                            <SelectValue placeholder={t("contact.inquiryTypePh") as string} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>
                              {t("contact.inquiryTypePh") as string}
                            </SelectItem>
                            <SelectItem value="oem">{inquiryTypeOptions.oem}</SelectItem>
                            <SelectItem value="odm">{inquiryTypeOptions.odm}</SelectItem>
                            <SelectItem value="sample">{inquiryTypeOptions.sample}</SelectItem>
                            <SelectItem value="other">{inquiryTypeOptions.other}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="productInterest" className="text-sm font-semibold text-slate-700">
                          {t("contact.productInterest") as string}
                        </Label>
                        <Input
                          id="productInterest"
                          placeholder={t("contact.productInterestPh") as string}
                          value={form.productInterest}
                          onChange={(e) => setForm({ ...form, productInterest: e.target.value })}
                          className="h-10 text-sm"
                          data-testid="input-product-interest"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="material" className="text-sm font-semibold text-slate-700">
                          {t("contact.material") as string}
                        </Label>
                        <Input
                          id="material"
                          placeholder={t("contact.materialPh") as string}
                          value={form.material}
                          onChange={(e) => setForm({ ...form, material: e.target.value })}
                          className="h-10 text-sm"
                          data-testid="input-material"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700">
                          {t("contact.quantity") as string}
                        </Label>
                        <Input
                          id="quantity"
                          placeholder={t("contact.quantityPh") as string}
                          value={form.quantity}
                          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                          className="h-10 text-sm"
                          data-testid="input-quantity"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="customization" className="text-sm font-semibold text-slate-700">
                        {t("contact.customization") as string}
                      </Label>
                      <Textarea
                        id="customization"
                        placeholder={t("contact.customizationPh") as string}
                        className="min-h-[80px] text-sm resize-none"
                        value={form.customization}
                        onChange={(e) => setForm({ ...form, customization: e.target.value })}
                        data-testid="textarea-customization"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="desc" className="text-sm font-semibold text-slate-700">
                        {t("contact.desc") as string} <span className="text-accent">*</span>
                      </Label>
                      <Textarea
                        id="desc"
                        required
                        placeholder={t("contact.descPh") as string}
                        className="min-h-[140px] text-sm resize-none"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        data-testid="textarea-message"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
                        {error}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                      <Button
                        type="submit"
                        disabled={createInquiry.isPending}
                        className="w-full sm:w-auto rounded-full bg-accent hover:bg-accent/90 text-white h-11 px-8 font-semibold"
                        data-testid="button-submit-contact"
                      >
                        {createInquiry.isPending ? (
                          "..."
                        ) : (
                          <>
                            {t("contact.submit") as string}
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                        <span>{t("contact.secure") as string}</span>
                      </div>
                    </div>
                  </form>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* SIDEBAR */}
            <motion.div variants={fadeUp} className="flex flex-col gap-6">
              {/* INFO CARD */}
              <div className="bg-[#0F172A] text-white rounded-2xl p-7">
                <h3 className="font-display text-xl font-bold mb-6">
                  {t("contact.infoHeading") as string}
                </h3>
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5">{t("contact.hq") as string}</p>
                      <p className="text-white/65 text-xs leading-relaxed whitespace-pre-line">
                        {t("contact.hqAddr") as string}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5">{t("contact.sales") as string}</p>
                      <p className="text-white/65 text-xs">official@dostac.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5">{t("contact.phone") as string}</p>
                      <p className="text-white/65 text-xs">070-4334-7333</p>
                      <p className="text-white/45 text-xs mt-0.5">
                        {t("contact.faxLabel") as string}: 0504-488-4345
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5">{t("contact.hours") as string}</p>
                      <p className="text-white/65 text-xs whitespace-pre-line">
                        {t("contact.hoursValue") as string}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MAP PLACEHOLDER */}
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 aspect-video relative shadow-sm">
                <Image
                  src={dostacImage("hero-about.webp")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="object-cover opacity-50"
                  alt="Dostac headquarters location — Gwangju, Gyeonggi-do, South Korea"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col text-[#0F172A]">
                  <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md mb-2">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-semibold text-sm bg-white/80 backdrop-blur px-3 py-1 rounded-full">
                    {t("contact.seoulLabel") as string}
                  </span>
                </div>
              </div>

              {/* TRUST NOTE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {t("contact.secure") as string}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t("contact.secureNote") as string}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ AFTER-SUBMISSION PROMISE TIMELINE ════════════════ */}
      <section className="relative bg-white py-16 md:py-20 border-t border-[#8B5E3C]/8 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,94,60,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <motion.p
              variants={fadeUp}
              className="text-[#8B5E3C] text-[10.5px] font-bold tracking-[0.3em] uppercase mb-3 inline-flex items-center gap-2.5"
            >
              <span className="w-5 h-px bg-[#8B5E3C]/60" />
              {t("contact.promiseEyebrow") as string}
              <span className="w-5 h-px bg-[#8B5E3C]/60" />
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-2xl md:text-[32px] font-bold text-[#2D2D2D] leading-[1.08] tracking-tight"
            >
              {t("contact.promiseHeading") as string}
            </motion.h2>
          </motion.div>

          {/* Timeline */}
          {(() => {
            const steps = (t("contact.promiseSteps") as unknown as Array<{ time: string; label: string; desc: string }>) ?? [];
            return (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                variants={stagger}
                className="relative"
              >
                {/* Connecting line (desktop only, behind cards) */}
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute top-[42px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-[#8B5E3C]/30 to-transparent"
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                    gap: "20px",
                  }}
                >
                  {steps.map((s, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      className="relative flex flex-col items-center text-center px-3"
                    >
                      {/* Number badge */}
                      <div className="relative z-10 mb-4">
                        <div className="relative w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full bg-white border-2 border-[#8B5E3C]/20 flex items-center justify-center promise-pulse">
                          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#A67043] flex items-center justify-center">
                            <span className="font-display text-[18px] font-bold text-white tracking-tight">
                              {s.time}
                            </span>
                          </div>
                        </div>
                        {/* Step number tiny indicator */}
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#8B5E3C]/20 flex items-center justify-center text-[9px] font-bold text-[#8B5E3C] shadow-sm">
                          0{i + 1}
                        </div>
                      </div>

                      {/* Label */}
                      <p className="text-[9.5px] uppercase tracking-[0.22em] text-[#8B5E3C] font-bold mb-1.5">
                        {s.label}
                      </p>

                      {/* Desc */}
                      <p className="text-[12.5px] text-[#2D2D2D]/65 leading-relaxed max-w-[220px]">
                        {s.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })()}

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-[10.5px] text-[#2D2D2D]/40 leading-relaxed mt-10 text-center max-w-2xl mx-auto"
          >
            {t("contact.promiseDisclaimer") as string}
          </motion.p>
        </div>

        <style jsx>{`
          @keyframes promise-pulse-ring {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(139, 94, 60, 0.15), 0 4px 12px -4px rgba(139, 94, 60, 0.20);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(139, 94, 60, 0), 0 4px 16px -4px rgba(139, 94, 60, 0.30);
            }
          }
          .promise-pulse {
            animation: promise-pulse-ring 2.8s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* ════════════════ FAQ — FAQPage rich-results + UX self-serve ════════════════ */}
      <section className="relative bg-[#F5F0E8] py-16 md:py-20 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(139,94,60,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="container mx-auto px-5 sm:px-6 max-w-3xl relative z-10">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-10"
          >
            <motion.p
              variants={fadeUp}
              className="text-[#8B5E3C] text-[10.5px] font-bold tracking-[0.3em] uppercase mb-3 inline-flex items-center gap-2.5"
            >
              <span className="w-5 h-px bg-[#8B5E3C]/60" />
              <HelpCircle className="h-3 w-3" strokeWidth={2} />
              {t("contact.faqEyebrow") as string}
              <span className="w-5 h-px bg-[#8B5E3C]/60" />
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-2xl md:text-[32px] font-bold text-[#2D2D2D] leading-[1.08] tracking-tight mb-3"
            >
              {t("contact.faqHeading") as string}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#2D2D2D]/55 text-[13.5px] leading-relaxed"
            >
              {t("contact.faqSub") as string}
            </motion.p>
          </motion.div>

          {/* Accordion (single, only one open at a time → cleaner mobile UX) */}
          {(() => {
            const faqs = (t("contact.faqs") as unknown as Array<{ q: string; a: string }>) ?? [];
            if (!Array.isArray(faqs) || faqs.length === 0) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Accordion
                  type="single"
                  collapsible
                  className="rounded-2xl border border-[#8B5E3C]/15 bg-white divide-y divide-[#8B5E3C]/10 contact-faq-shadow"
                >
                  {faqs.map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border-none">
                      <AccordionTrigger className="px-5 py-4 text-left hover:no-underline group">
                        <span className="flex items-baseline gap-3 text-[14px] md:text-[14.5px] font-display font-medium text-[#2D2D2D] leading-snug pr-3">
                          <span className="text-[10px] font-mono text-[#8B5E3C] tracking-tight shrink-0 mt-0.5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="group-hover:text-[#8B5E3C] transition-colors">
                            {item.q}
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-4 pl-[42px] text-[12.5px] md:text-[13px] text-[#2D2D2D]/65 leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            );
          })()}

          {/* Footer prompt */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8 text-[12px] text-[#2D2D2D]/50"
          >
            <span>Still have questions? </span>
            <a href="#contact-form" className="text-[#8B5E3C] hover:underline font-semibold">
              Send us a message →
            </a>
          </motion.p>
        </div>

        <style jsx>{`
          .contact-faq-shadow {
            box-shadow:
              0 1px 2px rgba(139, 94, 60, 0.04),
              0 8px 24px -8px rgba(139, 94, 60, 0.10);
          }
        `}</style>
      </section>
    </>
  );
}

export default function Contact() {
  return (
    <Layout>
      <Suspense fallback={null}>
        <ContactContent />
      </Suspense>
    </Layout>
  );
}
