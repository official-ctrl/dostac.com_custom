import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, CheckCircle2, Package } from "lucide-react";
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
import { useT } from "@/components/dostac/i18n";
import { useSearch } from "wouter";
import { useCreateContactInquiry, useGetPublicProduct, getGetPublicProductQueryKey } from "@workspace/api-client-react";

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
  const search = useSearch();
  const successRef = useRef<HTMLDivElement>(null);
  const inquiryTypeOptions = t("contact.inquiryTypeOptions") as {
    oem: string;
    odm: string;
    sample: string;
    other: string;
  };

  const prefillInquiryType = parseInquiryType(search);
  const prefillProductSlug = new URLSearchParams(search).get("product") ?? "";

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
    const scrollAndHighlight = (el: HTMLElement) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
      if (!reduced) {
        setFormHighlight(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setFormHighlight(true));
        });
      }
    };

    const params = new URLSearchParams(search);
    const source = params.get("source");
    const shouldScroll =
      window.location.hash === "#contact-form" ||
      source === "about" ||
      source === "production";
    if (shouldScroll) {
      const el = document.getElementById("contact-form");
      if (el) scrollAndHighlight(el);
    }

    const handleHashChange = () => {
      if (window.location.hash === "#contact-form") {
        const el = document.getElementById("contact-form");
        if (el) scrollAndHighlight(el);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [search]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: prefillInquiryType as "" | "oem" | "odm" | "sample" | "other",
    whatsapp: "",
    country: "",
    productInterest: "",
    material: "",
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
        setForm({ name: "", email: "", company: "", inquiryType: "", whatsapp: "", country: "", productInterest: "", material: "", quantity: "", customization: "", message: "" });
        setTimeout(() => {
          successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
        setError(msg);
        setSuccess(false);
      },
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError(t("contact.validationRequired") as string);
      return;
    }
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
      },
    });
  };

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={dostacImage("hero-contact.webp")}
            alt=""
            fetchPriority="high"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/55 via-primary/45 to-primary/65" />
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6"
          >
            {t("contact.heroTitle") as string}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            {t("contact.heroBody") as string}
          </motion.p>
        </div>
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

                {success && (
                  <div
                    ref={successRef}
                    role="status"
                    data-testid="contact-success"
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
                  </div>
                )}

                {!success && (
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
                          <SelectTrigger id="inquiry-type" className="h-10 text-sm" data-testid="select-inquiry-type">
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
                )}
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
                <img
                  src={dostacImage("hero-about.webp")}
                  className="w-full h-full object-cover opacity-50"
                  alt=""
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
    </>
  );
}

export default function Contact() {
  return (
    <Layout>
      <ContactContent />
    </Layout>
  );
}
