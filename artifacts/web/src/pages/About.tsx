import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang, type Lang } from "@/components/dostac/i18n";
import { SectionNav } from "@/components/dostac/SectionNav";
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

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT_EXPO } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const sectionHeaderStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

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
          <motion.div
            className="order-1 lg:order-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
          >
            <div className="rounded-2xl overflow-hidden shadow-md aspect-[4/5] lg:aspect-auto lg:h-[580px]">
              <img
                src={dbImageUrl || dostacImage("hero-production.webp")}
                alt={dbHeading || (t("about.philosophyHeading") as string)}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Left text column */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionHeaderStagger}
              className="mb-8"
            >
              <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
                {t("about.eyebrowPhilosophy") as string}
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] mb-6 leading-tight">
                {(dbHeading && dbHeading.trim()) ? dbHeading : (t("about.philosophyHeading") as string)}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {(dbIntro && dbIntro.trim()) ? dbIntro : (t("about.philosophyIntro") as string)}
              </motion.p>
            </motion.div>

            {/* 3 philosophy cards */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={stagger}
              className="space-y-4"
            >
              {philosophyCards.map((card, i) => {
                const Icon = PHILOSOPHY_CARD_ICONS[i % PHILOSOPHY_CARD_ICONS.length];
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4 items-start hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-shadow transition-transform duration-300"
                  >
                    <div className="text-accent mt-0.5 flex-shrink-0 bg-accent/10 rounded-lg p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A] mb-1">{card.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{card.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Why Dostac subsection */}
        <div className="mb-20">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionHeaderStagger}
            className="text-center mb-10"
          >
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
              {t("about.eyebrowWhy") as string}
            </motion.div>
            <motion.h3 variants={fadeUp} className="font-display text-2xl md:text-3xl font-bold text-[#0F172A]">
              {t("about.whyDostacHeading") as string}
            </motion.h3>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {whyDostacItems.map((item, i) => {
              const Icon = WHY_DOSTAC_ICONS[i % WHY_DOSTAC_ICONS.length];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4 items-start hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-shadow transition-transform duration-300"
                >
                  <div className="text-accent mt-0.5 flex-shrink-0 bg-accent/10 rounded-lg p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A] mb-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Founder Experience subsection */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
              {t("about.eyebrowFounder") as string}
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-[#0F172A] mb-6">
              {founderHeading}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line max-w-3xl">
              {founderIntro}
            </p>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8"
            >
              {founderAreas.map((area, i) => {
                const Icon = FOUNDER_AREA_ICONS[i % FOUNDER_AREA_ICONS.length];
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex gap-3 items-start hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-shadow transition-transform duration-300"
                  >
                    <div className="text-accent mt-0.5 flex-shrink-0 bg-accent/10 rounded-lg p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-snug self-center">
                      {area}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <div className="bg-slate-50 border-l-4 border-accent rounded-r-xl px-5 py-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {founderOutro}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
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
          {/* Right column image — rendered first in DOM for mobile */}
          <motion.div
            className="order-1 lg:order-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
          >
            <div className="rounded-2xl overflow-hidden shadow-md aspect-[4/5] lg:aspect-auto lg:h-[600px]">
              <img
                src={heroImg}
                alt={t("about.historyHeading") as string}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Left column text */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionHeaderStagger}
              className="mb-8"
            >
              <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
                {t("about.eyebrowStory") as string}
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] mb-6 leading-tight">
                {t("about.historyHeading") as string}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {introText}
              </motion.p>
            </motion.div>

            {/* Icon cards */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            >
              {areas.map((area, i) => {
                const Icon = HISTORY_AREA_ICONS[i % HISTORY_AREA_ICONS.length];
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex gap-3 items-start hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-shadow transition-transform duration-300"
                  >
                    <div className="text-accent mt-0.5 flex-shrink-0 bg-accent/10 rounded-lg p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-snug self-center">
                      {area}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Outro paragraph */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <div className="bg-slate-50 border-l-4 border-accent rounded-r-xl px-5 py-4">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {t("about.historyOutro") as string}
                </p>
              </div>
            </motion.div>
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
      <section className="relative w-full min-h-[420px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={dostacImage("hero-about.webp")}
            alt=""
            fetchPriority="high"
            loading="eager"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/70 via-[#0F172A]/60 to-[#0F172A]/75" />
        </div>
        <div className="container relative z-10 mx-auto px-6 py-24 text-center text-white">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.4em] text-white/60 font-semibold mb-5"
          >
            {t("about.eyebrowHero") as string || "DOSTAC"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-3xl mx-auto"
          >
            {t("about.heroTitle") as string}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
          >
            {t("about.heroSub") as string}
          </motion.p>
        </div>
      </section>

      <SectionNav
        items={SECTIONS.map((s) => ({ id: s.id, label: t(`about.sections.${s.id}`) as string }))}
        activeId={active}
        ariaLabel="About sections"
        testIdPrefix="about-tab-"
      />

      {/* 1. GREETING */}
      <section id="greeting" className="scroll-mt-32 py-20 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <motion.div
            className="lg:col-span-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border bg-muted">
              <img
                src={greetingImg}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          <motion.div
            className="lg:col-span-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={sectionHeaderStagger}
          >
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-2">
              01 — {t("about.sections.greeting") as string}
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] mb-6">
              {t("about.greetingsHeading") as string}
            </motion.h2>
            <motion.div
              variants={fadeUp}
              className="prose prose-slate max-w-none text-muted-foreground text-lg leading-relaxed prose-p:my-4"
              data-testid="about-greeting-html"
              dangerouslySetInnerHTML={{ __html: greetingHtml || "" }}
            />
            {greetingSig && (
              <motion.p variants={fadeUp} className="mt-6 text-sm font-semibold text-accent">— {greetingSig}</motion.p>
            )}
          </motion.div>
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
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionHeaderStagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
              04 — {t("about.sections.directions") as string}
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
              {t("about.directionsHeading") as string}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
              {t("about.directionsSubText") as string}
            </motion.p>
          </motion.div>

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
                      className="text-sm text-[#0F172A] font-medium leading-relaxed whitespace-pre-line"
                      data-testid={testId}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              ))}

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mt-2">
                <Link href="/contact?source=about#contact-form">
                  <button className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#0F172A]/90 transition-colors">
                    {t("about.directionsCTAContact") as string}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/contact?source=about&inquiryType=oem#contact-form">
                  <button className="inline-flex items-center gap-2 rounded-full border border-[#0F172A] text-[#0F172A] px-6 py-2.5 text-sm font-medium hover:bg-[#0F172A]/5 transition-colors">
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
                <span className="text-xs font-semibold text-[#0F172A]">{t("about.mapLabel") as string}</span>
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

      {/* CTA STRIP */}
      <section className="py-24 bg-[#0F172A] text-white text-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionHeaderStagger}
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold mb-4">
              {t("about.ctaEyebrow") as string}
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto leading-tight">
              {t("about.ctaHeading") as string}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              {t("about.ctaSub") as string}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/contact?source=about#contact-form"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-medium text-white shadow-sm hover:bg-accent/90 hover:shadow-accent/20 hover:shadow-md transition-all"
              >
                {t("about.ctaButton") as string}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
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
