import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useT, useLang, type Lang } from "./i18n";
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
  { href: "/notice", key: "notice" },
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

function AboutDropdown({ active, scrolled }: { active: boolean; scrolled: boolean }) {
  const { t } = useT();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuId = "about-dropdown-menu";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

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
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={onKeyDown}
      onBlurCapture={onBlurCapture}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) navigate("/about");
          else setOpen(true);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={`inline-flex items-center gap-1 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${
          active ? "text-accent" : "text-slate-700 hover:text-primary"
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
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition focus:bg-slate-100 focus:outline-none"
                onClick={() => setOpen(false)}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessDropdown({ active, scrolled }: { active: boolean; scrolled: boolean }) {
  const { t } = useT();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuId = "process-dropdown-menu";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

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
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={onKeyDown}
      onBlurCapture={onBlurCapture}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) navigate("/production");
          else setOpen(true);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={`inline-flex items-center gap-1 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${
          active ? "text-accent" : "text-slate-700 hover:text-primary"
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
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition focus:bg-slate-100 focus:outline-none"
                onClick={() => setOpen(false)}
              >
                {s.label}
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
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuId = "products-dropdown-menu";

  const productsQuery = useQuery({
    ...getListPublicProductsQueryOptions({ lang }),
    staleTime: 5 * 60 * 1000,
  });
  const products = productsQuery.data ?? [];
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => !!c))
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

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
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={onKeyDown}
      onBlurCapture={onBlurCapture}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) navigate("/products");
          else setOpen(true);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={`inline-flex items-center gap-1 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${
          active ? "text-accent" : "text-slate-700 hover:text-primary"
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
          <div className="w-52 flex flex-col py-2 px-1.5 rounded-xl border border-slate-200 bg-white shadow-xl">
            <Link
              href="/products"
              role="menuitem"
              data-testid="nav-products-all"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition focus:bg-slate-100 focus:outline-none"
              onClick={() => setOpen(false)}
            >
              {t("products.filterAll") as string}
            </Link>
            {categories.length > 0 && (
              <div className="my-1 mx-3 border-t border-slate-100" />
            )}
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                role="menuitem"
                data-testid={`nav-products-cat-${cat}`}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition focus:bg-slate-100 focus:outline-none"
                onClick={() => setOpen(false)}
              >
                {cat}
              </Link>
            ))}
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
  const productsQuery = useQuery({
    ...getListPublicProductsQueryOptions({ lang }),
    staleTime: 5 * 60 * 1000,
  });
  const products = productsQuery.data ?? [];
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => !!c))
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
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              data-testid={`mobile-nav-products-cat-${cat}`}
              className="block px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100"
              onClick={onClose}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  const { t } = useT();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileProcessOpen, setMobileProcessOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashScroll = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      }
    };
    window.addEventListener("hashchange", onHashScroll);
    onHashScroll();
    return () => window.removeEventListener("hashchange", onHashScroll);
  }, [location]);

  return (
    <>
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-sm"
          : "bg-white border-b border-slate-200/70"
      }`}
    >
      <div className="container mx-auto px-6 h-[4.5rem] flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Dostac home">
          <span
            className="font-black tracking-[-0.05em] text-[#0F172A] leading-none select-none"
            style={{ fontFamily: "'Space Grotesk', 'Outfit', sans-serif", fontSize: "42px" }}
          >
            dostac
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href || location.startsWith(`${item.href}/`);
            if (item.key === "about") {
              return <AboutDropdown key={item.href} active={active} scrolled={scrolled} />;
            }
            if (item.key === "production") {
              return <ProcessDropdown key={item.href} active={active} scrolled={scrolled} />;
            }
            if (item.key === "product") {
              return <ProductsDropdown key={item.href} active={active} />;
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-accent" : "text-slate-700 hover:text-primary"
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
                            {s.label}
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
                            {s.label}
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
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "28px" }}
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
            <Link href="/notice" className="text-sm text-slate-400 hover:text-accent transition-colors">
              {t("nav.notice") as string}
            </Link>
            <Link href="/contact" className="text-sm text-slate-400 hover:text-accent transition-colors">
              {t("nav.contact") as string}
            </Link>
          </nav>
        </div>
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            dostac Co., Ltd. &copy; 2026 — All Rights Reserved.
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
  `${import.meta.env.BASE_URL}images/dostac/${file}`;
