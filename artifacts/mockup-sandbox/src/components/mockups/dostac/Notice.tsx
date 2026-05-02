import React from "react";
import { Layout } from "./_shared/Layout";
import {
  ArrowRight, Calendar, Tag, Megaphone, Sparkles, Globe2, Award, ChevronRight, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "./_shared/i18n";

function NoticeContent() {
  const { t } = useT();
  const categories = t("notice.categories") as Array<{ name: string; count: number }>;
  const categoryIcons = [null, Megaphone, Sparkles, Globe2, Award];
  const newProducts = t("notice.newProducts") as Array<{ tag: string; title: string; date: string; excerpt: string }>;
  const archive = t("notice.archive") as Array<{ category: string; date: string; title: string }>;
  const productImages = [
    "/__mockup/images/dostac/product-pore-strips.png",
    "/__mockup/images/dostac/product-spot-patches.png",
    "/__mockup/images/dostac/product-baby-wipes.png",
  ];

  const categoryColor = (c: string) => {
    const lower = c.toLowerCase();
    if (lower.includes("company") || lower.includes("회사") || lower.includes("公司") || lower.includes("công ty")) return "bg-primary/10 text-primary";
    if (lower.includes("new") || lower.includes("신제품") || lower.includes("新品") || lower.includes("新製品") || lower.includes("sản phẩm mới")) return "bg-accent/15 text-accent";
    if (lower.includes("exhib") || lower.includes("전시") || lower.includes("展") || lower.includes("triển lãm")) return "bg-amber-100 text-amber-800";
    if (lower.includes("cert") || lower.includes("인증") || lower.includes("认证") || lower.includes("認証") || lower.includes("chứng nhận")) return "bg-emerald-100 text-emerald-800";
    if (lower.includes("industry") || lower.includes("산업") || lower.includes("行业") || lower.includes("業界") || lower.includes("ngành")) return "bg-slate-200 text-slate-800";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[360px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-home.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-primary/85 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-white">
          <p className="uppercase tracking-[0.3em] text-xs text-accent mb-4">{t("notice.eyebrow")}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-3xl">{t("notice.heroTitle")}</h1>
          <p className="max-w-2xl text-white/85 text-lg leading-relaxed">{t("notice.heroBody")}</p>
        </div>
      </section>

      {/* CATEGORY + SEARCH BAR */}
      <section className="border-b bg-white sticky top-20 z-40">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c, i) => {
              const Icon = categoryIcons[i];
              const active = i === 0;
              return (
                <button
                  key={c.name}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {c.name}
                  <span className={`text-xs ${active ? "text-primary-foreground/70" : "text-slate-500"}`}>{c.count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder={t("notice.searchPlaceholder")} className="pl-9 h-10 rounded-full" />
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="relative h-[420px] rounded-md overflow-hidden shadow-lg">
              <img src="/__mockup/images/dostac/hero-home.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <span className={`absolute top-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${categoryColor(t("notice.featuredCategory"))}`}>
                <Tag className="h-3 w-3" />
                {t("notice.featuredCategory")}
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">{t("notice.featuredEyebrow")}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight mb-5">{t("notice.featuredTitle")}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {t("notice.featuredDate")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Globe2 className="h-4 w-4" /> {t("notice.featuredRegion")}
                </span>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">{t("notice.featuredExcerpt")}</p>
              <Button className="rounded-sm h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                {t("notice.featuredButton")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* NEW PRODUCT UPDATES */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-2">{t("notice.pipelineEyebrow")}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">{t("notice.pipelineHeading")}</h2>
            </div>
            <a href="/__mockup/preview/dostac/Products" className="text-sm font-semibold text-primary hover:text-accent inline-flex items-center gap-1">
              {t("notice.pipelineViewAll")} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newProducts.map((p, i) => (
              <article key={i} className="group bg-white rounded-md overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-200/60">
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img src={productImages[i]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-semibold">
                    <Sparkles className="h-3 w-3" /> {p.tag}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-2 mb-3">
                    <Calendar className="h-3 w-3" /> {p.date}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-primary leading-snug mb-3 group-hover:text-accent transition-colors">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{p.excerpt}</p>
                  <a href="#" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:text-accent">
                    {t("common.learnMore")} <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHIVE LIST */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-2">{t("notice.archiveEyebrow")}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">{t("notice.archiveHeading")}</h2>
          </div>

          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {archive.map((item, i) => (
              <a key={i} href="#" className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-8 py-6 px-2 hover:bg-slate-50 transition-colors">
                <span className={`inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${categoryColor(item.category)}`}>
                  {item.category}
                </span>
                <span className="text-sm text-muted-foreground inline-flex items-center gap-2 md:w-44 shrink-0">
                  <Calendar className="h-4 w-4" /> {item.date}
                </span>
                <h3 className="flex-1 font-medium text-primary group-hover:text-accent transition-colors">{item.title}</h3>
                <ChevronRight className="hidden md:block h-5 w-5 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </a>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-center gap-2 mt-10">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={`h-10 w-10 rounded-sm text-sm font-medium transition ${
                n === 1 ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}>{n}</button>
            ))}
            <button className="h-10 px-4 rounded-sm text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 inline-flex items-center gap-1">
              {t("common.next")} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">{t("notice.ctaHeading")}</h3>
            <p className="text-primary-foreground/80 max-w-xl">{t("notice.ctaBody")}</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <Input placeholder={t("notice.ctaPlaceholder")} className="h-12 md:w-72 bg-white text-primary" />
            <Button className="h-12 px-6 rounded-sm bg-accent hover:bg-accent/90 text-white whitespace-nowrap">
              {t("notice.ctaButton")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export function Notice() {
  return (
    <Layout>
      <NoticeContent />
    </Layout>
  );
}
