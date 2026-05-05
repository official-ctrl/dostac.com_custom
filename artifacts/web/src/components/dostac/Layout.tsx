import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT, useLang, type Lang } from "./i18n";

const NAV_ITEMS: Array<{ href: string; key: "about" | "production" | "product" | "notice" | "contact" }> = [
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

function Header() {
  const { t } = useT();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/70">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-primary">dostac</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href;
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
          <div className="container mx-auto px-6 py-4 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t(`nav.${item.key}`) as string}
              </Link>
            ))}
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
    <footer className="bg-slate-900 text-slate-200">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">{t("footer.copyright") as string}</div>
        <Link href="/contact">
          <Button
            size="sm"
            className="rounded-sm bg-accent hover:bg-accent/90 text-white h-9 px-5 text-sm font-medium"
            data-testid="footer-contact-cta"
          >
            {t("footer.contact") as string} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
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
