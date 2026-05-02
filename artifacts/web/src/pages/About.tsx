import React from "react";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT } from "@/components/dostac/i18n";
import { Quote, Shield, Award, Lightbulb } from "lucide-react";

const PHIL_ICONS = [Shield, Award, Lightbulb];

function AboutContent() {
  const { t } = useT();
  const greetings = t("about.greetings") as string[];
  const steps = t("about.steps") as Array<{ step: string; title: string }>;
  const philosophy = t("about.philosophy") as Array<{ title: string; desc: string }>;
  const history = t("about.history") as Array<{ year: string; title: string; desc: string }>;

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[420px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={dostacImage("hero-about.png")} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/65 via-primary/55 to-primary/75"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{t("about.heroTitle") as string}</h1>
          <p className="text-lg md:text-xl text-white/85">{t("about.heroSub") as string}</p>
        </div>
      </section>

      {/* GREETINGS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border bg-muted">
              <img src={dostacImage("ceo-portrait.png")} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-3">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">{t("about.greetingsHeading") as string}</h2>
            <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
              {greetings.map((g, i) => <p key={i}>{g}</p>)}
            </div>
            <div className="mt-8 border-l-4 border-accent pl-5 py-2">
              <p className="font-display italic text-xl text-primary leading-snug">
                <Quote className="inline w-5 h-5 text-accent mr-1 -mt-2" />{t("about.quote") as string}
              </p>
            </div>
            <p className="mt-6 text-sm font-semibold text-accent">— {t("about.signature") as string}</p>
          </div>
        </div>
      </section>

      {/* OVERVIEW + STEPS */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-primary mb-6">{t("about.overviewHeading") as string}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed text-center max-w-3xl mx-auto mb-14">{t("about.overviewBody") as string}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((s, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 text-center shadow-sm">
                <div className="font-display text-2xl font-bold text-accent mb-1">{s.step}</div>
                <div className="text-sm font-semibold text-primary">{s.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-primary mb-14">{t("about.philosophyHeading") as string}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {philosophy.map((p, i) => {
              const Icon = PHIL_ICONS[i] ?? Shield;
              return (
                <div key={i} className="text-center p-8 rounded-xl border bg-white hover:shadow-md transition">
                  <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-primary mb-3 tracking-wide">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HISTORY */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-center">{t("about.historyHeading") as string}</h2>
          <p className="text-white/80 text-center leading-relaxed mb-14 max-w-2xl mx-auto">{t("about.historyBody") as string}</p>
          <div className="space-y-8 relative">
            <div className="absolute left-[50px] top-2 bottom-2 w-px bg-accent/30 hidden md:block" />
            {history.map((h, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4 md:gap-8 items-start">
                <div className="font-display text-2xl font-bold text-accent">{h.year}</div>
                <div className="bg-white/5 backdrop-blur rounded-lg p-5 border border-white/10">
                  <h4 className="font-display font-bold text-lg mb-2">{h.title}</h4>
                  <p className="text-sm text-white/70 leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default function About() {
  return (
    <Layout>
      <AboutContent />
    </Layout>
  );
}
