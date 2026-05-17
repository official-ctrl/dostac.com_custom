import React, { useRef, useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, CheckCircle2 } from "lucide-react";
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
import { useCreateContactInquiry } from "@workspace/api-client-react";

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
  const successRef = useRef<HTMLDivElement>(null);
  const inquiryTypeOptions = t("contact.inquiryTypeOptions") as {
    oem: string;
    odm: string;
    sample: string;
    other: string;
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: "" as "" | "oem" | "odm" | "sample" | "other",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInquiry = useCreateContactInquiry({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        setError(null);
        setForm({ name: "", email: "", company: "", inquiryType: "", message: "" });
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
        message: form.message,
      },
    });
  };

  return (
    <>
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={dostacImage("hero-contact.webp")}
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/55 via-primary/45 to-primary/65"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">
            {t("contact.heroTitle") as string}
          </h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
            {t("contact.heroBody") as string}
          </p>
        </div>
      </section>

      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border p-8 md:p-12">
              <h2 className="font-display text-3xl font-bold text-primary mb-8">
                {t("contact.formHeading") as string}
              </h2>

              {success && (
                <div
                  ref={successRef}
                  role="status"
                  data-testid="contact-success"
                  className="mb-6 flex items-start gap-3 rounded-md border border-green-300 bg-green-50 p-5 text-green-800"
                >
                  <CheckCircle2 className="h-6 w-6 mt-0.5 shrink-0 text-green-600" />
                  <div>
                    <div className="font-semibold text-base">
                      {(SUCCESS_MSG[lang] ?? SUCCESS_MSG.en).title}
                    </div>
                    <div className="text-sm mt-1 text-green-700">
                      {(SUCCESS_MSG[lang] ?? SUCCESS_MSG.en).body}
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div
                  className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={onSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("contact.name") as string}</Label>
                    <Input
                      id="name"
                      required
                      placeholder={t("contact.namePh") as string}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("contact.email") as string}</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder={t("contact.emailPh") as string}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">{t("contact.company") as string}</Label>
                    <Input
                      id="company"
                      placeholder={t("contact.companyPh") as string}
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      data-testid="input-company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-type">{t("contact.inquiryType") as string}</Label>
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
                      <SelectTrigger id="inquiry-type" data-testid="select-inquiry-type">
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

                <div className="space-y-2">
                  <Label htmlFor="desc">{t("contact.desc") as string}</Label>
                  <Textarea
                    id="desc"
                    required
                    placeholder={t("contact.descPh") as string}
                    className="min-h-[150px]"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    data-testid="textarea-message"
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={createInquiry.isPending}
                    className="w-full sm:w-auto px-10 h-14 bg-accent hover:bg-accent/90 text-white font-medium"
                    data-testid="button-submit-contact"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {createInquiry.isPending ? "..." : (t("contact.submit") as string)}
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span>{t("contact.secure") as string}</span>
                  </div>
                </div>
              </form>
            </div>

            <div className="space-y-8">
              <div className="bg-primary text-white rounded-xl shadow-lg p-8">
                <h3 className="font-display text-2xl font-bold mb-8">
                  {t("contact.infoHeading") as string}
                </h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{t("contact.hq") as string}</h4>
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                        {t("contact.hqAddr") as string}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{t("contact.sales") as string}</h4>
                      <p className="text-white/80 text-sm">info@dostac.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{t("contact.phone") as string}</h4>
                      <p className="text-white/80 text-sm">070-4334-7333</p>
                      <p className="text-white/60 text-xs mt-0.5">{t("contact.faxLabel") as string}: 0504-488-4345</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{t("contact.hours") as string}</h4>
                      <p className="text-white/80 text-sm whitespace-pre-line">
                        {t("contact.hoursValue") as string}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-xl overflow-hidden aspect-video border relative">
                <img
                  src={dostacImage("hero-about.webp")}
                  className="w-full h-full object-cover opacity-60"
                  alt=""
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col text-primary">
                  <MapPin className="w-8 h-8 mb-2" />
                  <span className="font-semibold text-sm">
                    {t("contact.seoulLabel") as string}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
