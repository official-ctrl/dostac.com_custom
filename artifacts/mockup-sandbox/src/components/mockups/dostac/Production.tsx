import React from "react";
import { Layout } from "./_shared/Layout";
import { CheckCircle2, ShieldCheck, BadgeCheck, FileText, ArrowRight } from "lucide-react";
import { useT } from "./_shared/i18n";

function ProductionContent() {
  const { t } = useT();
  const certificates = t("production.certs") as Array<{ name: string; body: string; desc: string }>;
  const qaSteps = t("production.qaSteps") as Array<{ title: string; desc: string }>;
  const stepIcons = [ShieldCheck, Factory, CheckCircle2, FileText];

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-production.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">{t("production.heroTitle")}</h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-xl text-muted-foreground leading-relaxed">{t("production.intro")}</p>
        </div>
      </section>

      {/* QUALITY ASSURANCE PROCESS */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-center text-primary mb-16">{t("production.qaHeading")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {qaSteps.map((step, idx) => {
              const Icon = stepIcons[idx];
              return (
                <div key={idx} className="relative bg-white p-8 rounded-xl border shadow-sm flex flex-col items-center text-center">
                  {idx < 3 && <ArrowRight className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-muted-foreground w-8 h-8 z-10" />}
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <div className="font-display font-bold text-lg text-primary mb-3">
                    {t("production.stepLabel")} {idx + 1}: <br/>{step.title}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CERTIFICATES GRID */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-primary mb-4">{t("production.certsHeading")}</h2>
            <p className="text-muted-foreground text-lg">{t("production.certsSub")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, idx) => (
              <div key={idx} className="flex gap-4 p-6 border rounded-xl hover:border-accent hover:shadow-md transition-all duration-300">
                <div className="shrink-0 w-16 h-16 rounded bg-muted/50 border flex items-center justify-center">
                  <BadgeCheck className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-primary mb-1">{cert.name}</h4>
                  <p className="text-xs font-semibold text-accent mb-2">{cert.body}</p>
                  <p className="text-sm text-muted-foreground">{cert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl font-bold mb-6">{t("production.ctaHeading")}</h2>
          <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-12 items-center justify-center rounded-sm bg-accent px-8 text-base font-medium text-white shadow hover:bg-accent/90 transition-colors">
            {t("production.ctaButton")}
          </a>
        </div>
      </section>
    </>
  );
}

export function Production() {
  return (
    <Layout>
      <ProductionContent />
    </Layout>
  );
}

function Factory(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </svg>
  );
}
