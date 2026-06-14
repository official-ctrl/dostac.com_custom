"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useT, useLang, useCategoryLabel, useSubCategoryLabel, type Lang } from "./i18n";
import { getListPublicProductsQueryOptions } from "@workspace/api-client-react";

type AboutSubItem = {
  hash: string;
  key: "greeting" | "history" | "philosophy" | "directions";
  label: string;
};

const ABOUT_SUB: AboutSubItem[] = [
  { hash: "greeting", key: "greeting", label: "Greeting" },
  { hash: "history", key: "history", label: "Our Story" },
  { hash: "philosophy", key: "philosophy", label: "Company Philosophy" },
  { hash: "directions", key: "directions", label: "Directions" },
];

type ProcessSubItem = {
  hash: string;
  key: "oem" | "cert";
  label: string;
};

const PROCESS_SUB: ProcessSubItem[] = [
  { hash: "oem-odm", key: "oem", label: "OEM/ODM" },
  { hash: "global-certifications", key: "cert", label: "Global Certifications" },
];

type NavKey = "about" | "production" | "product" | "notice" | "contact";

const NAV_ITEMS: Array<{ href: string; key: NavKey }> = [
  { href: "/about", key: "about" },
  { href: "/production", key: "production" },
  { href: "/products", key: "product" },
  { href: "/insights", key: "notice" },
  { href: "/contact", key: "contact" },
];

const LANG_OPTIONS: Array<{ code: Lang; label: string }> = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "vi", label: "Tiếng Việt" },
];

