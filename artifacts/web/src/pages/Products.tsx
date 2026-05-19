import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  X,
  Share2,
} from "lucide-react";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { SectionNav } from "@/components/dostac/SectionNav";
import { useT, useLang, LANGUAGES, useCategoryLabel, useSubCategoryLabel, normalizeCategory, normalizeSubCategory } from "@/components/dostac/i18n";
import { getListPublicProductsQueryOptions } from "@workspace/api-client-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function buildUrl(cat: string | null, sub: string | null) {
  if (!cat) return "/products";
  const p = new URLSearchParams({ category: cat });
  if (sub) p.set("subCategory", sub);
  return `/products?${p.toString()}`;
}

const STORAGE_KEY = "dostac_products_last_filter";

function readStoredFilter(): { category: string; subCategory: string | null } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "category" in parsed &&
      typeof (parsed as { category: unknown }).category === "string"
    ) {
      const p = parsed as { category: string; subCategory?: unknown };
      return {
        category: normalizeCategory(p.category),
        subCategory: typeof p.subCategory === "string" ? normalizeSubCategory(p.subCategory) : null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveStoredFilter(category: string | null, subCategory: string | null) {
  try {
    if (category === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ category, subCategory }));
    }
  } catch {
    // localStorage unavailable (e.g. private browsing strict mode) — ignore
  }
}

