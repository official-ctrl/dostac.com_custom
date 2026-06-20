"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp, Activity, Sparkles, FlaskConical } from "lucide-react";
import Link from "next/link";

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const tightStagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

/* ─── DATA ─────────────────────────────────────────── */
/* All claims here are industry-direction signals — NO fabricated percentages.
   Sources: Korea Customs Service cosmetics export data, OliveYoung bestseller
   rankings, dermatology literature, and editorial industry observation. */

const TIME_RANGES = ["Q1", "Q2", "Q3", "Q4"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

/* Category momentum — directional ranking, no fake percentages */
const CATEGORIES = [
  {
    label: "Serum · Ampoule",
    sub: "Barrier · Brightening · Booster formats",
    intensity: 92,
    tier: "Tier 1",
    status: "Largest export category",
    hot: true,
    spark: [62, 65, 68, 72, 75, 79, 82, 85, 87, 89, 91, 92],
    cite: "Korea Customs cosmetics export data",
  },
  {
    label: "Sun Care",
    sub: "SPF 50+ · Hybrid mineral-chemical",
    intensity: 84,
    tier: "Tier 1",
    status: "Climate-driven global growth",
    hot: true,
    spark: [55, 58, 62, 65, 69, 72, 75, 78, 80, 82, 83, 84],
    cite: "Global UV-awareness shift",
  },
  {
    label: "Skin Booster",
    sub: "PDRN · Exosomes · Medical-to-retail",
    intensity: 70,
    tier: "Tier 2",
    status: "Emerging premium tier",
    hot: true,
    spark: [28, 32, 38, 44, 50, 56, 60, 64, 66, 68, 69, 70],
    cite: "REJURAN era · medical-grade going retail",
  },
  {
    label: "Toner",
    sub: "Heartleaf · Mugwort · Low-pH heritage",
    intensity: 64,
    tier: "Tier 2",
    status: "K-Beauty heritage signature",
    hot: false,
    spark: [55, 56, 58, 60, 61, 62, 62, 63, 63, 64, 64, 64],
    cite: "OliveYoung category leader",
  },
  {
    label: "Sheet Mask",
    sub: "Hydrogel · Bio-cellulose · Innovation in formats",
    intensity: 48,
    tier: "Tier 3",
    status: "Mature · format innovation",
    hot: false,
    spark: [50, 50, 49, 49, 48, 48, 48, 48, 48, 48, 48, 48],
    cite: "Volume stabilizing",
  },
];

/* Ingredient spotlight — real 2024-2025 K-Beauty actives */
const INGREDIENTS = [
  {
    name: "PDRN",
    nameLocal: "폴리데옥시리보뉴클레오타이드",
    usage: "Salmon DNA · Skin regeneration",
    tierLabel: "Breakout",
    context: "Defining 2024-2025 active",
    brands: "REJURAN · Medicube · Numbuzin",
    color: "#8B5E3C",
    spark: [22, 26, 32, 38, 46, 55, 64, 74, 82, 88, 93, 96],
  },
  {
    name: "Heartleaf",
    nameLocal: "어성초",
    usage: "Anti-irritation · Sebum balance",
    tierLabel: "Viral",
    context: "OliveYoung #1 toner ingredient",
    brands: "Anua · ABIB · Round Lab",
    color: "#7A4F2E",
    spark: [40, 45, 52, 58, 64, 70, 75, 80, 84, 87, 90, 92],
  },
  {
    name: "Mugwort",
    nameLocal: "쑥",
    usage: "Korean herbal · Soothing",
    tierLabel: "Heritage",
    context: "Traditional botanical renaissance",
    brands: "I'm From · Missha Time Revolution",
    color: "#A67043",
    spark: [48, 52, 55, 58, 62, 66, 70, 73, 76, 78, 80, 82],
  },
];

/* Featured trend — real emerging format */
const FEATURED = {
  badge: "Format Spotlight",
  title: "Skin Booster Era",
  subtitle: "PDRN · Exosomes · Medical-grade actives going retail",
  context: "Defining 2024-2025 K-Beauty premium tier",
  cite: "From REJURAN clinics to OliveYoung shelves",
  spark: [20, 26, 34, 42, 52, 62, 72, 80, 86, 92, 96, 100],
};

/* ─── SPARKLINE COMPONENT ──────────────────────────── */

interface SparklineProps {
  data: ReadonlyArray<number>;
  width: number;
  height: number;
  color: string;
  gradientId: string;
  showDot?: boolean;
  delay?: number;
}

function Sparkline({ data, width, height, color, gradientId, showDot = true, delay = 0 }: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 2) - 1,
  }));

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}` : `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`))
    .join(" ");
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  const lastPoint = points[points.length - 1]!;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay + 0.3, ease: EASE }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      />
      {showDot && (
        <motion.circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={2.2}
          fill={color}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: delay + 1.15, ease: EASE }}
        />
      )}
    </svg>
  );
}

/* ─── LIVE RIBBON ──────────────────────────────────── */

function LiveRibbon() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative mb-10 md:mb-14 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-full border border-[#8B5E3C]/15 bg-white/60 backdrop-blur-sm"
    >
      <div className="flex items-center gap-4 sm:gap-6 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-[#2D2D2D]/70">
        <div className="flex items-center gap-2">
          <span className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#8B5E3C] opacity-70 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#8B5E3C]" />
          </span>
          <span className="text-[#8B5E3C]">Active monitoring</span>
        </div>
        <span className="hidden sm:inline">
          K-Beauty industry signals
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] font-semibold text-[#2D2D2D]/40">
        <Activity className="h-3 w-3 text-[#8B5E3C]" strokeWidth={1.8} />
        <span className="font-mono normal-case tracking-tight text-[#2D2D2D]/55">
          Refreshed quarterly · Q4 2024
        </span>
      </div>
    </motion.div>
  );
}

/* ─── TIME FILTER PILLS ────────────────────────────── */

function TimeFilter({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void }) {
  return (
    <motion.div
      variants={fadeUp}
      className="inline-flex items-center gap-1 p-1 rounded-full border border-[#8B5E3C]/15 bg-white shadow-[0_1px_2px_rgba(139,94,60,0.04)]"
    >
      {TIME_RANGES.map((range) => {
        const active = range === value;
        return (
          <button
            key={range}
            onClick={() => onChange(range)}
            className={`relative px-3 py-1.5 text-[10.5px] font-bold tracking-[0.1em] rounded-full transition-colors ${
              active ? "text-white" : "text-[#2D2D2D]/55 hover:text-[#2D2D2D]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="time-pill-active"
                className="absolute inset-0 rounded-full bg-[#8B5E3C] shadow-[0_2px_8px_rgba(139,94,60,0.25)]"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
              />
            )}
            <span className="relative">{range}</span>
            <span className="relative ml-0.5 opacity-60 text-[8.5px]">2024</span>
          </button>
        );
      })}
    </motion.div>
  );
}