function LanguageSwitcher({ onDark }: { onDark?: boolean }) {
  const { lang, setLang } = useLang();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const current = LANG_OPTIONS.find((l) => l.code === lang) ?? LANG_OPTIONS[0];
  const queryClient = useQueryClient();

  const prefetchProducts = (targetLang: Lang) => {
    if (targetLang === lang) return;
    void queryClient.prefetchQuery(getListPublicProductsQueryOptions({ lang: targetLang }));
  };


  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition border ${
          onDark
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
        aria-label={t("common.language") as string}
      >
        <Globe className={`h-3.5 w-3.5 ${onDark ? "text-white/70" : "text-slate-500"}`} />
        {current.label}
        <ChevronDown className={`h-3.5 w-3.5 ${onDark ? "text-white/50" : "text-slate-400"}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-md border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onMouseEnter={() => prefetchProducts(opt.code)}
              onClick={() => { setLang(opt.code); setOpen(false); }}
              className={`flex w-full items-center justify-between px-4 py-2 text-sm transition hover:bg-slate-100 ${
                opt.code === lang ? "font-semibold text-primary" : "text-slate-700"
              }`}
            >
              <span>{opt.label}</span>
              {opt.code === lang && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AboutDropdown({ active }: { active: boolean }) {
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = "about-dropdown-menu";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const scheduleClose = () => {
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
    }, 150);
  };

  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
    }
    if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onBlurCapture = (e: React.FocusEvent) => {
    if (!wrapRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
      onKeyDown={onKeyDown}
      onBlurCapture={onBlurCapture}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) router.push("/about");
          else setOpen(true);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={`inline-flex items-center gap-1 text-sm font-medium transition-all duration-[80ms] outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E3C] rounded-lg px-2.5 py-1.5 ${
          active
            ? "text-[#8B5E3C] bg-[#8B5E3C]/10"
            : "text-slate-700 hover:bg-slate-100 hover:text-[#2D2D2D]"
        }`}
        data-testid="nav-about"
      >
        {t("nav.about") as string}
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("nav.about") as string}
          className="absolute left-1/2 top-full -translate-x-1/2 pt-3 z-50"
        >
          <div className="w-56 flex flex-col py-2 px-1.5 rounded-xl border border-slate-200 bg-white shadow-xl">
            {ABOUT_SUB.map((s) => (
              <Link
                key={s.hash}
                href={`/about#${s.hash}`}
                role="menuitem"
                data-testid={`nav-about-${s.hash}`}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#2D2D2D] transition-all duration-[80ms] focus:bg-[#F5F0E8] focus:outline-none"
                onClick={() => setOpen(false)}
              >
                {t(`nav.aboutSub.${s.key}`) as string}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessDropdown({ active }: { active: boolean }) {
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = "process-dropdown-menu";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const scheduleClose = () => {
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
    }, 150);
  };

  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
    }
    if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onBlurCapture = (e: React.FocusEvent) => {
    if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
      onKeyDown={onKeyDown}
      onBlurCapture={onBlurCapture}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) router.push("/production");
          else setOpen(true);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={`inline-flex items-center gap-1 text-sm font-medium transition-all duration-[80ms] outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E3C] rounded-lg px-2.5 py-1.5 ${
          active
            ? "text-[#8B5E3C] bg-[#8B5E3C]/10"
            : "text-slate-700 hover:bg-slate-100 hover:text-[#2D2D2D]"
        }`}
        data-testid="nav-production"
      >
        {t("nav.production") as string}
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("nav.production") as string}
          className="absolute left-1/2 top-full -translate-x-1/2 pt-3 z-50"
        >
          <div className="w-52 flex flex-col py-2 px-1.5 rounded-xl border border-slate-200 bg-white shadow-xl">
            {PROCESS_SUB.map((s) => (
              <Link
                key={s.hash}
                href={`/production#${s.hash}`}
                role="menuitem"
                data-testid={`nav-process-${s.hash}`}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#2D2D2D] transition-all duration-[80ms] focus:bg-[#F5F0E8] focus:outline-none"
                onClick={() => setOpen(false)}
              >
                {t(`nav.processSub.${s.key}`) as string}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductsDropdown({ active }: { active: boolean }) {
  const { t } = useT();
  const { lang } = useLang();
  const catLabel = useCategoryLabel();
  const subCatLabel = useSubCategoryLabel();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = "products-dropdown-menu";

  const productsQuery = useQuery({
    ...getListPublicProductsQueryOptions({ lang }),
    staleTime: 5 * 60 * 1000,
    enabled: open, // 드롭다운 열릴 때만 fetch — 닫혀있을 때 API 호출 없음
  });
  const products = productsQuery.data ?? [];

  const rawCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter((c): c is string => !!c))),
    [products]
  );
  const localizedCategories = useMemo(
    () => rawCategories.map((slug) => ({ slug, label: catLabel(slug) })),
    [rawCategories, catLabel]
  );

  // Build a map of category → sorted list of unique sub-categories.
  const subCatMap = useMemo(
    () => products.reduce<Record<string, string[]>>((acc, p) => {
      if (p.category && p.subCategory) {
        if (!acc[p.category]) acc[p.category] = [];
        if (!acc[p.category].includes(p.subCategory)) acc[p.category].push(p.subCategory);
      }
      return acc;
    }, {}),
    [products]
  );

  // Build a count map: category → subCategory → product count
  const subCatCountMap = useMemo(
    () => products.reduce<Record<string, Record<string, number>>>((acc, p) => {
      if (p.category && p.subCategory) {
        if (!acc[p.category]) acc[p.category] = {};
        acc[p.category][p.subCategory] = (acc[p.category][p.subCategory] ?? 0) + 1;
      }
      return acc;
    }, {}),
    [products]
  );

  const activeSubs = hoveredCategory ? (subCatMap[hoveredCategory] ?? []) : [];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setHoveredCategory(null);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
      if (catHoverTimerRef.current !== null) clearTimeout(catHoverTimerRef.current);
    };
  }, []);

  const scheduleClose = () => {
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
      setHoveredCategory(null);
    }, 300);
  };

  const setHoveredCategoryDelayed = (slug: string) => {
    if (catHoverTimerRef.current !== null) clearTimeout(catHoverTimerRef.current);
    catHoverTimerRef.current = setTimeout(() => {
      catHoverTimerRef.current = null;
      setHoveredCategory(slug);
    }, 90);
  };

  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setHoveredCategory(null);
      triggerRef.current?.focus();
    }
    if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onBlurCapture = (e: React.FocusEvent) => {
    if (!wrapRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
      setHoveredCategory(null);
    }
  };

  const close = () => {
    setOpen(false);
    setHoveredCategory(null);
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
      onKeyDown={onKeyDown}
      onBlurCapture={onBlurCapture}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) router.push("/products");
          else setOpen(true);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={`inline-flex items-center gap-1 text-sm font-medium transition-all duration-[80ms] outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E3C] rounded-lg px-2.5 py-1.5 ${
          active
            ? "text-[#8B5E3C] bg-[#8B5E3C]/10"
            : "text-slate-700 hover:bg-slate-100 hover:text-[#2D2D2D]"
        }`}
        data-testid="nav-products"
      >
        {t("nav.product") as string}
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("nav.product") as string}
          className="absolute left-1/2 top-full -translate-x-1/2 pt-3 z-50"
        >
          <div className="flex gap-1.5 items-start">
            {/* Left panel — categories */}
            <div
              ref={leftPanelRef}
              className="w-52 flex flex-col py-2 px-1.5 rounded-xl border border-slate-200 bg-white shadow-xl"
            >
              <Link
                href="/products"
                role="menuitem"
                data-testid="nav-products-all"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#2D2D2D] transition-all duration-[80ms] focus:bg-[#F5F0E8] focus:outline-none"
                onClick={close}
              >
                {t("products.filterAll") as string}
              </Link>
              {productsQuery.isLoading && (
                <>
                  <div className="my-1 mx-3 border-t border-slate-100" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="px-3 py-2">
                      <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                    </div>
                  ))}
                </>
              )}
              {!productsQuery.isLoading && localizedCategories.length > 0 && (
                <div className="my-1 mx-3 border-t border-slate-100" />
              )}
              {!productsQuery.isLoading && localizedCategories.map(({ slug, label }) => {
                const hasSubs = (subCatMap[slug]?.length ?? 0) > 0;
                const isHovered = hoveredCategory === slug;
                return (
                  <button
                    key={slug}
                    type="button"
                    role="menuitem"
                    data-testid={`nav-products-cat-${slug}`}
                    aria-haspopup={hasSubs ? "menu" : undefined}
                    aria-expanded={hasSubs ? isHovered : undefined}
                    onMouseEnter={() => setHoveredCategoryDelayed(slug)}
                    onFocus={() => setHoveredCategory(slug)}
                    onClick={() => { router.push(`/products?category=${encodeURIComponent(slug)}`); close(); }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" && hasSubs) {
                        e.preventDefault();
                        const firstBtn = rightPanelRef.current?.querySelector<HTMLElement>("a, button");
                        firstBtn?.focus();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isHovered ? "bg-slate-100 text-[#2D2D2D]" : "text-slate-700 hover:bg-slate-100 hover:text-[#2D2D2D]"
                    }`}
                  >
                    <span>{label}</span>
                    {hasSubs && (
                      <ChevronRight className="h-3.5 w-3.5 opacity-40 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right panel — sub-categories for hovered category */}
            {hoveredCategory && activeSubs.length > 0 && (
              <div
                ref={rightPanelRef}
                role="menu"
                aria-label={catLabel(hoveredCategory)}
                className="w-48 flex flex-col py-2 px-1.5 rounded-xl border border-slate-200 bg-white shadow-xl"
                onMouseEnter={() => {
                  if (catHoverTimerRef.current !== null) {
                    clearTimeout(catHoverTimerRef.current);
                    catHoverTimerRef.current = null;
                  }
                  cancelClose();
                }}
              >
                <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 select-none">
                  {catLabel(hoveredCategory)}
                </p>
                {activeSubs.map((sub) => {
                  const count = subCatCountMap[hoveredCategory]?.[sub] ?? 0;
                  return (
                    <Link
                      key={sub}
                      href={`/products?category=${encodeURIComponent(hoveredCategory)}&subCategory=${encodeURIComponent(sub)}`}
                      role="menuitem"
                      data-testid={`nav-products-sub-${sub}`}
                      onClick={close}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowLeft") {
                          e.preventDefault();
                          const catBtn = leftPanelRef.current?.querySelector<HTMLElement>(
                            `[data-testid="nav-products-cat-${hoveredCategory}"]`
                          );
                          catBtn?.focus();
                        }
                      }}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#2D2D2D] transition-all duration-[80ms] focus:bg-[#F5F0E8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E3C] flex items-center justify-between gap-2"
                    >
                      <span>{subCatLabel(sub)}</span>
                      {count > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold tabular-nums flex-shrink-0">
                          {count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileProductsAccordion({
  open,
  onToggle,
  onClose,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { t } = useT();
  const { lang } = useLang();
  const catLabel = useCategoryLabel();
  const subCatLabel = useSubCategoryLabel();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const productsQuery = useQuery({
    ...getListPublicProductsQueryOptions({ lang }),
    staleTime: 5 * 60 * 1000,
    enabled: open, // 아코디언 열릴 때만 fetch
  });
  const products = productsQuery.data ?? [];

  const rawCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter((c): c is string => !!c))),
    [products]
  );
  const localizedCategories = useMemo(
    () => rawCategories.map((slug) => ({ slug, label: catLabel(slug) })),
    [rawCategories, catLabel]
  );

  const subCatMap = useMemo(
    () => products.reduce<Record<string, string[]>>((acc, p) => {
      if (p.category && p.subCategory) {
        if (!acc[p.category]) acc[p.category] = [];
        if (!acc[p.category].includes(p.subCategory)) acc[p.category].push(p.subCategory);
      }
      return acc;
    }, {}),
    [products]
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="mobile-products-submenu"
        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
        data-testid="mobile-nav-products"
      >
        <span>{t("nav.product") as string}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id="mobile-products-submenu"
          className="ml-4 mt-1 mb-2 space-y-1 border-l border-slate-200 pl-3"
        >
          <Link
            href="/products"
            className="block px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100"
            onClick={onClose}
          >
            {t("products.filterAll") as string}
          </Link>
          {productsQuery.isLoading && [1, 2, 3].map((i) => (
            <div key={i} className="px-3 py-1.5">
              <div className="h-3.5 w-20 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
          {!productsQuery.isLoading && localizedCategories.map(({ slug, label }) => {
            const subs = subCatMap[slug] ?? [];
            const isExpanded = expandedCategory === slug;
            return (
              <div key={slug}>
                <div className="flex items-center gap-0.5">
                  <Link
                    href={`/products?category=${encodeURIComponent(slug)}`}
                    data-testid={`mobile-nav-products-cat-${slug}`}
                    className="flex-1 px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100"
                    onClick={onClose}
                  >
                    {label}
                  </Link>
                  {subs.length > 0 && (
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={`${label} — ${t("products.subCategoryLabel") as string}`}
                      onClick={() => setExpandedCategory(isExpanded ? null : slug)}
                      className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {isExpanded && subs.length > 0 && (
                  <div className="ml-3 mt-0.5 mb-1 space-y-0.5 border-l border-slate-100 pl-3">
                    {subs.map((sub) => (
                      <Link
                        key={sub}
                        href={`/products?category=${encodeURIComponent(slug)}&subCategory=${encodeURIComponent(sub)}`}
                        data-testid={`mobile-nav-products-sub-${sub}`}
                        className="block px-3 py-1.5 rounded-md text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        onClick={onClose}
                      >
                        {subCatLabel(sub)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Header() {
  const { t } = useT();
  const location = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileProcessOpen, setMobileProcessOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  /* ── Fix 1: DOM 직접 조작으로 스크롤 시 React 리렌더 완전 제거 ── */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      if (window.scrollY > 10) {
        el.dataset.scrolled = "1";
      } else {
        delete el.dataset.scrolled;
      }
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  /* ── 동일 페이지 내 해시 변경만 처리: 페이지 이동과 충돌하지 않도록
        의존성 [] — 한 번만 등록, location 변경 시 재등록 없음.
        초기 딥링크 스크롤은 각 페이지 컴포넌트가 직접 처리. ── */
  useEffect(() => {
    const scrollToHash = (hash: string) => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
      return false;
    };

    const onHashScroll = () => {
      if (window.location.pathname === "/contact") return;
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      // DOM이 아직 렌더되지 않은 경우 rAF 2회로 대기 후 재시도
      if (!scrollToHash(hash)) {
        requestAnimationFrame(() => {
          if (!scrollToHash(hash)) {
            requestAnimationFrame(() => scrollToHash(hash));
          }
        });
      }
    };
    window.addEventListener("hashchange", onHashScroll);
    return () => window.removeEventListener("hashchange", onHashScroll);
  }, []);

  return (
    <>
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-white border-b border-slate-200/70 transition-[background-color,box-shadow] duration-200 data-[scrolled]:bg-white/95 data-[scrolled]:backdrop-blur-md data-[scrolled]:shadow-sm"
    >
      <div className="container mx-auto px-6 h-[4.5rem] flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Dostac home">
          <span
            className="font-black tracking-[-0.05em] text-[#0F172A] leading-none select-none"
            style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)", fontSize: "42px" }}
          >
            dostac
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href || location.startsWith(`${item.href}/`);
            if (item.key === "about") {
              return <AboutDropdown key={item.href} active={active} />;
            }
            if (item.key === "production") {
              return <ProcessDropdown key={item.href} active={active} />;
            }
            if (item.key === "product") {
              return <ProductsDropdown key={item.href} active={active} />;
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-all duration-[80ms] px-2.5 py-1.5 rounded-lg ${
                  active
                    ? "text-[#8B5E3C] bg-[#8B5E3C]/10"
                    : "text-slate-700 hover:bg-slate-100 hover:text-[#2D2D2D]"
                }`}
              >
                {t(`nav.${item.key}`) as string}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/contact" className="hidden md:inline-flex">
            <Button className="rounded-full bg-accent hover:bg-accent/90 text-white h-10 px-6 text-sm font-semibold shadow-sm">
              {t("nav.cta") as string} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              if (item.key === "production") {
                return (
                  <div key={item.href}>
                    <button
                      type="button"
                      onClick={() => setMobileProcessOpen((v) => !v)}
                      aria-expanded={mobileProcessOpen}
                      aria-controls="mobile-process-submenu"
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                      data-testid="mobile-nav-production"
                    >
                      <span>{t("nav.production") as string}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${mobileProcessOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {mobileProcessOpen && (
                      <div
                        id="mobile-process-submenu"
                        className="ml-4 mt-1 mb-2 space-y-1 border-l border-slate-200 pl-3"
                      >
                        <Link
                          href="/production"
                          className="block px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100"
                          onClick={() => setMobileOpen(false)}
                        >
                          {t("nav.production") as string}
                        </Link>
                        {PROCESS_SUB.map((s) => (
                          <Link
                            key={s.hash}
                            href={`/production#${s.hash}`}
                            data-testid={`mobile-nav-process-${s.hash}`}
                            className="block px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100"
                            onClick={() => setMobileOpen(false)}
                          >
                            {t(`nav.processSub.${s.key}`) as string}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              if (item.key === "product") {
                return (
                  <MobileProductsAccordion
                    key={item.href}
                    open={mobileProductsOpen}
                    onToggle={() => setMobileProductsOpen((v) => !v)}
                    onClose={() => setMobileOpen(false)}
                  />
                );
              }
              if (item.key === "about") {
                return (
                  <div key={item.href}>
                    <button
                      type="button"
                      onClick={() => setMobileAboutOpen((v) => !v)}
                      aria-expanded={mobileAboutOpen}
                      aria-controls="mobile-about-submenu"
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                      data-testid="mobile-nav-about"
                    >
                      <span>{t("nav.about") as string}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          mobileAboutOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {mobileAboutOpen && (
                      <div
                        id="mobile-about-submenu"
                        className="ml-4 mt-1 mb-2 space-y-1 border-l border-slate-200 pl-3"
                      >
                        <Link
                          href="/about"
                          className="block px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100"
                          onClick={() => setMobileOpen(false)}
                        >
                          {t("nav.about") as string}
                        </Link>
                        {ABOUT_SUB.map((s) => (
                          <Link
                            key={s.hash}
                            href={`/about#${s.hash}`}
                            data-testid={`mobile-nav-about-${s.hash}`}
                            className="block px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100"
                            onClick={() => setMobileOpen(false)}
                          >
                            {t(`nav.aboutSub.${s.key}`) as string}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {t(`nav.${item.key}`) as string}
                </Link>
              );
            })}
            <Link href="/contact" className="mt-2">
              <Button className="w-full rounded-full bg-accent hover:bg-accent/90 text-white font-semibold">
                {t("nav.cta") as string}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
    {location !== "/contact" && (
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/96 backdrop-blur-sm border-t border-slate-100 shadow-[0_-4px_20px_rgba(15,23,42,0.10)] px-4 py-3">
        <Link href="/contact">
          <Button className="w-full h-11 rounded-full bg-accent hover:bg-accent/90 text-white text-sm font-semibold shadow-sm">
            {t("nav.cta") as string} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    )}
    </>
  );
}

function Footer() {
  const { t } = useT();
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div>
            <span
              className="font-black tracking-[-0.05em] text-white leading-none select-none block mb-1"
              style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)", fontSize: "28px" }}
            >
              dostac
            </span>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              K-Beauty OEM &amp; Global Sourcing Partner
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/about" className="text-sm text-slate-400 hover:text-accent transition-colors">
              {t("nav.about") as string}
            </Link>
            <Link href="/production" className="text-sm text-slate-400 hover:text-accent transition-colors">
              {t("nav.production") as string}
            </Link>
            <Link href="/products" className="text-sm text-slate-400 hover:text-accent transition-colors">
              {t("nav.product") as string}
            </Link>
            <Link href="/insights" className="text-sm text-slate-400 hover:text-accent transition-colors">
              {t("nav.notice") as string}
            </Link>
            <Link href="/contact" className="text-sm text-slate-400 hover:text-accent transition-colors">
              {t("nav.contact") as string}
            </Link>
          </nav>
        </div>
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            dostac Co., Ltd. &copy; {new Date().getFullYear()} — All Rights Reserved.
          </p>
          <Link href="/contact">
            <Button
              size="sm"
              className="rounded-full bg-accent hover:bg-accent/90 text-white text-xs h-10 px-5 font-semibold"
            >
              {t("nav.cta") as string} <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dostac-root min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-[4.5rem] md:pb-0">{children}</main>
      <Footer />
    </div>
  );
}

export const dostacImage = (file: string) =>
  `/images/dostac/${file}`;
