import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang, type Lang } from "@/components/dostac/i18n";
import { useGetPublicAbout } from "@workspace/api-client-react";
import {
  MapPin,
  ShoppingBag,
  Store,
  Globe,
  Factory,
  BarChart2,
  Zap,
  Shield,
  Network,
  TrendingUp,
  Package,
  Monitor,
  Truck,
  Mail,
  Clock,
  ArrowRight,
} from "lucide-react";

function forceEnglishMapUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("hl", "en");
    return u.toString();
  } catch {
    return url.includes("?") ? `${url}&hl=en` : `${url}?hl=en`;
  }
}

const HISTORY_AREA_ICONS = [ShoppingBag, Store, Globe, Factory, BarChart2, Zap];
const PHILOSOPHY_CARD_ICONS = [Shield, Network, TrendingUp];
const WHY_DOSTAC_ICONS = [Factory, Globe, Package, Monitor, Truck];
const FOUNDER_AREA_ICONS = [ShoppingBag, Store, Globe, Factory, BarChart2, Zap];

function useStaggerReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const SECTIONS = [
  { id: "greeting" },
  { id: "history" },
  { id: "philosophy" },
  { id: "directions" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function pickByLang(
  obj: unknown,
  base: string,
  lang: Lang,
): string {
  if (!obj || typeof obj !== "object") return "";
  const rec = obj as Record<string, unknown>;
  const v = rec[`${base}${cap(lang)}`];
  if (typeof v === "string" && v.trim()) return v;
  const ko = rec[`${base}Ko`];
  return typeof ko === "string" ? ko : "";
}

function pickItem(item: unknown, base: string, lang: Lang): string {
  if (!item || typeof item !== "object") return "";
  const rec = item as Record<string, unknown>;
  const v = rec[`${base}${cap(lang)}`];
  if (typeof v === "string" && v.trim()) return v;
  const ko = rec[`${base}Ko`];
  return typeof ko === "string" ? ko : "";
}

function useScrollSpy(): SectionId {
  const [active, setActive] = useState<SectionId>("greeting");
  useEffect(() => {
    const onScroll = () => {
      const offset = 160;
      let current: SectionId = "greeting";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - offset <= 0) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return active;
}

function SectionNav({ active }: { active: SectionId }) {
  const { t } = useT();
  return (
    <nav
      className="sticky top-20 z-40 bg-white/95 backdrop-blur border-y border-slate-200/70"
      aria-label="About sections"
    >
      <div className="container mx-auto px-6">
        <ul className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {SECTIONS.map((s) => (
            <li key={s.id} className="flex-shrink-0">
              <a
                href={`#${s.id}`}
                data-testid={`about-tab-${s.id}`}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
                  active === s.id
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-primary"
                }`}
              >
                {t(`about.sections.${s.id}`) as string}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function PhilosophySection({
  dbWhyItems,
  dbHeading,
  dbIntro,
  dbImageUrl,
  dbPhilosophyCards,
  dbFounderHeading,
  dbFounderIntro,
  dbFounderOutro,
  dbFounderAreas,
}: {
  dbWhyItems?: { titleKo: string; titleEn: string; titleJa: string; titleZh: string; titleVi: string; descKo: string; descEn: string; descJa: string; descZh: string; descVi: string; active: boolean; sortOrder: number }[] | null;
  dbHeading?: string;
  dbIntro?: string;
  dbImageUrl?: string | null;
  dbPhilosophyCards?: { titleKo: string; titleEn: string; titleJa: string; titleZh: string; titleVi: string; textKo: string; textEn: string; textJa: string; textZh: string; textVi: string }[];
  dbFounderHeading?: string;
  dbFounderIntro?: string;
  dbFounderOutro?: string;
  dbFounderAreas?: { titleKo: string; titleEn: string; titleJa: string; titleZh: string; titleVi: string }[];
}) {
  const { t } = useT();
  const { lang } = useLang();
  const headerFade = useFadeUp();
  const imgFade = useFadeUp();
  const phiCards = useStaggerReveal();
  const whyCards = useStaggerReveal();
  const founderCards = useStaggerReveal();
  const outroFade = useFadeUp();

  const i18nPhiloCards = t("about.philosophyCards") as { title: string; text: string }[];
  const philosophyCards: { title: string; text: string }[] = useMemo(() => {
    if (dbPhilosophyCards && dbPhilosophyCards.length > 0) {
      return dbPhilosophyCards.map((c) => {
        const titleKey = `title${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof c;
        const textKey = `text${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof c;
        return {
          title: (c[titleKey] as string) || c.titleEn || c.titleKo || "",
          text: (c[textKey] as string) || c.textEn || c.textKo || "",
        };
      });
    }
    return i18nPhiloCards;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbPhilosophyCards, lang]);

  const activeDbItems = dbWhyItems?.filter((it) => it.active).sort((a, b) => a.sortOrder - b.sortOrder) ?? [];
  const whyDostacItems: { title: string; text: string }[] = activeDbItems.length > 0
    ? activeDbItems.map((it) => {
        const titleKey = `title${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof it;
        const descKey = `desc${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof it;
        const title = (it[titleKey] as string) || it.titleKo || "";
        const text = (it[descKey] as string) || it.descKo || "";
        return { title, text };
      })
    : (t("about.whyDostacItems") as { title: string; text: string }[]);

  const i18nFounderAreas = t("about.founderAreas") as string[];
  const founderAreas: string[] = useMemo(() => {
    if (dbFounderAreas && dbFounderAreas.length > 0) {
      const capLang = lang.charAt(0).toUpperCase() + lang.slice(1);
      const titleKey = `title${capLang}` as keyof (typeof dbFounderAreas)[0];
      return dbFounderAreas.map((a) => (a[titleKey] as string) || a.titleEn || a.titleKo || "");
    }
    return i18nFounderAreas;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbFounderAreas, lang]);

  const founderHeading = dbFounderHeading || (t("about.founderHeading") as string);
  const founderIntro = dbFounderIntro || (t("about.founderIntro") as string);
  const founderOutro = dbFounderOutro || (t("about.founderOutro") as string);

  return (
    <section id="philosophy" className="scroll-mt-32 py-20 bg-slate-50">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Top two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-20">
          {/* Right image — first in DOM for mobile */}
          <div
            ref={imgFade.ref}
            className={`order-1 lg:order-2 transition-all duration-700 ease-out ${
              imgFade.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="rounded-2xl overflow-hidden shadow-md aspect-[4/5] lg:aspect-auto lg:h-[580px]">
              <img
                src={dbImageUrl || dostacImage("hero-production.webp")}
                alt={dbHeading || (t("about.philosophyHeading") as string)}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Left text column */}
          <div className="order-2 lg:order-1">
            <div
              ref={headerFade.ref}
              className={`transition-all duration-700 ease-out ${
                headerFade.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
                {t("about.eyebrowPhilosophy") as string}
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
                {(dbHeading && dbHeading.trim()) ? dbHeading : (t("about.philosophyHeading") as string)}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
                {(dbIntro && dbIntro.trim()) ? dbIntro : (t("about.philosophyIntro") as string)}
              </p>
            </div>

            {/* 3 philosophy cards */}
            <div ref={phiCards.ref} className="space-y-4">
              {philosophyCards.map((card, i) => {
                const Icon = PHILOSOPHY_CARD_ICONS[i % PHILOSOPHY_CARD_ICONS.length];
                return (
                  <div
                    key={i}
                    className={`bg-white rounded-xl border border-slate-200 p-5 flex gap-4 items-start
                      hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5
                      transition-all duration-300 ease-out
                      ${phiCards.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
                    style={{ transitionDelay: phiCards.visible ? `${i * 80}ms` : "0ms" }}
                  >
                    <div className="text-accent mt-0.5 flex-shrink-0 bg-accent/10 rounded-lg p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary mb-1">{card.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{card.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Why Dostac subsection */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
              {t("about.eyebrowWhy") as string}
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-primary">
              {t("about.whyDostacHeading") as string}
            </h3>
          </div>
          <div ref={whyCards.ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyDostacItems.map((item, i) => {
              const Icon = WHY_DOSTAC_ICONS[i % WHY_DOSTAC_ICONS.length];
              return (
                <div
                  key={i}
                  className={`bg-white rounded-xl border border-slate-200 p-5 flex gap-4 items-start
                    hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5
                    transition-all duration-300 ease-out
                    ${whyCards.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
                  style={{ transitionDelay: whyCards.visible ? `${i * 80}ms` : "0ms" }}
                >
                  <div className="text-accent mt-0.5 flex-shrink-0 bg-accent/10 rounded-lg p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Founder Experience subsection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
              {t("about.eyebrowFounder") as string}
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-primary mb-6">
              {founderHeading}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line max-w-3xl">
              {founderIntro}
            </p>
            <div
              ref={founderCards.ref}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8"
            >
              {founderAreas.map((area, i) => {
                const Icon = FOUNDER_AREA_ICONS[i % FOUNDER_AREA_ICONS.length];
                return (
                  <div
                    key={i}
                    className={`bg-slate-50 rounded-xl border border-slate-200 p-4 flex gap-3 items-start
                      hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5
                      transition-all duration-300 ease-out
                      ${founderCards.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
                    style={{ transitionDelay: founderCards.visible ? `${i * 80}ms` : "0ms" }}
                  >
                    <div className="text-accent mt-0.5 flex-shrink-0 bg-accent/10 rounded-lg p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-snug self-center">
                      {area}
                    </p>
                  </div>
                );
              })}
            </div>
            <div
              ref={outroFade.ref}
              className={`transition-all duration-700 ease-out ${
                outroFade.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="bg-slate-50 border-l-4 border-accent rounded-r-xl px-5 py-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {founderOutro}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HistorySection({
  dbImageUrl,
  dbIntro,
  dbAreas,
}: {
  dbImageUrl?: string | null;
  dbIntro?: string;
  dbAreas?: { title: string }[];
}) {
  const { t } = useT();
  const headerFade = useFadeUp();
  const imgFade = useFadeUp();
  const cards = useStaggerReveal();
  const outroFade = useFadeUp();

  const i18nAreas = t("about.historyAreas") as string[];
  const areas: string[] =
    dbAreas && dbAreas.length > 0
      ? dbAreas.map((a) => a.title)
      : i18nAreas;

  const introText =
    (dbIntro && dbIntro.trim()) ? dbIntro : (t("about.historyIntro") as string);

  const heroImg = dbImageUrl || dostacImage("hero-about.webp");

  return (
    <section id="history" className="scroll-mt-32 py-20 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Right column image — rendered first in DOM for mobile (order-1 on small) */}
          <div
            ref={imgFade.ref}
            className={`order-1 lg:order-2 transition-all duration-700 ease-out ${
              imgFade.visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="rounded-2xl overflow-hidden shadow-md aspect-[4/5] lg:aspect-auto lg:h-[600px]">
              <img
                src={heroImg}
                alt={t("about.historyHeading") as string}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Left column text */}
          <div className="order-2 lg:order-1">
            <div
              ref={headerFade.ref}
              className={`transition-all duration-700 ease-out ${
                headerFade.visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
                {t("about.eyebrowStory") as string}
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
                {t("about.historyHeading") as string}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
                {introText}
              </p>
            </div>

            {/* Icon cards */}
            <div
              ref={cards.ref}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            >
              {areas.map((area, i) => {
                const Icon = HISTORY_AREA_ICONS[i % HISTORY_AREA_ICONS.length];
                return (
                  <div
                    key={i}
                    className={`bg-slate-50 rounded-xl border border-slate-200 p-4 flex gap-3 items-start
                      hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5
                      transition-all duration-300 ease-out
                      ${cards.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
                    style={{
                      transitionDelay: cards.visible ? `${i * 80}ms` : "0ms",
                    }}
                  >
                    <div className="text-accent mt-0.5 flex-shrink-0 bg-accent/10 rounded-lg p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-snug self-center">
                      {area}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Outro paragraph */}
            <div
              ref={outroFade.ref}
              className={`transition-all duration-700 ease-out ${
                outroFade.visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div className="bg-slate-50 border-l-4 border-accent rounded-r-xl px-5 py-4">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {t("about.historyOutro") as string}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutContent() {
  const { t } = useT();
  const { lang } = useLang();
  const active = useScrollSpy();
  const { data } = useGetPublicAbout();

  const greetingHtml = useMemo(
    () => pickByLang(data, "greetingMessage", lang),
    [data, lang],
  );
  const greetingSig = pickByLang(data, "greetingSignature", lang);
  const worldwideIntro = pickByLang(data, "worldwideIntro", lang);
  const philosophyHeading = pickByLang(data, "philosophyHeading", lang);
  const philosophyIntro = pickByLang(data, "philosophyIntro", lang);
  const founderHeading = pickByLang(data, "founderHeading", lang);
  const founderIntro = pickByLang(data, "founderIntro", lang);
  const founderOutro = pickByLang(data, "founderOutro", lang);
  const directionsAddress = pickByLang(data, "directionsAddress", lang) || (t("about.directionsAddress") as string);

  const greetingImg = data?.greetingImageUrl || dostacImage("ceo-portrait.webp");
  const worldwideImg = data?.worldwideImageUrl || null;

  const worldwideAreas = useMemo(() => {
    if (!data?.worldwideItems || !Array.isArray(data.worldwideItems) || data.worldwideItems.length === 0) return undefined;
    return data.worldwideItems.map((item) => {
      const titleByLang: Record<string, string> = {
        ko: item.titleKo,
        en: item.titleEn,
        ja: item.titleJa,
        zh: item.titleZh,
        vi: item.titleVi,
      };
      return { title: titleByLang[lang] || item.titleEn || item.titleKo || "" };
    });
  }, [data, lang]);

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[360px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={dostacImage("hero-about.webp")}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/65 via-primary/55 to-primary/75" />
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t("about.heroTitle") as string}
          </h1>
          <p className="text-lg md:text-xl text-white/85">
            {t("about.heroSub") as string}
          </p>
        </div>
      </section>

      <SectionNav active={active} />

      {/* 1. GREETING */}
      <section id="greeting" className="scroll-mt-32 py-20 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border bg-muted">
              <img
                src={greetingImg}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-2">
              01 — {t("about.sections.greeting") as string}
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
              {t("about.greetingsHeading") as string}
            </h2>
            <div
              className="prose prose-slate max-w-none text-muted-foreground text-lg leading-relaxed prose-p:my-4"
              data-testid="about-greeting-html"
              dangerouslySetInnerHTML={{ __html: greetingHtml || "" }}
            />
            {greetingSig && (
              <p className="mt-6 text-sm font-semibold text-accent">— {greetingSig}</p>
            )}
          </div>
        </div>
      </section>

      {/* 2. HISTORY */}
      <HistorySection
        dbImageUrl={worldwideImg}
        dbIntro={worldwideIntro ?? undefined}
        dbAreas={worldwideAreas}
      />

      {/* 3. COMPANY PHILOSOPHY */}
      <PhilosophySection
        dbWhyItems={data?.whyDostacItems ?? null}
        dbHeading={philosophyHeading ?? undefined}
        dbIntro={philosophyIntro ?? undefined}
        dbImageUrl={data?.philosophyImageUrl ?? null}
        dbPhilosophyCards={data?.philosophyCards ?? undefined}
        dbFounderHeading={founderHeading ?? undefined}
        dbFounderIntro={founderIntro ?? undefined}
        dbFounderOutro={founderOutro ?? undefined}
        dbFounderAreas={data?.founderAreas ?? undefined}
      />

      {/* 4. DIRECTIONS */}
      <section id="directions" className="scroll-mt-32 py-24 bg-[#f9f9f7]">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
              04 — {t("about.sections.directions") as string}
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              {t("about.directionsHeading") as string}
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
              {t("about.directionsSubText") as string}
            </p>
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* LEFT — info cards + CTA */}
            <div className="flex flex-col gap-4">
              {/* Info cards */}
              {[
                {
                  icon: MapPin,
                  label: t("about.directionsOfficeLabel") as string,
                  value: directionsAddress,
                  testId: "about-address",
                },
                {
                  icon: Mail,
                  label: t("about.directionsEmailLabel") as string,
                  value: "official@dostac.com",
                },
                {
                  icon: Clock,
                  label: t("about.directionsHoursLabel") as string,
                  value: t("about.directionsHoursValue") as string,
                },
                {
                  icon: Globe,
                  label: t("about.directionsInquiryLabel") as string,
                  value: t("about.directionsInquiryValue") as string,
                },
              ].map(({ icon: Icon, label, value, testId }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 bg-white rounded-2xl px-6 py-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/8 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                      {label}
                    </p>
                    <p
                      className="text-sm text-primary font-medium leading-relaxed whitespace-pre-line"
                      data-testid={testId}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              ))}

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mt-2">
                <Link href="/contact">
                  <button className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
                    {t("about.directionsCTAContact") as string}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/contact?type=oem">
                  <button className="inline-flex items-center gap-2 rounded-full border border-primary text-primary px-6 py-2.5 text-sm font-medium hover:bg-primary/5 transition-colors">
                    {t("about.directionsCTAOEM") as string}
                  </button>
                </Link>
              </div>
            </div>

            {/* RIGHT — premium map */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-100 aspect-[4/3] bg-slate-50">
              {/* subtle top label overlay */}
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-semibold text-primary">{t("about.mapLabel") as string}</span>
              </div>

              {data?.directionsMapEmbed ? (
                <iframe
                  src={forceEnglishMapUrl(data.directionsMapEmbed)}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="map"
                  data-testid="about-map"
                  className="w-full h-full"
                />
              ) : data?.directionsImageUrl ? (
                <img
                  src={data.directionsImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                  <MapPin className="h-14 w-14" />
                  <p className="text-xs font-medium text-slate-400 tracking-wide">
                    {t("about.directionsOfficeValue") as string}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function About() {
  return (
    <Layout>
      <AboutContent />
    </Layout>
  );
}
