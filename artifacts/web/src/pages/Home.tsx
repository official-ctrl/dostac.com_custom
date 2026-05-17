import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Shield,
  Globe2,
  Award,
  FlaskConical,
  Truck,
  Package,
  FileText,
  Tag,
  Factory,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang, type Lang } from "@/components/dostac/i18n";
import {
  useListPublicBanners,
  useListPublicProducts,
  useCreateContactInquiry,
  type PublicBanner,
} from "@workspace/api-client-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const LANG_FIELD: Record<
  Lang,
  { title: keyof PublicBanner["translations"]; desc: keyof PublicBanner["translations"] }
> = {
  ko: { title: "titleKo", desc: "descriptionKo" },
  en: { title: "titleEn", desc: "descriptionEn" },
  ja: { title: "titleJa", desc: "descriptionJa" },
  zh: { title: "titleZh", desc: "descriptionZh" },
  vi: { title: "titleVi", desc: "descriptionVi" },
};

function pickBannerText(b: PublicBanner, lang: Lang) {
  const fields = LANG_FIELD[lang];
  const title =
    (b.translations[fields.title] as string | null | undefined) ??
    b.translations.titleKo ??
    "";
  const description =
    (b.translations[fields.desc] as string | null | undefined) ??
    b.translations.descriptionKo ??
    "";
  return { title, description };
}