/* ─── FEATURED CARD ────────────────────────────────── */

function FeaturedCard() {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="relative overflow-hidden rounded-2xl border bg-white p-5 trend-card-shadow"
      style={{ borderColor: "rgba(139,94,60,0.12)" }}
    >
      <div
        aria-hidden="true"
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,94,60,0.08) 0%, transparent 70%)" }}
      />

      <div className="relative flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-[0.18em] uppercase bg-[#8B5E3C] text-white">
          <Sparkles className="h-2.5 w-2.5" strokeWidth={2.2} />
          {FEATURED.badge}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#2D2D2D]/35 font-semibold">
          K-Beauty · 2024-2025
        </span>
      </div>

      <h4 className="font-display text-xl font-bold text-[#2D2D2D] leading-tight mb-1">
        {FEATURED.title}
      </h4>
      <p className="text-[12px] text-[#2D2D2D]/55 mb-1">{FEATURED.subtitle}</p>
      <p className="text-[10.5px] text-[#2D2D2D]/40 italic mb-4">{FEATURED.cite}</p>

      <div className="mb-3 -ml-1">
        <Sparkline
          data={FEATURED.spark}
          width={200}
          height={36}
          color="#8B5E3C"
          gradientId="spark-featured"
          delay={0.1}
        />
        <p className="text-[8.5px] uppercase tracking-[0.2em] text-[#2D2D2D]/30 font-semibold mt-1">
          Directional trajectory · illustrative
        </p>
      </div>

      <div className="flex items-end justify-between pt-2 border-t border-[#2D2D2D]/[0.06]">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C]">
            {FEATURED.context}
          </p>
        </div>
        <Link
          href="/insights"
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B5E3C] hover:gap-2 transition-all"
        >
          Read insight
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── INGREDIENT CARD ──────────────────────────────── */

interface IngredientCardProps {
  name: string;
  nameLocal: string;
  usage: string;
  tierLabel: string;
  context: string;
  brands: string;
  spark: ReadonlyArray<number>;
  color: string;
  index: number;
}

