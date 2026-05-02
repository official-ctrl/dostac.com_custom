import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Calendar, Tag, Globe2, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang } from "@/components/dostac/i18n";
import { useListPublicNotices } from "@workspace/api-client-react";

const PAGE_SIZE = 8;

function categoryColor(c: string) {
  const lower = c.toLowerCase();
  if (lower.includes("company") || lower.includes("회사") || lower.includes("公司") || lower.includes("công ty")) return "bg-primary/10 text-primary";
  if (lower.includes("new") || lower.includes("신제품") || lower.includes("新品") || lower.includes("新製品") || lower.includes("sản phẩm mới")) return "bg-accent/15 text-accent";
  if (lower.includes("exhib") || lower.includes("전시") || lower.includes("展") || lower.includes("triển lãm")) return "bg-amber-100 text-amber-800";
  if (lower.includes("cert") || lower.includes("인증") || lower.includes("认证") || lower.includes("認証") || lower.includes("chứng nhận")) return "bg-emerald-100 text-emerald-800";
  if (lower.includes("industry") || lower.includes("산업") || lower.includes("行业") || lower.includes("業界") || lower.includes("ngành")) return "bg-slate-200 text-slate-800";
  return "bg-slate-100 text-slate-700";
}

function formatDate(iso: string, lang: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : lang === "ja" ? "ja-JP" : lang === "zh" ? "zh-CN" : lang === "vi" ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

function NoticeContent() {
  const { t } = useT();
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  const noticesQuery = useListPublicNotices({ lang, search: search || undefined, category: activeCategory });
  const notices = noticesQuery.data ?? [];

  const allCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of notices) counts.set(n.category, (counts.get(n.category) ?? 0) + 1);
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [notices]);

  const featured = notices[0];
  const archive = notices.slice(1);
  const totalPages = Math.max(1, Math.ceil(archive.length / PAGE_SIZE));
  const visible = archive.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <section className="relative w-full h-[360px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={dostacImage("hero-home.png")} alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/75 via-primary/45 to-primary/30"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-white">
          <p className="uppercase tracking-[0.3em] text-xs text-accent mb-4">{t("notice.eyebrow") as string}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-3xl">{t("notice.heroTitle") as string}</h1>
          <p className="max-w-2xl text-white/85 text-lg leading-relaxed">{t("notice.heroBody") as string}</p>
        </div>
      </section>

      <section className="border-b bg-white sticky top-20 z-40">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => { setActiveCategory(undefined); setPage(1); }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === undefined ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All <span className={`text-xs ${activeCategory === undefined ? "text-primary-foreground/70" : "text-slate-500"}`}>{notices.length}</span>
            </button>
            {allCategories.map((c) => {
              const active = activeCategory === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => { setActiveCategory(c.name); setPage(1); }}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {c.name}
                  <span className={`text-xs ${active ? "text-primary-foreground/70" : "text-slate-500"}`}>{c.count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t("notice.searchPlaceholder") as string}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-10 rounded-full"
            />
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="relative h-[420px] rounded-md overflow-hidden shadow-lg bg-slate-200">
                <img src={featured.thumbnailUrl ?? dostacImage("hero-home.png")} alt={featured.title} className="absolute inset-0 w-full h-full object-cover" />
                <span className={`absolute top-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${categoryColor(featured.category)}`}>
                  <Tag className="h-3 w-3" />
                  {featured.category}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">{t("notice.featuredEyebrow") as string}</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight mb-5">{featured.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                  <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatDate(featured.publishedAt, lang)}</span>
                  {featured.region && <span className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4" /> {featured.region}</span>}
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">{featured.excerpt}</p>
                <Link href={`/notice#${featured.slug}`}>
                  <Button className="rounded-sm h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                    {t("notice.featuredButton") as string} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ARCHIVE */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-2">{t("notice.archiveEyebrow") as string}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">{t("notice.archiveHeading") as string}</h2>
          </div>

          {noticesQuery.isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading…</div>
          ) : visible.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No announcements yet.</div>
          ) : (
            <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
              {visible.map((item) => (
                <div key={item.id} id={item.slug} className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-8 py-6 px-2 hover:bg-slate-50 transition-colors">
                  <span className={`inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${categoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <span className="text-sm text-muted-foreground inline-flex items-center gap-2 md:w-44 shrink-0">
                    <Calendar className="h-4 w-4" /> {formatDate(item.publishedAt, lang)}
                  </span>
                  <h3 className="flex-1 font-medium text-primary group-hover:text-accent transition-colors">{item.title}</h3>
                  <ChevronRight className="hidden md:block h-5 w-5 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-10 w-10 rounded-sm text-sm font-medium transition ${
                    n === page ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {n}
                </button>
              ))}
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="h-10 px-4 rounded-sm text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 inline-flex items-center gap-1"
                >
                  {t("common.next") as string} <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">{t("notice.ctaHeading") as string}</h3>
            <p className="text-primary-foreground/80 max-w-xl">{t("notice.ctaBody") as string}</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <Input placeholder={t("notice.ctaPlaceholder") as string} className="h-12 md:w-72 bg-white text-primary" />
            <Button className="h-12 px-6 rounded-sm bg-accent hover:bg-accent/90 text-white whitespace-nowrap">
              {t("notice.ctaButton") as string} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Notice() {
  return (
    <Layout>
      <NoticeContent />
    </Layout>
  );
}