function ProductsContent() {
  const { t } = useT();
  const { lang } = useLang();
  const catLabel = useCategoryLabel();
  const subLabel = useSubCategoryLabel();
  const queryClient = useQueryClient();

  useEffect(() => {
    for (const { code } of LANGUAGES) {
      if (code !== lang) {
        void queryClient.prefetchQuery(getListPublicProductsQueryOptions({ lang: code }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productsQuery = useQuery({
    ...getListPublicProductsQueryOptions({ lang }),
    placeholderData: keepPreviousData,
  });
  const products = productsQuery.data ?? [];

  const search = useSearch();
  const [, navigate] = useLocation();

  const params = new URLSearchParams(search);
  const categoryFromUrl = params.get("category") ? normalizeCategory(params.get("category")!) : null;
  const subCategoryFromUrl = params.get("subCategory") ? normalizeSubCategory(params.get("subCategory")!) : null;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(subCategoryFromUrl);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [copiedCategory, setCopiedCategory] = useState(false);
  const copiedCategoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCopiedCategoryHoveredRef = useRef(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;
  const [restoredFilter, setRestoredFilter] = useState<{ category: string; subCategory: string | null } | null>(null);
  const restoredFilterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestoredHoveredRef = useRef(false);

  const didRestoreRef = useRef(false);
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;
    if (categoryFromUrl !== null) return;
    const stored = readStoredFilter();
    if (stored) {
      setRestoredFilter(stored);
      navigate(buildUrl(stored.category, stored.subCategory), { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissCopiedCategory = useCallback(() => {
    if (copiedCategoryTimerRef.current) clearTimeout(copiedCategoryTimerRef.current);
    setCopiedCategory(false);
  }, []);

  const startCopiedCategoryTimer = useCallback(() => {
    if (copiedCategoryTimerRef.current) clearTimeout(copiedCategoryTimerRef.current);
    copiedCategoryTimerRef.current = setTimeout(() => {
      if (!isCopiedCategoryHoveredRef.current) dismissCopiedCategory();
    }, 5000);
  }, [dismissCopiedCategory]);

  useEffect(() => {
    if (!copiedCategory) return;
    startCopiedCategoryTimer();
    return () => { if (copiedCategoryTimerRef.current) clearTimeout(copiedCategoryTimerRef.current); };
  }, [copiedCategory, startCopiedCategoryTimer]);

  const handleCopyLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: window.location.href });
      } catch {
        // user dismissed or share failed — do nothing
      }
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopiedCategory(true);
      }).catch(() => {
        const el = document.createElement("textarea");
        el.value = window.location.href;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        try {
          document.execCommand("copy");
          setCopiedCategory(true);
        } catch {
          // Silent — clipboard unavailable in this context
        } finally {
          document.body.removeChild(el);
        }
      });
    }
  };

  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    setSelectedSubCategory(subCategoryFromUrl);
    setActiveSlug(null);
    setCopiedCategory(false);
  }, [categoryFromUrl, subCategoryFromUrl]);

  // ── Filter normalization ───────────────────────────────────────────────────
  // All category and sub-category values (from URL, localStorage, and the API
  // response) are normalised to canonical slugs (e.g. "skincare") before any
  // comparison or state update.  This prevents the active filter chip from
  // being silently cleared when the user switches language and the API returns
  // the same product with a differently-formatted category string (e.g. the DB
  // might store "스킨케어" for KO but the English response returns "Skin Care").
  //
  // Manual QA — lang-switch × category filter:
  //   1. Open /products in English, click a category chip (e.g. "Skin Care").
  //      Confirm the chip stays highlighted and the sub-category bar appears.
  //   2. Switch language to 한국어 via the header switcher.
  //      ✓ The same category chip must remain active, now labelled in Korean.
  //      ✓ Sub-category chips (if any) must remain visible and labelled in Korean.
  //   3. Switch back to English — chip and sub-category bar must still be active.
  //   4. Repeat steps 1-3 starting in Korean, switching to English and then to
  //      Japanese/Chinese/Vietnamese.
  //   5. Open /products?category=스킨케어 (Korean raw value in URL).
  //      ✓ The "Skin Care" chip must be selected regardless of active language.
  //   6. Clear localStorage (devtools → Application → Storage → Clear site data),
  //      select "Specialty" + sub-category, navigate away, return.
  //      ✓ The restored-filter chip must show the translated label for whichever
  //        language is currently active, not a raw slug.
  //   7. With a category active, hard-reload the page — chip must be restored
  //      from the URL without being cleared on the first render.

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => !!c).map(normalizeCategory))
  );

  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    if (p.category) {
      const slug = normalizeCategory(p.category);
      acc[slug] = (acc[slug] ?? 0) + 1;
    }
    return acc;
  }, {});

  useEffect(() => {
    if (selectedCategory !== null && categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setRestoredFilter(null);
      navigate("/products", { replace: true });
      saveStoredFilter(null, null);
    }
  }, [categories, selectedCategory, navigate]);

  const categoryFilteredProducts =
    selectedCategory === null
      ? products
      : products.filter((p) => p.category != null && normalizeCategory(p.category) === selectedCategory);

  const subCategories = Array.from(
    new Set(
      categoryFilteredProducts
        .map((p) => p.subCategory)
        .filter((s): s is string => !!s)
        .map(normalizeSubCategory)
    )
  );

  const subCategoryCounts = categoryFilteredProducts.reduce<Record<string, number>>((acc, p) => {
    if (p.subCategory) {
      const slug = normalizeSubCategory(p.subCategory);
      acc[slug] = (acc[slug] ?? 0) + 1;
    }
    return acc;
  }, {});

  useEffect(() => {
    if (
      selectedSubCategory !== null &&
      subCategories.length > 0 &&
      !subCategories.includes(selectedSubCategory)
    ) {
      setSelectedSubCategory(null);
      navigate(buildUrl(selectedCategory, null), { replace: true });
      saveStoredFilter(selectedCategory, null);
    }
  }, [subCategories, selectedSubCategory, selectedCategory, navigate]);

  useEffect(() => {
    if (selectedCategory !== null) {
      saveStoredFilter(selectedCategory, selectedSubCategory ?? null);
    }
  }, [selectedCategory, selectedSubCategory]);

  const filteredProducts =
    selectedSubCategory === null || selectedSubCategory === undefined
      ? categoryFilteredProducts
      : categoryFilteredProducts.filter((p) => p.subCategory != null && normalizeSubCategory(p.subCategory) === selectedSubCategory);

  // ── Language-switch cross-fade ─────────────────────────────────────────────
  // isFadedOut drives opacity 1→0→1 on the content+nav wrappers.
  // displayedFiltered is a frozen snapshot of the rendered product list;
  // it only updates after the fade-out animation completes so old-language
  // content is visible during exit and new-language content during entrance.
  // This works for both warm-cache (instant data) and slow-network scenarios.
  const [isFadedOut, setIsFadedOut] = useState(false);
  const isFadedOutRef = useRef(false);
  const isPlaceholderDataRef = useRef(productsQuery.isPlaceholderData);
  isPlaceholderDataRef.current = productsQuery.isPlaceholderData;

  const [displayedFiltered, setDisplayedFiltered] = useState(filteredProducts);
  const latestFilteredRef = useRef(filteredProducts);

  // Keep latestFilteredRef current whenever fresh (non-placeholder) data is ready.
  // When not in a lang transition, push it to displayedFiltered immediately so
  // category/sub-category filter changes and same-language refreshes stay live.
  useEffect(() => {
    if (productsQuery.isPlaceholderData) return;
    latestFilteredRef.current = filteredProducts;
    if (!isFadedOutRef.current) {
      setDisplayedFiltered(filteredProducts);
    }
  }, [filteredProducts, productsQuery.isPlaceholderData]);

  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;
    isFadedOutRef.current = true;
    setIsFadedOut(true);
  }, [lang]);

  // Slow-network path: new data arrives while content is faded out → swap + fade in.
  useEffect(() => {
    if (!isFadedOut || productsQuery.isPlaceholderData) return;
    setDisplayedFiltered(latestFilteredRef.current);
    isFadedOutRef.current = false;
    setIsFadedOut(false);
  }, [isFadedOut, productsQuery.isPlaceholderData]);

  // Fast/cached path: called when the opacity-0 animation finishes.
  // Data is already available → swap snapshot and fade back in.
  // If still placeholder, the slow-network effect above will handle it instead.
  const handleFadeComplete = useCallback(() => {
    if (!isFadedOutRef.current) return;
    if (isPlaceholderDataRef.current) return;
    setDisplayedFiltered(latestFilteredRef.current);
    isFadedOutRef.current = false;
    setIsFadedOut(false);
  }, []);

  useEffect(() => {
    if (filteredProducts.length === 0) return;
    const currentRefs = sectionRefs.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = entry.target.getAttribute("data-slug");
            if (slug) setActiveSlug(slug);
          }
        }
      },
      { threshold: 0.2, rootMargin: "-130px 0px -40% 0px" },
    );
    currentRefs.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [displayedFiltered]);

  const scrollTo = (slug: string) => {
    const el = document.getElementById(`product-${slug}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const dismissRestoredFilter = useCallback(() => {
    if (restoredFilterTimerRef.current) clearTimeout(restoredFilterTimerRef.current);
    setRestoredFilter(null);
  }, []);

  const startRestoredFilterTimer = useCallback(() => {
    if (restoredFilterTimerRef.current) clearTimeout(restoredFilterTimerRef.current);
    restoredFilterTimerRef.current = setTimeout(() => {
      if (!isRestoredHoveredRef.current) dismissRestoredFilter();
    }, 5000);
  }, [dismissRestoredFilter]);

  useEffect(() => {
    if (restoredFilter === null) return;
    startRestoredFilterTimer();
    return () => {
      if (restoredFilterTimerRef.current) clearTimeout(restoredFilterTimerRef.current);
    };
  }, [restoredFilter, startRestoredFilterTimer]);

  const handleDismissRestoredFilter = () => {
    dismissRestoredFilter();
  };

  const handleCategorySelect = (cat: string | null) => {
    setRestoredFilter(null);
    setSelectedCategory(cat);
    setSelectedSubCategory(null);
    setActiveSlug(null);
    navigate(buildUrl(cat, null), { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
    saveStoredFilter(cat, null);
  };

  const handleSubCategorySelect = (sub: string | null) => {
    setRestoredFilter(null);
    setSelectedSubCategory(sub);
    setActiveSlug(null);
    navigate(buildUrl(selectedCategory, sub), { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
    saveStoredFilter(selectedCategory, sub);
  };

  const showFilterBar = categories.length > 1;

  return (
    <>
      {/* HERO */}
      <section className="relative w-full min-h-[480px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={dostacImage("hero-products.webp")}
            alt=""
            fetchPriority="high"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/65 via-primary/55 to-primary/72" />
        </div>
        <div className="container relative z-10 mx-auto px-6 py-28 text-center text-white">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.4em] text-white/60 font-semibold mb-5"
          >
            {t("products.heroLabel") as string}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto"
          >
            {t("products.heroTitle") as string}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            {t("products.heroSub") as string}
          </motion.p>
        </div>
      </section>

      {/* CATEGORY FILTER BAR */}
      {showFilterBar && (
        <div className="bg-white border-b border-slate-100">
          <div className="container mx-auto px-6">
            <div
              className="flex overflow-x-auto no-scrollbar gap-2 py-3"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus:outline-none ${
                  selectedCategory === null
                    ? "bg-accent text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("products.filterAll") as string}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    selectedCategory === null
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {products.length}
                </span>
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <div key={cat} className="flex-shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus:outline-none ${
                        isActive
                          ? "bg-accent text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {catLabel(cat)}
                      <span
                        className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                          isActive
                            ? "bg-white/25 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {categoryCounts[cat] ?? 0}
                      </span>
                    </button>
                    {isActive && (
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        title={copiedCategory ? (t("products.copied") as string) : canNativeShare ? (t("products.share") as string) : (t("products.copyLink") as string)}
                        aria-label={copiedCategory ? (t("products.copied") as string) : canNativeShare ? (t("products.share") as string) : (t("products.copyLink") as string)}
                        className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none active:scale-95"
                        onMouseEnter={() => {
                          isCopiedCategoryHoveredRef.current = true;
                          if (copiedCategoryTimerRef.current) clearTimeout(copiedCategoryTimerRef.current);
                        }}
                        onMouseLeave={() => {
                          isCopiedCategoryHoveredRef.current = false;
                          if (copiedCategory) startCopiedCategoryTimer();
                        }}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {copiedCategory ? (
                            <motion.span key="copied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                              <Check className="w-4 h-4 text-emerald-600" />
                            </motion.span>
                          ) : (
                            <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                              {canNativeShare ? <Share2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RESTORED FILTER CHIP */}
      <AnimatePresence>
        {restoredFilter !== null && (
          <motion.div
            key="restored-filter-chip"
            className="bg-amber-50 border-b border-amber-100 overflow-hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseEnter={() => {
              isRestoredHoveredRef.current = true;
              if (restoredFilterTimerRef.current) clearTimeout(restoredFilterTimerRef.current);
            }}
            onMouseLeave={() => {
              isRestoredHoveredRef.current = false;
              startRestoredFilterTimer();
            }}
          >
            <div className="container mx-auto px-6">
              <div className="flex items-center gap-2 py-2">
                <span className="text-xs text-amber-700 font-medium">
                  {t("products.filterRestoredPrefix") as string}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                  {restoredFilter.subCategory
                    ? `${catLabel(restoredFilter.category)} · ${subLabel(restoredFilter.subCategory)}`
                    : catLabel(restoredFilter.category)}
                  <button
                    type="button"
                    onClick={handleDismissRestoredFilter}
                    aria-label={t("products.filterClearAriaLabel") as string}
                    className="ml-0.5 rounded-full hover:bg-amber-200 transition-colors p-0.5 focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUB-CATEGORY FILTER BAR */}
      {selectedCategory !== null && subCategories.length > 0 && (
        <div className="bg-slate-50 border-b border-slate-100">
          <div className="container mx-auto px-6">
            <div
              className="flex overflow-x-auto no-scrollbar gap-2 py-2.5"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => handleSubCategorySelect(null)}
                className={`flex-shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors focus:outline-none ${
                  selectedSubCategory === null
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t("products.filterAll") as string}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    selectedSubCategory === null
                      ? "bg-white/25 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {categoryFilteredProducts.length}
                </span>
              </button>
              {subCategories.map((sub) => {
                const isActive = selectedSubCategory === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubCategorySelect(isActive ? null : sub)}
                    className={`flex-shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors focus:outline-none ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {subLabel(sub)}
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {subCategoryCounts[sub] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STICKY SUBMENU */}
      {displayedFiltered.length > 0 && (
        <motion.div
          animate={{ opacity: isFadedOut ? 0 : 1 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <SectionNav
            items={displayedFiltered.map((p) => ({ id: p.slug, label: p.name }))}
            activeId={activeSlug ?? ""}
            onSelect={scrollTo}
            ariaLabel="Products navigation"
            testIdPrefix="products-nav-"
          />
        </motion.div>
      )}

      {/* PRODUCT SECTIONS */}
      <motion.div
        animate={{ opacity: isFadedOut ? 0 : 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        onAnimationComplete={handleFadeComplete}
      >
      <div className="bg-[#F5F7FA]">
        {productsQuery.isLoading ? (
          <div className="py-32 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayedFiltered.length === 0 ? (
          <div className="py-32 text-center text-muted-foreground container mx-auto px-6">
            {t("products.empty") as string}
          </div>
        ) : (
          displayedFiltered.map((product, index) => {
            const fallbackImg = dostacImage(
              `product-${String(((product.id - 1) % 10) + 1).padStart(2, "0")}.webp`,
            );
            const isOdd = index % 2 !== 0;
            const features = product.features;

            return (
              <article
                key={product.id}
                id={`product-${product.slug}`}
                data-slug={product.slug}
                ref={(el) => {
                  if (el) sectionRefs.current.set(product.slug, el);
                  else sectionRefs.current.delete(product.slug);
                }}
                className={`scroll-mt-36 py-20 ${isOdd ? "bg-white" : "bg-[#F5F7FA]"}`}
              >
                <div className="container mx-auto px-6">
                  <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={stagger}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
                  >
                    {/* IMAGE — always left on desktop */}
                    <motion.div
                      variants={fadeUp}
                      className="relative rounded-2xl overflow-hidden shadow-md"
                    >
                      <img
                        src={product.imageUrl ?? fallbackImg}
                        alt={product.name}
                        loading="lazy"
                        className="w-full aspect-[4/3] object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                        {product.category && (
                          <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-accent shadow-sm">
                            {catLabel(product.category)}
                          </span>
                        )}
                        {product.subCategory && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (selectedCategory !== product.category) {
                                setSelectedCategory(product.category ?? null);
                                setSelectedSubCategory(product.subCategory ?? null);
                                navigate(buildUrl(product.category ?? null, product.subCategory ?? null), { replace: false });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                saveStoredFilter(product.category ?? null, product.subCategory ?? null);
                              } else {
                                handleSubCategorySelect(
                                  selectedSubCategory === product.subCategory ? null : (product.subCategory ?? null)
                                );
                              }
                            }}
                            className="inline-flex items-center rounded-full bg-accent/85 backdrop-blur px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-accent transition-colors cursor-pointer"
                          >
                            {subLabel(product.subCategory)}
                          </button>
                        )}
                      </div>
                    </motion.div>

                    {/* CONTENT */}
                    <motion.div variants={fadeUp}>
                      {product.valueProp && (
                        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-4">
                          {product.valueProp}
                        </p>
                      )}
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] mb-3 leading-tight">
                        {product.name}
                      </h2>
                      {product.headline && (
                        <p className="text-base text-accent font-semibold mb-5 leading-snug">
                          {product.headline}
                        </p>
                      )}
                      {product.body && (
                        <div
                          className="rich-html text-slate-600 text-sm leading-relaxed mb-7"
                          dangerouslySetInnerHTML={{ __html: product.body }}
                        />
                      )}

                      {/* FEATURES — clean vertical bullet list */}
                      {features.length > 0 && (
                        <motion.ul
                          variants={stagger}
                          className="flex flex-col gap-2.5 mb-7"
                        >
                          {features.map((feat, i) => (
                            <motion.li
                              key={i}
                              variants={fadeUp}
                              className="flex items-start gap-3"
                            >
                              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              <span className="text-sm text-slate-700 leading-snug">
                                {feat}
                              </span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}

                      {/* CERT BADGES */}
                      {product.certs.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-7">
                          {product.certs.map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTAs */}
                      <div className="flex flex-wrap gap-3 pt-1">
                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 transition-colors"
                          data-testid={`product-cta-detail-${product.slug}`}
                        >
                          {t("products.viewDetails") as string}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                          href={`/contact?product=${encodeURIComponent(product.slug)}&inquiryType=oem#contact-form`}
                          className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
                          data-testid={`product-cta-oem-${product.slug}`}
                        >
                          {t("products.oemInquiry") as string}
                        </Link>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </article>
            );
          })
        )}
      </div>
      </motion.div>

      {/* BOTTOM CTA */}
      <section className="py-24 bg-[#0F172A] text-white text-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold mb-4"
            >
              {t("products.heroLabel") as string}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto leading-tight"
            >
              {t("products.bottomCtaHeading") as string}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-white/70 text-lg mb-8 max-w-xl mx-auto leading-relaxed"
            >
              {t("products.bottomCtaBody") as string}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-sm hover:bg-accent/90 hover:shadow-accent/20 hover:shadow-md transition-all"
              >
                {t("products.bottomCtaButton") as string}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default function Products() {
  return (
    <Layout>
      <ProductsContent />
    </Layout>
  );
}