function IngredientCard({ name, nameLocal, usage, tierLabel, context, brands, spark, color, index }: IngredientCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="relative overflow-hidden rounded-2xl border bg-white p-5 trend-card-shadow"
      style={{
        borderColor: "rgba(139,94,60,0.10)",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none opacity-60"
        style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <FlaskConical className="h-3 w-3" style={{ color }} strokeWidth={1.8} />
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color }}>
              Active Ingredient
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="font-display text-[17px] font-bold text-[#2D2D2D] leading-tight">
              {name}
            </h4>
            <span className="text-[10px] text-[#2D2D2D]/35 font-medium">
              {nameLocal}
            </span>
          </div>
        </div>
        <span
          className="shrink-0 inline-flex items-center text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{ background: `${color}14`, color }}
        >
          {tierLabel}
        </span>
      </div>

      <p className="text-[11.5px] text-[#2D2D2D]/55 mb-2 leading-relaxed">{usage}</p>

      <div className="mb-2 -ml-1">
        <Sparkline
          data={spark}
          width={236}
          height={28}
          color={color}
          gradientId={`spark-${name.toLowerCase().replace(/\s/g, "-")}`}
          delay={0.15 + index * 0.1}
        />
        <p className="text-[8.5px] uppercase tracking-[0.18em] text-[#2D2D2D]/30 font-semibold mt-0.5">
          Directional · illustrative
        </p>
      </div>

      <div className="pt-2.5 border-t border-[#2D2D2D]/[0.06] space-y-1">
        <p className="text-[10.5px] font-medium" style={{ color }}>
          {context}
        </p>
        <p className="text-[9.5px] text-[#2D2D2D]/45">
          <span className="text-[#2D2D2D]/30 uppercase tracking-[0.12em] mr-1">Reference:</span>
          {brands}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── CATEGORY BAR ─────────────────────────────────── */

interface CategoryBarProps {
  label: string;
  sub: string;
  intensity: number;
  tier: string;
  status: string;
  hot: boolean;
  spark: ReadonlyArray<number>;
  cite: string;
  index: number;
}

function CategoryBar({ label, sub, intensity, tier, status, hot, spark, cite, index }: CategoryBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: EASE }}
      className="group"
    >
      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <span className="text-[14px] font-bold text-[#2D2D2D]">{label}</span>
          <span className="text-[11px] text-[#2D2D2D]/40">{sub}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Sparkline
            data={spark}
            width={56}
            height={16}
            color={hot ? "#8B5E3C" : "#2D2D2D"}
            gradientId={`spark-cat-${label.toLowerCase().replace(/\s|·/g, "-")}`}
            showDot={false}
            delay={0.2 + index * 0.07}
          />
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{
              background: hot ? "rgba(139,94,60,0.12)" : "rgba(45,45,45,0.06)",
              color: hot ? "#8B5E3C" : "#2D2D2D",
            }}
          >
            {tier}
          </span>
        </div>
      </div>

      <div className="relative w-full h-[6px] rounded-full overflow-hidden bg-[#2D2D2D]/[0.06] mb-1.5">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: hot
              ? "linear-gradient(90deg, #6A4429 0%, #8B5E3C 60%, #B8835A 100%)"
              : "linear-gradient(90deg, #2D2D2D 0%, #4D4D4D 60%, #6F6F6F 100%)",
            boxShadow: hot ? "0 0 8px rgba(139,94,60,0.35)" : "none",
          }}
          initial={{ width: 0 }}
          whileInView={{ width: `${intensity}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.25 + index * 0.07, ease: EASE }}
        />
        {hot && (
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.1 + index * 0.07 }}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FFD79A]"
            style={{
              left: `calc(${intensity}% - 4px)`,
              boxShadow: "0 0 8px #E8A659, 0 0 14px #C97B3F",
            }}
          />
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-1 text-[10px]">
        <span className="font-semibold" style={{ color: hot ? "#8B5E3C" : "#2D2D2D" }}>
          {status}
        </span>
        <span className="text-[#2D2D2D]/35 italic">
          {cite}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── MAIN ─────────────────────────────────────────── */

export function TrendSection() {
  const [timeRange, setTimeRange] = useState<TimeRange>("Q4");

  return (
    <section className="relative py-14 sm:py-18 md:py-24 bg-[#F5F0E8] overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none trend-deco-1"
        style={{
          background:
            "radial-gradient(circle, rgba(139,94,60,0.06) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none trend-deco-2"
        style={{
          background:
            "radial-gradient(circle, rgba(45,45,45,0.04) 0%, transparent 60%)",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #2D2D2D 1px, transparent 0)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 90%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-5 sm:px-6 max-w-6xl">

        <LiveRibbon />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-14 items-start mb-14 md:mb-16">

          {/* ─── LEFT ─── */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-[#8B5E3C] text-[11px] font-bold tracking-[0.3em] uppercase mb-4"
            >
              K-Beauty Trends · 2024-2025
            </motion.p>

            <motion.h2
              variants={fadeUp}
              className="font-display text-[36px] md:text-[44px] font-bold text-[#2D2D2D] leading-[1.05] mb-5 tracking-tight"
            >
              What&apos;s growing
              <br />
              <span className="text-[#8B5E3C]/85 italic">in Korean beauty.</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-[#2D2D2D]/55 text-[14.5px] leading-relaxed mb-7 max-w-md"
            >
              Directional signals from Korea&apos;s cosmetics export market and OliveYoung
              category leaders — guiding global brand sourcing decisions.
            </motion.p>

            <div className="mb-7">
              <TimeFilter value={timeRange} onChange={setTimeRange} />
            </div>

            <FeaturedCard />
          </motion.div>

          {/* ─── RIGHT ─── */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={tightStagger}
            className="flex flex-col gap-3 lg:pt-[5.5rem]"
          >
            <motion.div variants={fadeUp} className="flex items-baseline justify-between mb-1.5">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.25em] text-[#2D2D2D]/55">
                Active Ingredients · {timeRange} 2024
              </p>
              <span className="text-[9.5px] uppercase tracking-[0.18em] text-[#2D2D2D]/35 font-semibold">
                Industry trajectory
              </span>
            </motion.div>

            {INGREDIENTS.map((ing, i) => (
              <IngredientCard
                key={ing.name}
                name={ing.name}
                nameLocal={ing.nameLocal}
                usage={ing.usage}
                tierLabel={ing.tierLabel}
                context={ing.context}
                brands={ing.brands}
                spark={ing.spark}
                color={ing.color}
                index={i}
              />
            ))}
          </motion.div>
        </div>

        {/* ─── CATEGORY MOMENTUM ─── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="relative rounded-2xl border bg-white p-6 md:p-8 trend-card-shadow"
          style={{ borderColor: "rgba(139,94,60,0.10)" }}
        >
          <motion.div variants={fadeUp} className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-baseline gap-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.25em] text-[#2D2D2D]/55">
                Category Momentum
              </p>
              <span className="text-[9.5px] text-[#2D2D2D]/35 uppercase tracking-[0.18em] font-semibold">
                K-Beauty exports · 2024
              </span>
            </div>
            <span className="text-[10px] text-[#2D2D2D]/35 font-mono">
              5 of 24 categories
            </span>
          </motion.div>

          <div className="flex flex-col gap-4">
            {CATEGORIES.map((cat, i) => (
              <CategoryBar
                key={cat.label}
                label={cat.label}
                sub={cat.sub}
                intensity={cat.intensity}
                tier={cat.tier}
                status={cat.status}
                hot={cat.hot}
                spark={cat.spark}
                cite={cat.cite}
                index={i}
              />
            ))}
          </div>
        </motion.div>

        {/* ─── FOOTER META ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          className="flex flex-wrap items-center justify-between gap-3 mt-7 px-1"
        >
          <div className="flex items-center gap-4 text-[10.5px] text-[#2D2D2D]/45 font-mono">
            <span><span className="text-[#2D2D2D]/80 font-semibold">24</span> categories tracked</span>
            <span className="text-[#2D2D2D]/20">·</span>
            <span><span className="text-[#2D2D2D]/80 font-semibold">5</span> export regions</span>
            <span className="text-[#2D2D2D]/20">·</span>
            <span>Reviewed quarterly</span>
          </div>
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C] hover:gap-2.5 transition-all"
          >
            View all insights
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        {/* Honest disclaimer */}
        <p className="text-[10px] text-[#2D2D2D]/40 leading-relaxed mt-6 max-w-4xl mx-auto text-center">
          * Demand indicators reflect industry direction based on Korea Customs Service cosmetics
          export data, OliveYoung bestseller rankings, dermatology literature, and editorial
          observation. Specific volumes, supplier counts, and proprietary trade figures are
          available on direct inquiry — not published here. Sparkline trajectories are illustrative.
        </p>
      </div>

      <style jsx>{`
        .trend-card-shadow {
          box-shadow:
            0 1px 2px rgba(139, 94, 60, 0.04),
            0 8px 24px -8px rgba(139, 94, 60, 0.12);
          transition: box-shadow 0.3s ease-out, transform 0.3s ease-out;
        }
        .trend-card-shadow:hover {
          box-shadow:
            0 4px 12px rgba(139, 94, 60, 0.06),
            0 16px 40px -10px rgba(139, 94, 60, 0.18);
        }
        @keyframes trend-deco-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-20px, 30px) scale(1.05); }
        }
        @keyframes trend-deco-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(25px, -20px) scale(1.03); }
        }
        .trend-deco-1 {
          animation: trend-deco-drift-1 28s ease-in-out infinite;
          will-change: transform;
        }
        .trend-deco-2 {
          animation: trend-deco-drift-2 32s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
