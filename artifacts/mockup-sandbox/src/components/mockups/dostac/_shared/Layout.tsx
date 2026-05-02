import React from "react";
import { Menu, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "./_group.css";
import { LanguageProvider, useT, LANGUAGES, type Lang } from "./i18n";

function LanguageSwitcher() {
  const { lang, setLang, t } = useT();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={t("common.language")}
          className="hidden md:inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-white px-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Globe className="h-4 w-4 text-accent" />
          <span>{current.label}</span>
          <span className="text-xs text-muted-foreground font-mono">{current.flag}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code as Lang)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground w-7">{l.flag}</span>
              <span>{l.label}</span>
            </span>
            {l.code === lang ? <Check className="h-4 w-4 text-accent" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useT();
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 gap-6">
          <a href="/__mockup/preview/dostac/Home" className="flex items-center gap-2 shrink-0">
            <span className="font-display font-bold text-2xl tracking-tighter text-primary">DOSTAC</span>
          </a>

          <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center">
            <a href="/__mockup/preview/dostac/About" className="text-sm font-medium text-foreground hover:text-accent transition-colors whitespace-nowrap">{t("nav.about")}</a>
            <a href="/__mockup/preview/dostac/Production" className="text-sm font-medium text-foreground hover:text-accent transition-colors whitespace-nowrap">{t("nav.production")}</a>
            <a href="/__mockup/preview/dostac/Products" className="text-sm font-medium text-foreground hover:text-accent transition-colors whitespace-nowrap">{t("nav.product")}</a>
            <a href="/__mockup/preview/dostac/Notice" className="text-sm font-medium text-foreground hover:text-accent transition-colors whitespace-nowrap">{t("nav.notice")}</a>
            <a href="/__mockup/preview/dostac/Contact" className="text-sm font-medium text-foreground hover:text-accent transition-colors whitespace-nowrap">{t("nav.contact")}</a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher />
            <a href="/__mockup/preview/dostac/Contact" className="hidden md:inline-flex h-10 items-center justify-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 whitespace-nowrap">
              {t("nav.cta")}
            </a>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-primary text-primary-foreground py-16 px-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <span className="font-display font-bold text-3xl tracking-tighter block mb-4">DOSTAC</span>
            <p className="text-primary-foreground/80 mb-6 max-w-sm">{t("footer.tagline")}</p>
            <p className="text-sm font-medium text-accent">{t("footer.secure")}</p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-lg mb-4 text-white">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li><a href="/__mockup/preview/dostac/About" className="text-primary-foreground/80 hover:text-white transition-colors">{t("footer.aboutUs")}</a></li>
              <li><a href="/__mockup/preview/dostac/Production" className="text-primary-foreground/80 hover:text-white transition-colors">{t("footer.production")}</a></li>
              <li><a href="/__mockup/preview/dostac/Products" className="text-primary-foreground/80 hover:text-white transition-colors">{t("footer.products")}</a></li>
              <li><a href="/__mockup/preview/dostac/Notice" className="text-primary-foreground/80 hover:text-white transition-colors">{t("footer.notice")}</a></li>
              <li><a href="/__mockup/preview/dostac/Contact" className="text-primary-foreground/80 hover:text-white transition-colors">{t("footer.contact")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-lg mb-4 text-white">{t("footer.hq")}</h4>
            <address className="not-italic text-primary-foreground/80 space-y-2">
              <p>{t("footer.addr")}</p>
              <p>{t("footer.email")}</p>
              <p>{t("footer.phone")}</p>
              <p>{t("footer.hours")}</p>
            </address>
          </div>
        </div>
        <div className="container mx-auto mt-16 pt-8 border-t border-primary-foreground/10 text-sm text-primary-foreground/60 text-center">
          {t("footer.copyright")}
        </div>
      </footer>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Shell>{children}</Shell>
    </LanguageProvider>
  );
}
