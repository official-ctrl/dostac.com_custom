import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  ArrowRight,
  Calendar,
  Tag,
  Globe2,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang } from "@/components/dostac/i18n";
import { getListPublicNoticesQueryOptions } from "@workspace/api-client-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { NOTICES_META } from "@/hooks/page-meta-config";

const PAGE_SIZE = 9;

function categoryColor(c: string) {
  const lower = c.toLowerCase();
  if (
    lower.includes("company") ||
    lower.includes("회사") ||
    lower.includes("公司") ||
    lower.includes("công ty")
  )
    return "bg-primary/10 text-primary";
  if (
    lower.includes("new") ||
    lower.includes("신제품") ||
    lower.includes("新品") ||
    lower.includes("sản phẩm mới")
  )
    return "bg-accent/15 text-accent";
  if (
    lower.includes("exhib") ||
    lower.includes("전시") ||
    lower.includes("展") ||
    lower.includes("triển lãm")
  )
    return "bg-amber-100 text-amber-800";
  if (
    lower.includes("cert") ||
    lower.includes("인증") ||
    lower.includes("认证") ||
    lower.includes("chứng nhận")
  )
    return "bg-emerald-100 text-emerald-800";
  if (
    lower.includes("trend") ||
    lower.includes("oem") ||
    lower.includes("export") ||
    lower.includes("ecommerce") ||
    lower.includes("e-commerce")
  )
    return "bg-violet-100 text-violet-800";
  return "bg-slate-100 text-slate-700";
}

function formatDate(iso: string, lang: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(
      lang === "ko"
        ? "ko-KR"
        : lang === "ja"
          ? "ja-JP"
          : lang === "zh"
            ? "zh-CN"
            : lang === "vi"
              ? "vi-VN"
              : "en-US",
      { year: "numeric", month: "long", day: "numeric" },
    ).format(d);
  } catch {
    return iso;
  }
}