/* ─────────────────────────────────────────────
   1. HERO SECTION (banner slider)
───────────────────────────────────────────── */
function HeroSection() {
  const { lang } = useLang();
  const { t } = useT();
  const { data, isLoading } = useListPublicBanners();
  const banners = data ?? [];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % banners.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [banners.length]);

  useEffect(() => {
    if (active >= banners.length) setActive(0);
  }, [banners.length, active]);

  const go = (next: number) =>
    setActive(((next % banners.length) + banners.length) % banners.length);

  if (isLoading || banners.length === 0) {
    return (
      <section className="relative w-full min-h-[92vh] overflow-hidden bg-[#0F172A]">
        <img
          src={dostacImage("hero-home.webp")}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/90 via-[#0F172A]/60 to-white/80" />
        <HeroTextOverlay
          title={t("homeNew.heroFallbackTitle") as string}
          description={t("homeNew.heroFallbackDesc") as string}
        />
      </section>
    );
  }

  return (
    <section
      className="relative w-full min-h-[92vh] overflow-hidden bg-[#0F172A]"
      data-testid="home-slider"
    >
      {banners.map((b, i) => {
        const text = pickBannerText(b, lang);
        const isActive = i === active;
        return (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!isActive}
          >
            {/* Background: optional link wraps only the image/overlay */}
            {b.linkUrl ? (
              <a href={b.linkUrl} className="absolute inset-0 block z-0" tabIndex={-1} aria-hidden="true">
                <img
                  src={b.imageUrl ?? ""}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = dostacImage("hero-home.webp");
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/85 via-[#0F172A]/55 to-white/75" />
              </a>
            ) : (
              <>
                {b.imageUrl && (
                  <img
                    src={b.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = dostacImage("hero-home.webp");
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/85 via-[#0F172A]/55 to-white/75" />
              </>
            )}
            {/* Text + CTAs: always outside the banner link */}
            <HeroTextOverlay
              title={text.title || (t("homeNew.heroFallbackTitle") as string)}
              description={text.description || (t("homeNew.heroFallbackDesc") as string)}
            />
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(active - 1)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur transition"
            aria-label="Previous slide"
            data-testid="banner-prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur transition"
            aria-label="Next slide"
            data-testid="banner-next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-10 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                data-testid={`banner-dot-${i}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-8 bg-accent" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function HeroTextOverlay({ title, description }: { title: string; description: string }) {
  const { t } = useT();
  return (
    <div className="relative z-10 flex items-center min-h-[92vh] w-full pointer-events-none">
      <div className="container mx-auto px-6 py-24 max-w-5xl">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="max-w-3xl pointer-events-auto"
        >
          <motion.p
            variants={fadeUp}
            className="uppercase tracking-[0.3em] text-xs text-accent font-bold mb-5"
          >
            {t("homeNew.heroEyebrow") as string}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-6"
          >
            {title}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl"
          >
            {description}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <Link href="/contact">
              <Button
                size="lg"
                className="rounded-full bg-accent hover:bg-accent/90 text-white h-13 px-8 text-base font-semibold shadow-lg shadow-accent/25"
              >
                {t("homeNew.heroCtaOem") as string} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white h-13 px-8 text-base font-semibold"
              >
                {t("homeNew.heroCtaContact") as string}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   2. TRUST BADGES
───────────────────────────────────────────── */
const TRUST_ICONS = [Award, Shield, CheckCircle2, Globe2, FlaskConical];

function TrustSection() {
  const { t } = useT();
  const badges = t("homeNew.trustBadges") as Array<{ label: string; sub: string }>;

  return (
    <section className="py-10 bg-white border-b border-slate-100">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {badges.map((badge, idx) => {
            const Icon = TRUST_ICONS[idx] ?? Award;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="flex flex-col items-center text-center gap-2 p-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center mb-1">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-bold text-[#0F172A]">{badge.label}</span>
                <span className="text-xs text-slate-500">{badge.sub}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. PRODUCTION FLOW
───────────────────────────────────────────── */
function ProductionFlowSection() {
  const { t } = useT();
  const flowSteps = t("homeNew.flowSteps") as Array<{ step: string; title: string; desc: string }>;

  return (
    <section className="py-20 md:py-28 bg-[#F5F7FA]">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <p className="uppercase tracking-[0.25em] text-xs font-bold text-accent mb-3">
            {t("homeNew.flowEyebrow") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight">
            {t("homeNew.flowHeading") as string}
          </h2>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[2.2rem] left-[10%] right-[10%] h-px bg-slate-300 z-0" />
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-4"
          >
            {flowSteps.map((s, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="relative z-10 w-[4.5rem] h-[4.5rem] rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mb-5 shadow-sm group-hover:border-accent group-hover:shadow-accent/20 group-hover:shadow-md transition-all">
                  <span className="font-display font-bold text-accent text-sm">{s.step}</span>
                </div>
                <h3 className="font-bold text-[#0F172A] text-sm mb-1.5">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. PRODUCT SHOWCASE
───────────────────────────────────────────── */
const PRODUCT_IMAGES = [
  "product-baby-wipes.webp",
  "product-01.webp",
  "product-02.webp",
  "product-03.webp",
  "product-04.webp",
  "product-05.webp",
];

const FALLBACK_CATEGORIES = [
  { name: "Wet Wipes", badge: "Baby / Feminine / General" },
  { name: "Deodorant Tissues", badge: "Active / Daily" },
  { name: "Household Wipes", badge: "Cleaning / Hygiene" },
  { name: "Sanitary Products", badge: "OEM / ODM" },
  { name: "Disposable Items", badge: "Single-Use" },
  { name: "Specialty Wipes", badge: "Custom Formula" },
];

function ProductShowcaseSection() {
  const { t } = useT();
  const { lang } = useLang();
  const { data } = useListPublicProducts({ lang });
  const products = data ?? [];

  const displayItems = products.length > 0
    ? products.slice(0, 6).map((p: { name: string; category: string }, i: number) => ({
        name: p.name,
        badge: p.category || "OEM / ODM",
        imageKey: PRODUCT_IMAGES[i] ?? "product-01.webp",
      }))
    : FALLBACK_CATEGORIES.map((cat, i) => ({
        name: cat.name,
        badge: cat.badge,
        imageKey: PRODUCT_IMAGES[i] ?? "product-01.webp",
      }));

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <p className="uppercase tracking-[0.25em] text-xs font-bold text-accent mb-3">
            {t("homeNew.showcaseEyebrow") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight mb-4">
            {t("homeNew.showcaseHeading") as string}
          </h2>
          <p className="text-slate-500 text-base">{t("homeNew.showcaseSub") as string}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {displayItems.map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              className="group rounded-2xl overflow-hidden border border-slate-100 hover:border-accent/30 hover:shadow-xl transition-all bg-white"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#F5F7FA]">
                <img
                  src={dostacImage(item.imageKey)}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="inline-block text-xs font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full mb-3">
                  {item.badge}
                </span>
                <h3 className="font-bold text-[#0F172A] text-base">{item.name}</h3>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center">
          <Link href="/products">
            <Button
              size="lg"
              className="rounded-full bg-accent hover:bg-accent/90 text-white h-12 px-10 text-sm font-semibold shadow-sm"
            >
              {t("homeNew.showcaseCta") as string} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. FACTORY & QUALITY
───────────────────────────────────────────── */
const QC_ICONS = [Shield, CheckCircle2, Award, Factory];

function FactoryQualitySection() {
  const { t } = useT();
  const qcPoints = t("homeNew.qcPoints") as Array<{ title: string; desc: string }>;

  return (
    <section className="py-20 md:py-28 bg-[#F5F7FA]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <p className="uppercase tracking-[0.25em] text-xs font-bold text-accent mb-3">
              {t("homeNew.factoryEyebrow") as string}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight mb-5">
              {t("homeNew.factoryHeading") as string}
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              {t("homeNew.factoryBody") as string}
            </p>
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-200">
              <img
                src={dostacImage("hero-production.webp")}
                alt="Factory"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="flex flex-col gap-6"
          >
            {qcPoints.map((pt, idx) => {
              const Icon = QC_ICONS[idx] ?? Shield;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="flex gap-5 p-5 rounded-2xl bg-white border border-slate-100 hover:border-accent/25 hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-sm mb-1">{pt.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{pt.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   6. GLOBAL DISTRIBUTION (with SVG world map)
───────────────────────────────────────────── */

/* Approximate export country dot positions in a 1000×500 equirectangular viewBox.
   Formula: x = (lng + 180) / 360 * 1000,  y = (90 - lat) / 180 * 500          */
const EXPORT_DOTS = [
  { id: "jp", x: 888, y: 174 },
  { id: "cn", x: 820, y: 139 },
  { id: "tw", x: 837, y: 181 },
  { id: "hk", x: 817, y: 188 },
  { id: "vn", x: 794, y: 192 },
  { id: "th", x: 779, y: 213 },
  { id: "my", x: 782, y: 242 },
  { id: "id", x: 796, y: 268 },
  { id: "ae", x: 651, y: 181 },
  { id: "sa", x: 629, y: 183 },
  { id: "kw", x: 631, y: 168 },
  { id: "qa", x: 643, y: 181 },
  { id: "us", x: 295, y: 136 },
  { id: "de", x: 537, y: 104 },
  { id: "fr", x: 506, y: 114 },
  { id: "gb", x: 500, y: 106 },
];

/* Korea (Dostac HQ) */
const KOREA_DOT = { x: 860, y: 162 };

/* Simplified continent outlines for visual reference */
const CONTINENT_PATHS = [
  /* North America */
  "M 95,55 L 200,52 L 245,80 L 258,128 L 238,185 L 196,212 L 158,218 L 128,192 L 90,148 L 80,98 Z",
  /* South America */
  "M 200,222 L 262,220 L 285,260 L 290,325 L 268,382 L 228,400 L 192,362 L 172,302 L 178,252 Z",
  /* Europe */
  "M 458,58 L 562,54 L 578,92 L 568,132 L 516,142 L 474,122 L 452,90 Z",
  /* Africa */
  "M 468,132 L 580,130 L 604,202 L 608,312 L 568,382 L 518,396 L 476,372 L 452,302 L 448,202 Z",
  /* Asia (simplified) */
  "M 572,48 L 902,48 L 934,88 L 918,152 L 868,200 L 818,222 L 768,242 L 718,252 L 678,232 L 638,202 L 598,180 L 580,140 L 572,90 Z",
  /* Australia */
  "M 792,272 L 892,268 L 922,302 L 910,372 L 858,392 L 798,372 L 774,332 Z",
];

function WorldMapSVG() {
  return (
    <svg
      viewBox="0 0 1000 500"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Continent fills */}
      {CONTINENT_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
      ))}

      {/* Connection lines from Korea to export dots */}
      {EXPORT_DOTS.map((dot) => (
        <line
          key={`line-${dot.id}`}
          x1={KOREA_DOT.x}
          y1={KOREA_DOT.y}
          x2={dot.x}
          y2={dot.y}
          stroke="#FF6A1A"
          strokeWidth="0.6"
          strokeOpacity="0.25"
          strokeDasharray="3 4"
        />
      ))}

      {/* Export country dots */}
      {EXPORT_DOTS.map((dot) => (
        <g key={`dot-${dot.id}`}>
          <circle cx={dot.x} cy={dot.y} r="5" fill="#FF6A1A" opacity="0.25" />
          <circle cx={dot.x} cy={dot.y} r="3" fill="#FF6A1A" opacity="0.7" />
        </g>
      ))}

      {/* Korea HQ dot (larger, white) */}
      <circle cx={KOREA_DOT.x} cy={KOREA_DOT.y} r="8" fill="#FF6A1A" opacity="0.2" />
      <circle cx={KOREA_DOT.x} cy={KOREA_DOT.y} r="5" fill="#FF6A1A" opacity="0.9" />
      <circle cx={KOREA_DOT.x} cy={KOREA_DOT.y} r="2.5" fill="#ffffff" />
    </svg>
  );
}

const REGION_COLORS = [
  "from-orange-500/30 to-orange-500/5",
  "from-blue-500/30 to-blue-500/5",
  "from-emerald-500/30 to-emerald-500/5",
  "from-purple-500/30 to-purple-500/5",
];

function GlobalDistributionSection() {
  const { t } = useT();
  const globalStats = t("homeNew.globalStats") as Array<{ value: string; label: string }>;
  const exportRegions = t("homeNew.exportRegions") as Array<{ region: string; countries: string[] }>;

  return (
    <section className="py-20 md:py-28 bg-[#0F172A] text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <p className="uppercase tracking-[0.25em] text-xs font-bold text-accent mb-3">
            {t("homeNew.globalEyebrow") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4">
            {t("homeNew.globalHeading") as string}
          </h2>
          <p className="text-white/65 text-base">{t("homeNew.globalSub") as string}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
        >
          {globalStats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="font-display text-3xl md:text-4xl font-bold text-accent mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* SVG World Map */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          className="w-full rounded-2xl overflow-hidden border border-white/10 bg-white/3 mb-10"
          style={{ maxHeight: 320 }}
        >
          <WorldMapSVG />
        </motion.div>

        {/* Region cards */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {exportRegions.map((region, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/30 transition-colors"
            >
              <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${REGION_COLORS[idx] ?? REGION_COLORS[0]} mb-4`} />
              <h3 className="font-bold text-white text-sm mb-3">{region.region}</h3>
              <div className="flex flex-wrap gap-1.5">
                {region.countries.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 text-xs text-white/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/10"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    {c}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   7. OEM / ODM SERVICES
───────────────────────────────────────────── */
const SERVICE_ICONS = [FlaskConical, Package, Tag, Truck, FileText];

function OEMServicesSection() {
  const { t } = useT();
  const serviceCards = t("homeNew.serviceCards") as Array<{ title: string; desc: string }>;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <p className="uppercase tracking-[0.25em] text-xs font-bold text-accent mb-3">
            {t("homeNew.servicesEyebrow") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight mb-4">
            {t("homeNew.servicesHeading") as string}
          </h2>
          <p className="text-slate-500 text-base">{t("homeNew.servicesSub") as string}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {serviceCards.map((card, idx) => {
            const Icon = SERVICE_ICONS[idx] ?? FlaskConical;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="group p-7 rounded-2xl border border-slate-100 hover:border-accent/30 hover:shadow-xl transition-all bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent transition-colors">
                  <Icon className="h-5 w-5 text-accent group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-[#0F172A] text-base mb-2">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}

          {/* CTA card */}
          <motion.div
            variants={fadeUp}
            className="p-7 rounded-2xl bg-accent text-white flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-lg mb-3">{t("homeNew.servicesCtaTitle") as string}</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                {t("homeNew.servicesCtaDesc") as string}
              </p>
            </div>
            <Link href="/contact">
              <Button
                size="sm"
                className="rounded-full bg-white text-accent hover:bg-white/90 font-semibold w-full"
              >
                {t("homeNew.servicesCtaBtn") as string} <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   8. CONTACT / RFQ
───────────────────────────────────────────── */
const NONE_VALUE = "__none__";

function ContactRFQSection() {
  const { t } = useT();
  const rfqBullets = t("homeNew.rfqBullets") as string[];

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: "" as "" | "oem" | "odm" | "sample" | "other",
    moq: "",
    packagingType: "",
    targetCountry: "",
    productCategory: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInquiry = useCreateContactInquiry({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        setError(null);
        setForm({
          name: "", email: "", company: "", inquiryType: "",
          moq: "", packagingType: "", targetCountry: "", productCategory: "", message: "",
        });
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
        setError(msg);
      },
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError(t("homeNew.rfqValidation") as string);
      return;
    }
    const extras: string[] = [];
    if (form.moq) extras.push(`MOQ: ${form.moq}`);
    if (form.packagingType) extras.push(`Packaging: ${form.packagingType}`);
    if (form.targetCountry) extras.push(`Target Country: ${form.targetCountry}`);
    if (form.productCategory) extras.push(`Category: ${form.productCategory}`);

    const fullMessage = extras.length > 0
      ? `${form.message}\n\n--- RFQ Details ---\n${extras.join("\n")}`
      : form.message;

    createInquiry.mutate({
      data: {
        name: form.name,
        email: form.email,
        company: form.company || undefined,
        inquiryType: form.inquiryType || undefined,
        message: fullMessage,
      },
    });
  };

  return (
    <section className="py-20 md:py-28 bg-[#F5F7FA]" id="rfq">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <p className="uppercase tracking-[0.25em] text-xs font-bold text-accent mb-3">
              {t("homeNew.rfqEyebrow") as string}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight mb-5">
              {t("homeNew.rfqHeading") as string}
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              {t("homeNew.rfqBody") as string}
            </p>
            <div className="flex flex-col gap-4">
              {rfqBullets.map((bullet, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{bullet}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
              {success ? (
                <div className="flex flex-col items-center text-center py-10 gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-bold text-[#0F172A] text-lg">
                    {t("homeNew.rfqSuccessTitle") as string}
                  </h3>
                  <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                    {t("homeNew.rfqSuccessContactNote") as string}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full mt-2"
                    onClick={() => setSuccess(false)}
                  >
                    {t("homeNew.rfqSuccessReset") as string}
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="rfq-name" className="text-sm font-semibold text-slate-700">
                        {t("homeNew.rfqName") as string} <span className="text-accent">*</span>
                      </Label>
                      <Input
                        id="rfq-name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder={t("homeNew.rfqName") as string}
                        required
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="rfq-email" className="text-sm font-semibold text-slate-700">
                        {t("homeNew.rfqEmail") as string} <span className="text-accent">*</span>
                      </Label>
                      <Input
                        id="rfq-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder={t("homeNew.rfqPhEmail") as string}
                        required
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="rfq-company" className="text-sm font-semibold text-slate-700">
                        {t("homeNew.rfqCompany") as string}
                      </Label>
                      <Input
                        id="rfq-company"
                        value={form.company}
                        onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                        placeholder={t("homeNew.rfqCompany") as string}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-semibold text-slate-700">
                        {t("homeNew.rfqInquiryType") as string}
                      </Label>
                      <Select
                        value={form.inquiryType || NONE_VALUE}
                        onValueChange={(v) =>
                          setForm((f) => ({
                            ...f,
                            inquiryType: v === NONE_VALUE ? "" : (v as typeof f.inquiryType),
                          }))
                        }
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue placeholder={t("homeNew.rfqInquiryType") as string} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>{t("homeNew.rfqInquiryType") as string}</SelectItem>
                          <SelectItem value="oem">OEM</SelectItem>
                          <SelectItem value="odm">ODM</SelectItem>
                          <SelectItem value="sample">Sample</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="rfq-moq" className="text-sm font-semibold text-slate-700">
                        {t("homeNew.rfqMoq") as string}
                      </Label>
                      <Input
                        id="rfq-moq"
                        value={form.moq}
                        onChange={(e) => setForm((f) => ({ ...f, moq: e.target.value }))}
                        placeholder={t("homeNew.rfqPhMoq") as string}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="rfq-packaging" className="text-sm font-semibold text-slate-700">
                        {t("homeNew.rfqPackaging") as string}
                      </Label>
                      <Input
                        id="rfq-packaging"
                        value={form.packagingType}
                        onChange={(e) => setForm((f) => ({ ...f, packagingType: e.target.value }))}
                        placeholder={t("homeNew.rfqPhPackaging") as string}
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="rfq-country" className="text-sm font-semibold text-slate-700">
                        {t("homeNew.rfqCountry") as string}
                      </Label>
                      <Input
                        id="rfq-country"
                        value={form.targetCountry}
                        onChange={(e) => setForm((f) => ({ ...f, targetCountry: e.target.value }))}
                        placeholder={t("homeNew.rfqPhCountry") as string}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="rfq-category" className="text-sm font-semibold text-slate-700">
                        {t("homeNew.rfqCategory") as string}
                      </Label>
                      <Input
                        id="rfq-category"
                        value={form.productCategory}
                        onChange={(e) => setForm((f) => ({ ...f, productCategory: e.target.value }))}
                        placeholder={t("homeNew.rfqPhCategory") as string}
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="rfq-message" className="text-sm font-semibold text-slate-700">
                      {t("homeNew.rfqMessage") as string} <span className="text-accent">*</span>
                    </Label>
                    <Textarea
                      id="rfq-message"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder={t("homeNew.rfqPhMessage") as string}
                      rows={4}
                      required
                      className="text-sm resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={createInquiry.isPending}
                    className="rounded-full bg-accent hover:bg-accent/90 text-white h-11 font-semibold w-full mt-1"
                  >
                    {createInquiry.isPending ? (
                      t("homeNew.rfqSending") as string
                    ) : (
                      <>
                        {t("homeNew.rfqSubmit") as string} <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PAGE ASSEMBLY
───────────────────────────────────────────── */
export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <TrustSection />
      <ProductionFlowSection />
      <ProductShowcaseSection />
      <FactoryQualitySection />
      <GlobalDistributionSection />
      <OEMServicesSection />
      <ContactRFQSection />
    </Layout>
  );
}
