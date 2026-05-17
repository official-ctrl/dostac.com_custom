import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT, useLang, type Lang } from "./i18n";

type AboutSubItem = {
  hash: string;
  key: "greeting" | "history" | "worldwide" | "directions";
};

const ABOUT_SUB: AboutSubItem[] = [
  { hash: "greeting", key: "greeting" },
  { hash: "history", key: "history" },
  { hash: "worldwide", key: "worldwide" },
  { hash: "directions", key: "directions" },
];

type ProcessSubItem = {
  hash: string;
  key: "oem" | "cert";
};

const PROCESS_SUB: ProcessSubItem[] = [
  { hash: "oem", key: "oem" },
  { hash: "cert", key: "cert" },
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

function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const current = LANG_OPTIONS.find((l) => l.code === lang) ?? LANG_OPTIONS[0];

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
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
        aria-label={t("common.language") as string}
      >
        <Globe className="h-4 w-4 text-slate-500" />
        {current.label}
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-md border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => {
                setLang(opt.code);
                setOpen(false);
              }}
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
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuId = "about-dropdown-menu";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Close on Escape; close on focus leaving the wrapper
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
        className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${
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
                {t(`about.sections.${s.key}`) as string}
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
        className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${
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
                {t(`production.sections.${s.key}`) as string}
              </Link>
            ))}
          </div>
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Smooth scroll if URL has a hash matching an about section
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashScroll = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) {
        // small delay to let layout settle (sticky nav)
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/70">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Dostac home">
          <img
            src={dostacImage("dostac-logo.png")}
            alt="Dostac"
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href || location.startsWith(`${item.href}/`);
            if (item.key === "about") {
              return <AboutDropdown key={item.href} active={active} />;
            }
            if (item.key === "production") {
              return <ProcessDropdown key={item.href} active={active} />;
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-colors ${
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
            <Button className="rounded-sm bg-accent hover:bg-accent/90 text-white h-10 px-5 text-sm font-medium">
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
                            {t(`production.sections.${s.key}`) as string}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
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
                            {t(`about.sections.${s.key}`) as string}
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
              <Button className="w-full rounded-sm bg-accent hover:bg-accent/90 text-white">
                {t("nav.cta") as string}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useT();
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-12 border-b border-slate-800">
          <div>
            <span className="inline-block font-display text-2xl font-bold tracking-tight text-white mb-6">
              dostac
            </span>
            <p className="font-semibold text-white/90 mb-3 text-base leading-snug">
              Connecting Korean Innovation to the Global Market
            </p>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Dostac is committed to building reliable global partnerships through Korean manufacturing, K-beauty expertise, and international commerce solutions.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-between gap-8">
            <div className="space-y-2.5 text-sm md:text-right">
              <p className="text-slate-400">
                <span className="text-white/80 font-medium mr-2">Email</span>
                info@dostac.com
              </p>
              <p className="text-slate-400">
                <span className="text-white/80 font-medium mr-2">Tel</span>
                070-4334-7333
              </p>
              <p className="text-slate-400">
                <span className="text-white/80 font-medium mr-2">Fax</span>
                0504-488-4345
              </p>
              <p className="text-slate-400">
                <span className="text-white/80 font-medium mr-2">Hours</span>
                Mon–Fri&nbsp;09:00–18:00 KST
              </p>
            </div>
            <Link href="/contact">
              <Button
                className="rounded-full bg-accent hover:bg-accent/90 text-white h-10 px-6 text-sm font-medium"
                data-testid="footer-contact-cta"
              >
                {t("footer.contact") as string} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="pt-6 text-center">
          <p className="text-slate-500 text-xs">{t("footer.copyright") as string}</p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dostac-root min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export const dostacImage = (file: string) =>
  `${import.meta.env.BASE_URL}images/dostac/${file}`;
