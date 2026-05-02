import React from "react";
import { ArrowRight, Globe, ShieldCheck, Factory } from "lucide-react";
import { Layout } from "./_shared/Layout";
import { useT } from "./_shared/i18n";

function HomeContent() {
  const { t } = useT();
  const products = (t("products.items") as Array<{ id: string; name: string; headline: string }>).slice(0, 8);
  const productImages = [
    "/__mockup/images/dostac/product-01.png",
    "/__mockup/images/dostac/product-02.png",
    "/__mockup/images/dostac/product-03.png",
    "/__mockup/images/dostac/product-04.png",
    "/__mockup/images/dostac/product-05.png",
    "/__mockup/images/dostac/product-06.png",
    "/__mockup/images/dostac/product-07.png",
    "/__mockup/images/dostac/product-08.png",
  ];
  const strengths = t("home.strengths") as Array<{ title: string; desc: string }>;
  const stats = t("home.stats") as Array<{ value: string; label: string }>;
  const strengthIcons = [Globe, ShieldCheck, Factory];

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-home.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-white">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6">{t("home.heroTitle")}</h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl">{t("home.heroBody")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/__mockup/preview/dostac/Products" className="inline-flex h-12 items-center justify-center rounded-sm bg-accent px-8 text-base font-medium text-white shadow hover:bg-accent/90 transition-colors">{t("home.heroCta1")}</a>
              <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-12 items-center justify-center rounded-sm border border-white/30 bg-white/10 backdrop-blur-sm px-8 text-base font-medium text-white hover:bg-white/20 transition-colors">{t("home.heroCta2")}</a>
            </div>
          </div>
        </div>
      </section>

      {/* CORE STRENGTHS */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {strengths.map((s, i) => {
              const Icon = strengthIcons[i];
              return (
                <div key={i} className="bg-white p-10 border shadow-sm rounded-xl hover:-translate-y-1 transition-transform duration-300">
                  <Icon className="h-10 w-10 text-accent mb-6" />
                  <h3 className="font-display text-xl font-bold text-primary mb-4">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-primary-foreground/20">
            {stats.map((s, i) => (
              <div key={i} className="py-4">
                <div className="font-display text-5xl font-bold text-white mb-2">{s.value}</div>
                <div className="text-primary-foreground/80 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">{t("home.featuredHeading")}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">{t("home.featuredSub")}</p>
            </div>
            <a href="/__mockup/preview/dostac/Products" className="hidden md:inline-flex items-center text-accent font-medium hover:text-primary transition-colors">
              {t("home.featuredCta")} <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <a key={product.id} href="/__mockup/preview/dostac/Products" className="group block">
                <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden mb-4 border">
                  <img src={productImages[i]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h4 className="font-display font-semibold text-lg text-primary mb-1 group-hover:text-accent transition-colors">{product.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.headline}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-20 bg-muted/50 border-t">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">{t("home.ctaHeading")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">{t("home.ctaBody")}</p>
          <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-14 items-center justify-center rounded-sm bg-primary px-10 text-base font-medium text-white shadow hover:bg-primary/90 transition-colors">
            {t("home.ctaButton")} <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </>
  );
}

export function Home() {
  return (
    <Layout>
      <HomeContent />
    </Layout>
  );
}
