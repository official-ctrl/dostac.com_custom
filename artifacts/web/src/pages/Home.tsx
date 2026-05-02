import React from "react";
import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Layers, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang } from "@/components/dostac/i18n";
import { useListPublicProducts } from "@workspace/api-client-react";

const STRENGTH_ICONS = [Layers, ShieldCheck, Sparkles];

function HomeContent() {
  const { t } = useT();
  const { lang } = useLang();
  const strengths = t("home.strengths") as Array<{ title: string; desc: string }>;
  const stats = t("home.stats") as Array<{ value: string; label: string }>;
  const productsQuery = useListPublicProducts({ lang });
  const featured = (productsQuery.data ?? []).slice(0, 8);

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={dostacImage("hero-home.png")} alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/65 to-primary/35"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-white max-w-4xl">
          <p className="uppercase tracking-[0.3em] text-xs text-accent font-semibold mb-5">DIO STAC Co., Ltd.</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.1] mb-6">{t("home.heroTitle") as string}</h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-10 max-w-2xl">{t("home.heroBody") as string}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products">
              <Button size="lg" className="rounded-sm bg-accent hover:bg-accent/90 text-white h-12 px-8 text-base font-medium">
                {t("home.heroCta1") as string} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-sm border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white h-12 px-8 text-base font-medium">
                {t("home.heroCta2") as string}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STRENGTHS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {strengths.map((s, i) => {
              const Icon = STRENGTH_ICONS[i] ?? Layers;
              return (
                <div key={i} className="bg-white border border-slate-200/70 p-8 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-primary mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="font-display text-5xl font-bold text-accent mb-2">{s.value}</div>
              <div className="text-sm uppercase tracking-wider text-white/80">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS (live) */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">{t("home.featuredHeading") as string}</h2>
            <p className="text-lg text-muted-foreground">{t("home.featuredSub") as string}</p>
          </div>

          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
                  <div className="aspect-square bg-slate-100 animate-pulse" />
                  <div className="p-5 space-y-2">
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featured.map((p, i) => (
                <Link key={p.id} href="/products" className="group bg-white rounded-xl border border-slate-200/60 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={p.imageUrl ?? dostacImage(`product-${String((i % 10) + 1).padStart(2, "0")}.png`)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-1.5">{p.category}</p>
                    <h3 className="font-display font-bold text-primary group-hover:text-accent transition-colors leading-snug">{p.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="rounded-sm bg-primary hover:bg-primary/90 text-white h-12 px-8 font-medium">
                {t("home.featuredCta") as string} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={dostacImage("hero-production.png")} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-5">{t("home.ctaHeading") as string}</h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">{t("home.ctaBody") as string}</p>
          <Link href="/contact">
            <Button size="lg" className="rounded-sm bg-accent hover:bg-accent/90 text-white h-12 px-10 text-base font-medium">
              {t("home.ctaButton") as string} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  return (
    <Layout>
      <HomeContent />
    </Layout>
  );
}
