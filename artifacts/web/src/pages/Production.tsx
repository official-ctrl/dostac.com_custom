import React from "react";
import { Link } from "wouter";
import { Loader2, BadgeCheck, ArrowRight, PenSquare, FlaskConical, Factory as FactoryIcon } from "lucide-react";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT } from "@/components/dostac/i18n";
import { useGetPublicProcess } from "@workspace/api-client-react";
import type { Lang } from "@/components/dostac/i18n";
import { useLang } from "@/components/dostac/i18n";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function pickLang(obj: unknown, prefix: string, lang: Lang): string {
  if (!obj || typeof obj !== "object") return "";
  const key = `${prefix}${cap(lang)}`;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "string" ? v : "";
}

const STEP_ICONS = [PenSquare, FlaskConical, FactoryIcon];

function ProductionContent() {
  const { t } = useT();
  const { lang } = useLang();
  const { data, isLoading } = useGetPublicProcess();

  if (isLoading || !data) {
    return (
      <div className="container mx-auto py-32 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const oemDesc = pickLang(data, "oemDescription", lang);
  const certIntro = pickLang(data, "certIntro", lang);

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={data.oemImageUrl ?? dostacImage("hero-production.webp")}
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/55 via-primary/45 to-primary/65"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
            {t("production.heroTitle") as string}
          </h1>
        </div>
      </section>

      {/* OEM/ODM SECTION */}
      <section id="oem" className="py-24 bg-white scroll-mt-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">
              {t("production.sections.oem") as string}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-5">
              {t("production.oemHeading") as string}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{oemDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {data.oemSteps.map((step, idx) => {
              const Icon = STEP_ICONS[idx % STEP_ICONS.length] ?? PenSquare;
              const title = pickLang(step, "title", lang);
              const desc = pickLang(step, "description", lang);
              return (
                <div
                  key={idx}
                  className="relative bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 flex flex-col items-center text-center"
                  data-testid={`oem-step-${idx}`}
                >
                  {idx < data.oemSteps.length - 1 && (
                    <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-6 h-6 z-10" />
                  )}
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-accent" />
                  </div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {t("production.stepLabel") as string} {idx + 1}
                  </div>
                  <div className="font-display font-bold text-xl text-primary mb-3">{title}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GLOBAL CERTIFICATIONS SECTION */}
      <section id="cert" className="py-24 bg-muted/30 scroll-mt-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">
              {t("production.sections.cert") as string}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-5">
              {t("production.certsHeading") as string}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{certIntro}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.certItems.map((cert, idx) => {
              const name = pickLang(cert, "name", lang);
              const desc = pickLang(cert, "description", lang);
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-xl border border-slate-200 hover:border-accent hover:shadow-md transition-all duration-300 flex flex-col"
                  data-testid={`cert-item-${idx}`}
                >
                  <div className="w-16 h-16 rounded-md bg-muted/50 border border-slate-200 flex items-center justify-center mb-4 overflow-hidden">
                    {cert.imageUrl ? (
                      <img src={cert.imageUrl} alt={cert.code} className="w-full h-full object-contain" />
                    ) : (
                      <BadgeCheck className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-accent mb-1.5 uppercase tracking-wider">
                    {cert.code}
                  </div>
                  <h4 className="font-display font-bold text-base text-primary mb-2">{name}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl font-bold mb-6">{t("production.ctaHeading") as string}</h2>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-sm bg-accent px-8 text-base font-medium text-white shadow hover:bg-accent/90 transition-colors"
          >
            {t("production.ctaButton") as string}
          </Link>
        </div>
      </section>
    </>
  );
}

export default function Production() {
  return (
    <Layout>
      <ProductionContent />
    </Layout>
  );
}
