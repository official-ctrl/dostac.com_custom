"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { PRODUCTS_META } from "@/hooks/page-meta-config";

/* Image with fallback — for featured bento where primary may not exist yet */
function ImageWithFallback({
  primary,
  fallback,
  alt,
  className,
  sizes,
}: {
  primary: string;
  fallback: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [src, setSrc] = useState(primary);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      loading="lazy"
      className={className}
      onError={() => setSrc(fallback)}
    />
  );
}

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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    for (const { code } of LANGUAGES) {
      if (code !== lang) {
        void queryClient.prefetchQuery(getListPublicProductsQueryOptions({ lang: code }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchParams = useSearchParams();
  const productsQuery = useQuery({
    ...getListPublicProductsQueryOptions({ lang }),
    placeholderData: keepPreviousData,
  });
  const products = productsQuery.data ?? [];

  const categoryFromUrl = searchParams.get("category") ? normalizeCategory(searchParams.get("category")!) : null;
  const subCategoryFromUrl = searchParams.get("subCategory") ? normalizeSubCategory(searchParams.get("subCategory")!) : null;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(subCategoryFromUrl);
  const [selectedCerts, setSelectedCerts] = useState<Set<string>>(new Set());
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [copiedCategory, setCopiedCategory] = useState(false);
  const copiedCategoryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCopiedCategoryHoveredRef = useRef(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;
  const [restoredFilter, setRestoredFilter] = useState<{ category: string; subCategory: string | null } | null>(null);
  const restoredFilterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestoredHoveredRef = useRef(false);

  const navigate = (url: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  };

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

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter((c): c is string => !!c).map(normalizeCategory))),
    [products]
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
      // State만 초기화 — navigate() 호출 금지 (데이터 변경 시 navigate는 페이지 이탈과 race condition 발생)
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setRestoredFilter(null);
      saveStoredFilter(null, null);
    }
  }, [categories, selectedCategory]);

  const categoryFilteredProducts = useMemo(
    () => selectedCategory === null
      ? products
      : products.filter((p) => p.category != null && normalizeCategory(p.category) === selectedCategory),
    [products, selectedCategory]
  );

  const subCategories = useMemo(
    () => Array.from(new Set(
      categoryFilteredProducts
        .map((p) => p.subCategory)
        .filter((s): s is string => !!s)
        .map(normalizeSubCategory)
    )),
    [categoryFilteredProducts]
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
      // State만 초기화 — navigate() 호출 금지 (race condition 방지)
      setSelectedSubCategory(null);
      saveStoredFilter(selectedCategory, null);
    }
  }, [subCategories, selectedSubCategory, selectedCategory]);

  useEffect(() => {
    if (selectedCategory !== null) {
      saveStoredFilter(selectedCategory, selectedSubCategory ?? null);
    }
  }, [selectedCategory, selectedSubCategory]);


  const filteredProducts = useMemo(
    () => selectedSubCategory === null || selectedSubCategory === undefined
      ? categoryFilteredProducts
      : categoryFilteredProducts.filter((p) => p.subCategory != null && normalizeSubCategory(p.subCategory) === selectedSubCategory),
    [categoryFilteredProducts, selectedSubCategory]
  );

  /* Cert filter — applied last so cert counts reflect sub-category state */
  const allCerts = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.certs ?? []))).sort(),
    [products]
  );

  const certFilteredProducts = useMemo(
    () => selectedCerts.size === 0
      ? filteredProducts
      : filteredProducts.filter((p) => [...selectedCerts].every((c) => (p.certs ?? []).includes(c))),
    [filteredProducts, selectedCerts]
  );

  const toggleCert = (cert: string) => {
    setSelectedCerts((prev) => {
      const next = new Set(prev);
      if (next.has(cert)) next.delete(cert);
      else next.add(cert);
      return next;
    });
  };

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

  const [displayedFiltered, setDisplayedFiltered] = useState(certFilteredProducts);
  const latestFilteredRef = useRef(certFilteredProducts);

  // Keep latestFilteredRef current whenever fresh (non-placeholder) data is ready.
  // When not in a lang transition, push it to displayedFiltered immediately so
  // category/sub-category/cert filter changes and same-language refreshes stay live.
  useEffect(() => {
    if (productsQuery.isPlaceholderData) return;
    latestFilteredRef.current = certFilteredProducts;
    if (!isFadedOutRef.current) {
      setDisplayedFiltered(certFilteredProducts);
    }
  }, [certFilteredProducts, productsQuery.isPlaceholderData]);

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
      {/* ════════════════ PREMIUM HERO ════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ backgroundColor: "#0D1117" }}>
        {/* Background image with depth overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={dostacImage("hero-products.webp")}
            alt="K-Beauty product catalogue — Dostac OEM/ODM skincare, sun care, and sheet masks"
            fill
            sizes="100vw"
            priority
            quality={75}
            className="object-cover object-center"
            style={{ transform: "scale(1.04)" }}
          />
          {/* Multi-layer cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117]/86 via-[#0D1117]/72 to-[#0D1117]/90" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(139,94,60,0.20) 0%, transparent 65%)",
            }}
          />
        </div>

        {/* Corner marks */}
        <div aria-hidden="true" className="absolute top-24 left-6 w-5 h-5 border-l border-t border-[#8B5E3C]/45 z-10 hidden sm:block" />
        <div aria-hidden="true" className="absolute top-24 right-6 w-5 h-5 border-r border-t border-[#8B5E3C]/45 z-10 hidden sm:block" />
        <div aria-hidden="true" className="absolute bottom-6 left-6 w-5 h-5 border-l border-b border-[#8B5E3C]/45 z-10 hidden sm:block" />
        <div aria-hidden="true" className="absolute bottom-6 right-6 w-5 h-5 border-r border-b border-[#8B5E3C]/45 z-10 hidden sm:block" />

        <div className="container relative z-10 mx-auto px-5 sm:px-6 py-20 sm:py-24 md:py-32 min-h-[420px] sm:min-h-[480px] md:min-h-[540px] flex flex-col justify-center text-white max-w-5xl">
          {/* Eyebrow with live pulse */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#E9A052] opacity-70 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E9A052]" />
            </span>
            <p className="text-[10.5px] uppercase tracking-[0.32em] text-[#E9A052] font-semibold">
              {t("products.heroEyebrow") as string}
            </p>
          </motion.div>

          {/* Premium headline */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold leading-[1.04] mb-6 tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
          >
            {t("products.heroTitleLead") as string}
            <br />
            <span className="text-[#E9A052]/90 italic">
              {t("products.heroTitleAccent") as string}
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#F5F0E8]/70 leading-relaxed max-w-2xl mb-10"
            style={{ fontSize: "clamp(1rem, 1.4vw, 1.15rem)" }}
          >
            {t("products.heroSub") as string}
          </motion.p>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-[#F5F0E8]/15 max-w-2xl"
          >
            {((t("products.heroTrust") as unknown as string[]) ?? []).map((trust, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#F5F0E8]/55 font-semibold"
              >
                <span className="text-[#E9A052]">✓</span>
                {trust}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FEATURED K-BEAUTY SHOWCASE ════════════════ */}
      <section className="relative bg-[#F5F0E8] py-16 md:py-20 overflow-hidden">
        {/* Soft terra wash */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(139,94,60,0.07) 0%, transparent 65%)",
          }}
        />

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
          >
            <div>
              <motion.p
                variants={fadeUp}
                className="text-[#8B5E3C] text-[10.5px] font-bold tracking-[0.3em] uppercase mb-3 flex items-center gap-2"
              >
                <span className="w-5 h-px bg-[#8B5E3C]/60" />
                {t("products.featuredEyebrow") as string}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="font-display text-2xl md:text-[32px] font-bold text-[#2D2D2D] leading-[1.1] tracking-tight max-w-2xl"
              >
                {t("products.featuredHeading") as string}
              </motion.h2>
            </div>
            <motion.p
              variants={fadeUp}
              className="text-[#2D2D2D]/55 text-[13.5px] leading-relaxed max-w-sm md:text-right"
            >
              {t("products.featuredSub") as string}
            </motion.p>
          </motion.div>

          {/* Bento grid — Row 1: 3:2 split (big + portrait) */}
          {(() => {
            const fp = products.slice(0, 5);
            const getImg = (p: typeof fp[number] | undefined, idx: number) => {
              if (p?.imageUrl) return p.imageUrl;
              return dostacImage(`product-${String(((( p?.id ?? idx + 1) - 1) % 10) + 1).padStart(2, "0")}.webp`);
            };
            const getCat = (p: typeof fp[number] | undefined) =>
              [catLabel(p?.category ?? ""), subLabel(p?.subCategory ?? "")].filter(Boolean).join(" · ");

            if (productsQuery.isLoading) {
              return (
                <div className="animate-pulse">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="md:col-span-3 rounded-2xl bg-slate-100 h-[360px]" />
                    <div className="md:col-span-2 rounded-2xl bg-slate-100 h-[360px]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0,1,2].map(i => <div key={i} className="rounded-2xl bg-slate-100 h-[280px]" />)}
                  </div>
                </div>
              );
            }

            return (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                variants={stagger}
              >
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="md:col-span-3 group relative overflow-hidden rounded-2xl bg-white featured-card-shadow"
                  >
                    <div className="relative h-[220px] sm:h-[240px] md:h-[300px] overflow-hidden bg-[#F5F0E8]">
                      <Image
                        src={getImg(fp[0], 0)}
                        alt={fp[0]?.name ?? ""}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B5E3C]">
                        Featured
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-[9.5px] uppercase tracking-[0.22em] text-[#8B5E3C] font-bold mb-1.5">
                        {getCat(fp[0])}
                      </p>
                      <h3 className="font-display text-[18px] font-bold text-[#2D2D2D] leading-tight mb-1.5">
                        {fp[0]?.name ?? ""}
                      </h3>
                      <p className="text-[11.5px] text-[#2D2D2D]/55 leading-relaxed">
                        {fp[0]?.headline ?? ""}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-white featured-card-shadow"
                  >
                    <div className="relative h-[220px] sm:h-[240px] md:h-[300px] overflow-hidden bg-[#F5F0E8]">
                      <Image
                        src={getImg(fp[1], 1)}
                        alt={fp[1]?.name ?? ""}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[9.5px] uppercase tracking-[0.22em] text-[#8B5E3C] font-bold mb-1.5">
                        {getCat(fp[1])}
                      </p>
                      <h3 className="font-display text-[16px] font-bold text-[#2D2D2D] leading-tight mb-1.5">
                        {fp[1]?.name ?? ""}
                      </h3>
                      <p className="text-[11px] text-[#2D2D2D]/55 leading-relaxed">
                        {fp[1]?.headline ?? ""}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Row 2 — 3 equal cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[2, 3, 4].map((idx) => (
                    <motion.div
                      key={idx}
                      variants={fadeUp}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative overflow-hidden rounded-2xl bg-white featured-card-shadow"
                    >
                      <div className="relative h-[180px] sm:h-[200px] md:h-[220px] overflow-hidden bg-[#F5F0E8]">
                        <Image
                          src={getImg(fp[idx], idx)}
                          alt={fp[idx]?.name ?? ""}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#8B5E3C] font-bold mb-1">
                          {getCat(fp[idx])}
                        </p>
                        <h3 className="font-display text-[15px] font-bold text-[#2D2D2D] leading-tight mb-1">
                          {fp[idx]?.name ?? ""}
                        </h3>
                        <p className="text-[10.5px] text-[#2D2D2D]/55 leading-relaxed">
                          {fp[idx]?.headline ?? ""}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })()}
        </div>

        <style jsx>{`
          .featured-card-shadow {
            box-shadow:
              0 1px 2px rgba(139, 94, 60, 0.04),
              0 8px 24px -8px rgba(139, 94, 60, 0.10);
            transition: box-shadow 0.3s ease-out;
          }
          .featured-card-shadow:hover {
            box-shadow:
              0 4px 12px rgba(139, 94, 60, 0.06),
              0 16px 40px -10px rgba(139, 94, 60, 0.18);
          }
        `}</style>
      </section>

      {/* ════════════════ MARKET INTELLIGENCE ════════════════ */}
      <section className="relative bg-white py-14 md:py-18 border-t border-[#8B5E3C]/8">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="max-w-2xl mx-auto text-center mb-10"
          >
            <motion.p
              variants={fadeUp}
              className="text-[#8B5E3C] text-[10.5px] font-bold tracking-[0.3em] uppercase mb-3 inline-flex items-center gap-2.5"
            >
              <span className="w-5 h-px bg-[#8B5E3C]/60" />
              {t("products.marketEyebrow") as string}
              <span className="w-5 h-px bg-[#8B5E3C]/60" />
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-2xl md:text-[34px] font-bold text-[#2D2D2D] leading-[1.08] tracking-tight mb-3"
            >
              {t("products.marketHeading") as string}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-[#2D2D2D]/55 text-[14px] leading-relaxed"
            >
              {t("products.marketSub") as string}
            </motion.p>
          </motion.div>

          {/* 4-card intelligence grid */}
          {(() => {
            const cards = (t("products.marketCards") as unknown as Array<{ label: string; insight: string; source: string }>) ?? [];
            return (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                variants={stagger}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                  gap: "16px",
                }}
              >
                {cards.map((c, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-2xl border border-[#8B5E3C]/12 bg-white p-5 market-card-shadow group"
                  >
                    {/* Verified badge */}
                    <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8B5E3C]/8 border border-[#8B5E3C]/15 text-[8.5px] uppercase tracking-[0.18em] text-[#8B5E3C] font-bold">
                      <span className="text-[#E9A052]">●</span>
                      Verified
                    </div>

                    <div className="mt-1">
                      <p className="font-display text-[15.5px] font-bold text-[#2D2D2D] leading-tight mb-2 pr-16">
                        {c.label}
                      </p>
                      <p className="text-[12px] text-[#2D2D2D]/65 leading-relaxed mb-4">
                        {c.insight}
                      </p>
                      <div className="pt-3 border-t border-[#8B5E3C]/8">
                        <p className="text-[8.5px] uppercase tracking-[0.2em] text-[#2D2D2D]/35 font-semibold mb-1">
                          Source
                        </p>
                        <p className="text-[10.5px] text-[#8B5E3C] font-medium leading-snug">
                          {c.source}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            );
          })()}

          {/* Source attribution */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-[10.5px] text-[#2D2D2D]/40 leading-relaxed mt-8 text-center max-w-3xl mx-auto"
          >
            {t("products.marketSources") as string}
          </motion.p>
        </div>

        <style jsx>{`
          .market-card-shadow {
            box-shadow:
              0 1px 2px rgba(139, 94, 60, 0.03),
              0 4px 12px -4px rgba(139, 94, 60, 0.08);
            transition: box-shadow 0.3s ease-out;
          }
          .market-card-shadow:hover {
            box-shadow:
              0 2px 6px rgba(139, 94, 60, 0.05),
              0 12px 28px -8px rgba(139, 94, 60, 0.15);
          }
        `}</style>
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

      {/* CERT FILTER BAR — Alibaba-style certification checkboxes */}
      {allCerts.length > 0 && (
        <div className="bg-[#F5F0E8] border-b border-[#2D2D2D]/[0.06]">
          <div className="container mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2D2D2D]/40 shrink-0">
              Certifications
            </span>
            {allCerts.map((cert) => {
              const active = selectedCerts.has(cert);
              return (
                <button
                  key={cert}
                  type="button"
                  onClick={() => toggleCert(cert)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-150 border ${
                    active
                      ? "bg-[#8B5E3C] border-[#8B5E3C] text-[#F5F0E8] shadow-sm"
                      : "bg-white/70 border-[#2D2D2D]/15 text-[#2D2D2D]/60 hover:border-[#8B5E3C]/40 hover:text-[#8B5E3C]"
                  }`}
                >
                  {active && <span className="text-[9px]">✓</span>}
                  {cert}
                </button>
              );
            })}
            {selectedCerts.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCerts(new Set())}
                className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-[#2D2D2D]/40 hover:text-[#2D2D2D]/70 transition-colors"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
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
      <div className="bg-[#F5F0E8]">
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
                className={`scroll-mt-36 py-20 ${isOdd ? "bg-white" : "bg-[#F5F0E8]"}`}
              >
                <div className="container mx-auto px-6">
                  <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={stagger}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                  >
                    {/* IMAGE — always left on desktop */}
                    <motion.div
                      variants={fadeUp}
                      className="relative rounded-2xl overflow-hidden shadow-md"
                    >
                      {/* 1:1 square container — spec: 800×800px PNG/WebP, white bg, product fills 75-80% */}
                      <div className="relative w-full aspect-square bg-white">
                        <img
                          src={product.imageUrl ?? fallbackImg}
                          alt={product.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-contain p-8"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/[0.04] to-transparent pointer-events-none" />
                      </div>
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

                      {/* CERT BADGES — Alibaba-style verification badges */}
                      {product.certs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-7">
                          {product.certs.map((c, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border transition-colors ${
                                selectedCerts.has(c)
                                  ? "bg-[#8B5E3C] border-[#8B5E3C] text-[#F5F0E8]"
                                  : "bg-[#F5F0E8] border-[#8B5E3C]/30 text-[#8B5E3C]"
                              }`}
                            >
                              <span className="text-[8px]">✓</span>{c}
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
                          href={`/contact?product=${encodeURIComponent(product.slug)}&inquiryType=oem${product.material ? `&material=${encodeURIComponent(product.material)}` : ""}#contact-form`}
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
      <section className="py-24 bg-[#2D2D2D] text-white text-center">
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
      <Suspense
        fallback={
          <div className="py-32 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </Layout>
  );
}