function NoticeContent() {
  const { t } = useT();
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);

  const noticesQuery = useQuery({
    ...getListPublicNoticesQueryOptions({
      lang,
      search: search || undefined,
      category: activeCategory,
    }),
    placeholderData: keepPreviousData,
  });
  const notices = noticesQuery.data ?? [];

  const allCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of notices)
      counts.set(n.category, (counts.get(n.category) ?? 0) + 1);
    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [notices]);

  const archive = notices.slice(1);
  const totalPages = Math.max(1, Math.ceil(archive.length / PAGE_SIZE));

  // ── Language-switch cross-fade ─────────────────────────────────────────────
  const [isFadedOut, setIsFadedOut] = useState(false);
  const isFadedOutRef = useRef(false);
  const isPlaceholderDataRef = useRef(noticesQuery.isPlaceholderData);
  isPlaceholderDataRef.current = noticesQuery.isPlaceholderData;

  const [displayedNotices, setDisplayedNotices] = useState(notices);
  const latestNoticesRef = useRef(notices);

  useEffect(() => {
    if (noticesQuery.isPlaceholderData) return;
    latestNoticesRef.current = notices;
    if (!isFadedOutRef.current) {
      setDisplayedNotices(notices);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notices, noticesQuery.isPlaceholderData]);

  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;
    isFadedOutRef.current = true;
    setIsFadedOut(true);
  }, [lang]);

  useEffect(() => {
    if (!isFadedOut || noticesQuery.isPlaceholderData) return;
    setDisplayedNotices(latestNoticesRef.current);
    isFadedOutRef.current = false;
    setIsFadedOut(false);
  }, [isFadedOut, noticesQuery.isPlaceholderData]);

  const handleFadeComplete = useCallback(() => {
    if (!isFadedOutRef.current) return;
    if (isPlaceholderDataRef.current) return;
    setDisplayedNotices(latestNoticesRef.current);
    isFadedOutRef.current = false;
    setIsFadedOut(false);
  }, []);

  const displayedFeatured = displayedNotices[0];
  const displayedArchive = displayedNotices.slice(1);
  const displayedVisible = displayedArchive.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {/* HERO */}
      <section className="relative w-full min-h-[480px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={dostacImage("hero-home.webp")}
            alt=""
            fetchPriority="high"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/65 via-primary/55 to-primary/70" />
        </div>
        <div className="container relative z-10 mx-auto px-6 py-28 text-center text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60 font-semibold mb-5">
            {t("notice.heroLabel") as string}
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
            {t("notice.heroTitle") as string}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            {t("notice.heroBody") as string}
          </p>
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-20 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Category tabs */}
          <nav
            className="flex overflow-x-auto gap-1 no-scrollbar"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            <button
              type="button"
              onClick={() => {
                setActiveCategory(undefined);
                setPage(1);
              }}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition whitespace-nowrap ${
                activeCategory === undefined
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t("notice.allCategories") as string}
              <span className="ml-1.5 text-xs opacity-70">{notices.length}</span>
            </button>
            {allCategories.map((c) => {
              const active = activeCategory === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setActiveCategory(c.name);
                    setPage(1);
                  }}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition whitespace-nowrap ${
                    active
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c.name}
                  <span className="ml-1.5 text-xs opacity-70">{c.count}</span>
                </button>
              );
            })}
          </nav>

          {/* Search */}
          <div className="relative sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t("notice.searchPlaceholder") as string}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 rounded-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* FEATURED ARTICLE + ARCHIVE GRID (cross-fades on language change) */}
      <motion.div
        animate={{ opacity: isFadedOut ? 0 : 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        onAnimationComplete={handleFadeComplete}
      >
        {/* FEATURED ARTICLE */}
        {displayedFeatured && !activeCategory && !search && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-8">
                {t("notice.featuredEyebrow") as string}
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Image */}
                <Link
                  href={`/insights/${displayedFeatured.slug}`}
                  className="group relative block rounded-2xl overflow-hidden shadow-lg aspect-[16/10] bg-slate-200"
                >
                  <img
                    src={
                      displayedFeatured.thumbnailUrl ?? dostacImage("hero-home.webp")
                    }
                    alt={displayedFeatured.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span
                    className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${categoryColor(displayedFeatured.category)}`}
                  >
                    <Tag className="h-3 w-3" />
                    {displayedFeatured.category}
                  </span>
                </Link>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(displayedFeatured.publishedAt, lang)}
                    </span>
                    {displayedFeatured.region && (
                      <span className="inline-flex items-center gap-2">
                        <Globe2 className="h-4 w-4" />
                        {displayedFeatured.region}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight mb-5">
                    {displayedFeatured.title}
                  </h2>
                  {displayedFeatured.excerpt && (
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                      {displayedFeatured.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/insights/${displayedFeatured.slug}`}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    {t("notice.featuredButton") as string}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ARCHIVE GRID */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-6">
            {!activeCategory && !search && (
              <div className="mb-10">
                <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-2">
                  {t("notice.archiveEyebrow") as string}
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
                  {t("notice.archiveHeading") as string}
                </h2>
              </div>
            )}

            {noticesQuery.isLoading ? (
              <div className="py-24 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : displayedVisible.length === 0 && displayedArchive.length === 0 && !displayedFeatured ? (
              <div className="py-24 text-center text-muted-foreground">
                <p className="text-base">{t("notice.empty") as string}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {(activeCategory || search ? displayedNotices : displayedVisible).map((item) => (
                  <Link
                    key={item.id}
                    href={`/insights/${item.slug}`}
                    className="group block"
                    data-testid={`notice-card-${item.slug}`}
                  >
                    <article className="h-full flex flex-col rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                      <div className="relative aspect-[16/10] bg-slate-200 overflow-hidden">
                        <img
                          src={
                            item.thumbnailUrl ?? dostacImage("hero-home.webp")
                          }
                          alt={item.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span
                          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${categoryColor(item.category)}`}
                        >
                          <Tag className="h-3 w-3" />
                          {item.category}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col p-6">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(item.publishedAt, lang)}
                          </span>
                          {item.region && (
                            <span className="inline-flex items-center gap-1.5">
                              <Globe2 className="h-3.5 w-3.5" />
                              {item.region}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-semibold text-primary leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        {item.excerpt && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-5 flex-1">
                            {item.excerpt}
                          </p>
                        )}
                        <div className="mt-auto pt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                          {t("notice.readMore") as string}
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {!activeCategory && !search && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-10 w-10 rounded-sm text-sm font-medium transition ${
                      n === page
                        ? "bg-primary text-white"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                {page < totalPages && (
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="h-10 px-4 rounded-sm text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                  >
                    {t("common.next") as string} <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </motion.div>

      {/* CTA */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="container mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold mb-4">
            {t("notice.heroLabel") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto leading-tight">
            {t("notice.ctaHeading") as string}
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            {t("notice.ctaBody") as string}
          </p>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-medium text-white shadow-sm hover:bg-accent/90 hover:shadow-accent/20 hover:shadow-md transition-all"
          >
            {t("notice.ctaButton") as string}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

export default function Notice() {
  const { lang } = useLang();
  usePageMeta({ ...NOTICES_META[lang], path: "/insights" });
  return (
    <Layout>
      <NoticeContent />
    </Layout>
  );
}
