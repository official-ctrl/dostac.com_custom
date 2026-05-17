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
                {s.label}
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
                {s.label}
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
          <span
            className="text-[22px] font-black tracking-[-0.04em] text-primary leading-none select-none"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            dostac
          </span>
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
                            {s.label}
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
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-6 py-6">
        <p className="text-center text-xs text-slate-500 mb-5 tracking-wide">
          Connecting Korean Innovation to the Global Market
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-5">
          <p className="text-xs text-slate-500 order-2 sm:order-1">
            dostac &copy; 2026
          </p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 order-1 sm:order-2">
            <Link
              href="/contact"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/notice"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Notice
            </Link>
            <Link
              href="/about#directions"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Locations
            </Link>
          </nav>
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
