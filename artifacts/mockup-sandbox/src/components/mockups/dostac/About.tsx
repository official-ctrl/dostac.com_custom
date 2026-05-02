import React from "react";
import { Shield, Award, Lightbulb } from "lucide-react";
import { Layout } from "./_shared/Layout";
import { useT } from "./_shared/i18n";

function AboutContent() {
  const { t } = useT();
  const greetings = t("about.greetings") as string[];
  const steps = t("about.steps") as Array<{ step: string; title: string }>;
  const philosophy = t("about.philosophy") as Array<{ title: string; desc: string }>;
  const philosophyIcons = [Shield, Award, Lightbulb];
  const history = t("about.history") as Array<{ year: string; title: string; desc: string }>;

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-about.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">{t("about.heroTitle")}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">{t("about.heroSub")}</p>
        </div>
      </section>

      {/* GREETINGS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-primary mb-8">{t("about.greetingsHeading")}</h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                {greetings.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="mt-10 pt-8 border-t border-border">
                <p className="font-display font-bold text-xl text-primary">{t("about.signature")}</p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square md:aspect-[4/3] rounded-xl overflow-hidden shadow-xl border">
                <img src="/__mockup/images/dostac/ceo-portrait.png" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-8 shadow-lg border rounded-lg max-w-xs hidden md:block">
                <p className="font-display font-semibold text-primary italic">{t("about.quote")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW & PROCESS FLOW */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-primary mb-6">{t("about.overviewHeading")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("about.overviewBody")}</p>
          </div>

          <div className="relative mt-16 max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              {steps.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-accent flex items-center justify-center mb-4 shadow-sm relative">
                    <span className="font-display font-bold text-accent text-xl">{item.step}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-primary max-w-[120px]">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold mb-16">{t("about.philosophyHeading")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {philosophy.map((p, i) => {
              const Icon = philosophyIcons[i];
              return (
                <div key={i} className="p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm text-left">
                  <Icon className="w-12 h-12 text-accent mb-6" />
                  <h3 className="font-display text-2xl font-bold mb-4 text-white">{p.title}</h3>
                  <p className="text-white/80 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HISTORY TIMELINE */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-primary mb-6">{t("about.historyHeading")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("about.historyBody")}</p>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {history.map((item, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-accent text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border bg-card shadow-sm">
                  <span className="font-display font-bold text-accent text-xl mb-1 block">{item.year}</span>
                  <h4 className="font-semibold text-primary mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function About() {
  return (
    <Layout>
      <AboutContent />
    </Layout>
  );
}
