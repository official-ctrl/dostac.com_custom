"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Globe2, Activity } from "lucide-react";
import type { HoverPayload, GlobeCanvasProps } from "./GlobeCanvas";
import { CityHoverCard } from "./CityDossier";

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};
const cardEntry = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const tightStagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

/* Featured region — gets the BIG card treatment (Asia-Pacific is brand origin) */
const FEATURED_REGION = {
  name: "Asia-Pacific",
  tier: "Tier 1 · Origin region",
  count: 8,
  cities: "Seoul · Tokyo · Shanghai · Singapore · Sydney",
  more: "+3 cities",
} as const;

/* Compact small cards — each with its own visual accent */
const REGION_CARDS = [
  { key: "me", name: "Middle East", count: 3, sample: "Dubai · Riyadh · Doha",        accent: "warm-amber" },
  { key: "eu", name: "Europe",      count: 3, sample: "London · Paris · Frankfurt",   accent: "cool-cream" },
  { key: "am", name: "Americas",    count: 5, sample: "NYC · LA · São Paulo",          accent: "warm-gold" },
  { key: "af", name: "Africa",      count: 4, sample: "Cairo · Lagos · Joburg",        accent: "deep-terra" },
] as const;

const ACCENT_STYLES: Record<string, { bg: string; corner: string }> = {
  "warm-amber":  { bg: "rgba(232,160,82,0.05)",  corner: "rgba(232,160,82,0.18)" },
  "cool-cream":  { bg: "rgba(245,240,232,0.025)", corner: "rgba(245,240,232,0.12)" },
  "warm-gold":   { bg: "rgba(184,131,90,0.05)",  corner: "rgba(184,131,90,0.18)" },
  "deep-terra":  { bg: "rgba(139,94,60,0.06)",   corner: "rgba(139,94,60,0.22)" },
};

const ACTIVITY_FEED = [
  { city: "Paris",        event: "NEW RFQ" },
  { city: "Dubai",        event: "FACTORY MATCHED" },
  { city: "New York",     event: "FORMULA APPROVED" },
  { city: "São Paulo",    event: "SAMPLE SHIPPED" },
  { city: "Singapore",    event: "ORDER CONFIRMED" },
  { city: "London",       event: "QUOTE SENT" },
  { city: "Lagos",        event: "BATCH IN TRANSIT" },
  { city: "Tokyo",        event: "SUPPLIER VERIFIED" },
  { city: "Bangkok",      event: "SAMPLE REQUESTED" },
  { city: "Riyadh",       event: "FACTORY MATCHED" },
  { city: "Frankfurt",    event: "BATCH IN TRANSIT" },
  { city: "Mumbai",       event: "SAMPLE SHIPPED" },
  { city: "Cairo",        event: "QUOTE SENT" },
  { city: "Johannesburg", event: "ORDER CONFIRMED" },
];

const STATS = [
  { value: "47",   label: "Markets" },
  { value: "24",   label: "Cities" },
  { value: "KGMP", label: "Certified" },
  { value: "B2B",  label: "Focused" },
];

/* Smaller globe — must fit in viewport-height budget */
function useGlobeSize() {
  const [size, setSize] = useState(440);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      /* Mobile: must leave room for cards stack above */
      if (w < 380) return 240;
      if (w < 480) return 280;
      if (w < 640) return 320;
      if (w < 768) return 360;
      if (w < 1024) return 380;
      if (w < 1280) return 420;
      return 460;
    };
    const update = () => setSize(compute());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

function useLiveFeed() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, []);
  const visible = useMemo(() => {
    const out = [];
    for (let i = 0; i < 3; i++) {
      const item = ACTIVITY_FEED[(tick + i) % ACTIVITY_FEED.length];
      if (item) out.push(item);
    }
    return out;
  }, [tick]);
  return { tick, visible };
}

export function SupplyChainSection() {
  const globeSize = useGlobeSize();
  const [hover, setHover] = useState<HoverPayload | null>(null);
  const { tick, visible } = useLiveFeed();

  /* Lazy-load the heavy canvas component — avoids webpack async chunks in CF edge SSR */
  type GlobeCanvasType = React.ComponentType<GlobeCanvasProps>;
  const [GlobeCanvas, setGlobeCanvas] = useState<GlobeCanvasType | null>(null);
  useEffect(() => {
    let active = true;
    import("./GlobeCanvas").then((m) => {
      if (active) setGlobeCanvas(() => m.GlobeCanvas);
    });
    return () => { active = false; };
  }, []);

  return (
    <section
      className="relative py-12 md:py-16 overflow-hidden"
      style={{ backgroundColor: "#0D1117" }}
    >
      {/* Intelligence grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,240,232,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,232,0.025) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 50% 55%, #000 30%, transparent 92%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 50% 55%, #000 30%, transparent 92%)",
        }}
      />

      {/* TERRA radial wash on globe side */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 45% 55% at 72% 55%, rgba(139,94,60,0.22) 0%, transparent 70%)",
        }}
      />

      {/* Drifting data particles */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: "10%", top: "22%", delay: "0s",   dur: "10s" },
          { left: "26%", top: "75%", delay: "2.4s", dur: "12s" },
          { left: "42%", top: "30%", delay: "5.1s", dur: "9s"  },
          { left: "60%", top: "82%", delay: "1.2s", dur: "13s" },
          { left: "78%", top: "20%", delay: "3.8s", dur: "11s" },
          { left: "90%", top: "60%", delay: "6.5s", dur: "10s" },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#E9A052]/55 supply-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-5 sm:px-6 max-w-5xl">

        {/* ── Compact centered header ── */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="max-w-xl mx-auto text-center mb-7 md:mb-9"
        >
          <motion.p
            variants={fadeUp}
            className="text-[#8B5E3C] text-[10px] font-bold tracking-[0.3em] uppercase mb-3 inline-flex items-center gap-2.5"
          >
            <span className="w-5 h-px bg-[#8B5E3C]/60" />
            Supply Chain Network
            <span className="w-5 h-px bg-[#8B5E3C]/60" />
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-display text-2xl md:text-[34px] font-bold text-[#F5F0E8] leading-[1.08] mb-2 tracking-tight"
          >
            Built in Korea.{" "}
            <span className="text-[#F5F0E8]/40 italic">Delivered everywhere.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-[#F5F0E8]/50 text-[13px] leading-relaxed"
          >
            A single verified Korean source — every continent, every city.
          </motion.p>
        </motion.div>

        {/* ── 2-col layout — single grid container (CSS in <style jsx> below) ── */}
        <div className="supply-grid">

            {/* ─── LEFT: card stack ─── */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={tightStagger}
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {/* Lead pill */}
              <motion.div variants={fadeUp} className="flex items-center gap-2 self-start mb-0.5">
                <Globe2 className="h-3.5 w-3.5 text-[#E9A052]" strokeWidth={1.5} />
                <span className="text-[9.5px] uppercase tracking-[0.22em] text-[#E9A052] font-semibold">
                  Wherever your brand sells
                </span>
              </motion.div>

              {/* ── FEATURED: Asia-Pacific (BIG card with rich visual) ── */}
              <motion.div
                variants={cardEntry}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-[#8B5E3C]/[0.08] via-[#8B5E3C]/[0.03] to-transparent"
                style={{ borderColor: "rgba(232,160,82,0.22)", padding: "12px 14px" }}
              >
                {/* Decorative corner glow */}
                <div
                  aria-hidden="true"
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(232,160,82,0.24) 0%, transparent 70%)" }}
                />
                {/* Decorative arc bottom-right */}
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-4 -right-2 opacity-30 pointer-events-none"
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  fill="none"
                >
                  <path d="M 40 0 A 40 40 0 0 1 80 40" stroke="rgba(232,160,82,0.5)" strokeWidth="0.5" fill="none" />
                  <path d="M 50 0 A 50 50 0 0 1 80 30" stroke="rgba(232,160,82,0.3)" strokeWidth="0.5" fill="none" />
                  <path d="M 60 0 A 60 60 0 0 1 80 20" stroke="rgba(232,160,82,0.2)" strokeWidth="0.5" fill="none" />
                </svg>

                <div className="relative flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase tracking-[0.22em] text-[#E9A052] font-bold">
                    {FEATURED_REGION.name}
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.18em] text-[#E9A052]/70 font-semibold inline-flex items-center gap-1">
                    <span className="text-[#E9A052]">★</span>
                    {FEATURED_REGION.tier}
                  </span>
                </div>

                {/* Big number + label */}
                <div className="relative flex items-baseline gap-2 mb-1.5">
                  <span className="font-display text-[28px] font-bold text-[#F5F0E8] leading-none tracking-tight">
                    {FEATURED_REGION.count}
                  </span>
                  <span className="text-[10px] text-[#F5F0E8]/55 uppercase tracking-[0.16em] font-semibold">
                    cities
                  </span>
                </div>

                {/* Cities */}
                <p className="relative text-[10.5px] text-[#F5F0E8]/65 leading-snug">
                  {FEATURED_REGION.cities}
                  <span className="text-[#F5F0E8]/35 ml-1">{FEATURED_REGION.more}</span>
                </p>
              </motion.div>

              {/* ── 4 small region cards: 2×2 grid (each with unique accent) ── */}
              <motion.div
                variants={tightStagger}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}
              >
                {REGION_CARDS.map((r) => {
                  const accent = ACCENT_STYLES[r.accent] ?? ACCENT_STYLES["warm-amber"]!;
                  return (
                    <motion.div
                      key={r.key}
                      variants={cardEntry}
                      whileHover={{ y: -2, scale: 1.015 }}
                      transition={{ duration: 0.2 }}
                      className="group relative overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.012] hover:border-[#8B5E3C]/35 transition-colors cursor-default"
                      style={{ padding: "9px 10px", background: accent.bg }}
                    >
                      {/* Unique corner accent per region */}
                      <div
                        aria-hidden="true"
                        className="absolute -top-6 -right-6 w-16 h-16 rounded-full pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-70"
                        style={{ background: `radial-gradient(circle, ${accent.corner} 0%, transparent 70%)` }}
                      />

                      <div className="relative flex items-baseline justify-between mb-1">
                        <span className="text-[8.5px] uppercase tracking-[0.18em] text-[#E9A052] font-semibold">
                          {r.name}
                        </span>
                        <span className="font-display text-[12.5px] text-[#F5F0E8]/90 font-medium leading-none">
                          {r.count}
                        </span>
                      </div>
                      <p className="relative text-[9.5px] text-[#F5F0E8]/45 leading-tight truncate">
                        {r.sample}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Live activity feed card */}
              <motion.div
                variants={cardEntry}
                className="rounded-lg border border-[#8B5E3C]/30 bg-gradient-to-br from-[#8B5E3C]/[0.07] to-[#8B5E3C]/[0.02] relative overflow-hidden"
                style={{ padding: "10px 12px" }}
              >
                <div aria-hidden="true" className="absolute inset-0 supply-shimmer pointer-events-none" />

                <div className="relative flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-[#E9A052]" strokeWidth={1.8} />
                    <span className="text-[9px] uppercase tracking-[0.22em] text-[#E9A052] font-semibold">
                      Live activity
                    </span>
                  </div>
                  <span className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#E9A052] opacity-65 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E9A052]" />
                  </span>
                </div>

                {/* Rotating feed */}
                <div className="relative" style={{ height: "56px" }}>
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={tick}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="absolute inset-0"
                      style={{ display: "flex", flexDirection: "column", gap: "3px" }}
                    >
                      {visible.map((e, i) => (
                        <div
                          key={`${tick}-${i}`}
                          className="flex items-baseline justify-between gap-2"
                          style={{ opacity: 1 - i * 0.22 }}
                        >
                          <span className="font-display text-[11px] text-[#F5F0E8]/90 font-medium leading-tight">
                            {e.city}
                          </span>
                          <span className="font-mono text-[9px] text-[#E9A052]/85 tracking-tight leading-tight">
                            {e.event}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Stats inline (inline grid styles to bypass JIT issues) */}
              <motion.div
                variants={cardEntry}
                className="rounded-lg border border-white/[0.07] bg-white/[0.012]"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  padding: "10px 4px",
                }}
              >
                {STATS.map((s, idx) => (
                  <div
                    key={s.label}
                    className="text-center"
                    style={{
                      padding: "0 6px",
                      borderRight: idx < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    }}
                  >
                    <p className="font-display text-[15px] font-bold text-[#8B5E3C] leading-none mb-0.5">
                      {s.value}
                    </p>
                    <p className="text-[8px] uppercase tracking-[0.14em] text-[#F5F0E8]/40 font-semibold">
                      {s.label}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div variants={fadeUp} className="mt-0.5">
                <a
                  href="#rfq"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#E9A052] hover:text-[#F5D491] transition-colors group"
                >
                  Trace your delivery route
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.8} />
                </a>
              </motion.div>
            </motion.div>

            {/* ─── RIGHT: Globe ─── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="relative flex justify-center items-center"
            >
              <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.012] overflow-hidden">
                {/* Radar sweep behind globe */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                >
                  <div
                    className="rounded-full opacity-45 supply-radar"
                    style={{
                      width: globeSize * 1.18,
                      height: globeSize * 1.18,
                      background:
                        "conic-gradient(from 0deg, transparent 0deg, rgba(232,160,82,0.14) 35deg, transparent 90deg, transparent 360deg)",
                    }}
                  />
                </div>

                {/* Top overlays */}
                <div
                  aria-hidden="true"
                  className="absolute top-3 left-3 right-3 z-10 hidden md:flex items-start justify-between text-[9.5px] uppercase tracking-[0.22em] font-semibold pointer-events-none"
                >
                  <div className="flex items-center gap-2 text-[#F5F0E8]/40">
                    <span className="w-4 h-px bg-[#8B5E3C]/60" />
                    Origin
                    <span className="text-[#E9A052] font-mono normal-case tracking-tight text-[10px]">
                      Seoul · 37.57&deg;N
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#F5F0E8]/40">
                    <span className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-[#E9A052] opacity-70 animate-ping" />
                      <span className="relative inline-flex h-1 w-1 rounded-full bg-[#E9A052]" />
                    </span>
                    Live
                  </div>
                </div>

                {/* Bottom ticks */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-3 left-3 right-3 z-10 hidden md:flex items-end justify-between font-mono text-[9px] tracking-[0.08em] text-[#F5F0E8]/22 pointer-events-none"
                >
                  <span>LAT —40 ... +80</span>
                  <span>24 NODES</span>
                  <span>LNG —180 ... +180</span>
                </div>

                {/* Corner marks */}
                <div aria-hidden="true" className="absolute top-2 left-2 w-2.5 h-2.5 border-l border-t border-[#8B5E3C]/40 pointer-events-none" />
                <div aria-hidden="true" className="absolute top-2 right-2 w-2.5 h-2.5 border-r border-t border-[#8B5E3C]/40 pointer-events-none" />
                <div aria-hidden="true" className="absolute bottom-2 left-2 w-2.5 h-2.5 border-l border-b border-[#8B5E3C]/40 pointer-events-none" />
                <div aria-hidden="true" className="absolute bottom-2 right-2 w-2.5 h-2.5 border-r border-b border-[#8B5E3C]/40 pointer-events-none" />

                {/* Globe — faster rotation 0.08 (was 0.035) */}
                <div className="relative flex items-center justify-center" style={{ padding: "20px" }}>
                  {GlobeCanvas ? (
                    <GlobeCanvas
                      size={globeSize}
                      initialRotation={-127}
                      rotationSpeed={0.08}
                      arcInterval={600}
                      enableMouseTilt
                      onCityHover={setHover}
                    >
                      {hover && <CityHoverCard payload={hover} />}
                    </GlobeCanvas>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="rounded-full opacity-20"
                      style={{
                        width: globeSize,
                        height: globeSize,
                        background: "radial-gradient(circle, rgba(232,160,82,0.18) 0%, transparent 65%)",
                      }}
                    />
                  )}
                </div>
              </div>
            </motion.div>

        </div>
      </div>

      <style jsx>{`
        .supply-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: 1fr;
          align-items: center;
        }
        @media (min-width: 768px) {
          .supply-grid {
            grid-template-columns: minmax(0, 0.85fr) minmax(0, 1fr);
            gap: 28px;
          }
        }
        @keyframes supply-particle-drift {
          0%   { transform: translate(0, 0)        scale(0.8); opacity: 0; }
          15%  { opacity: 0.85; }
          50%  { transform: translate(40px, -30px) scale(1.1); opacity: 1; }
          85%  { opacity: 0.55; }
          100% { transform: translate(80px, -60px) scale(0.7); opacity: 0; }
        }
        .supply-particle {
          animation: supply-particle-drift linear infinite;
          will-change: transform, opacity;
          box-shadow: 0 0 8px rgba(232, 160, 82, 0.5);
        }
        @keyframes supply-radar-sweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .supply-radar {
          animation: supply-radar-sweep 14s linear infinite;
          will-change: transform;
        }
        @keyframes supply-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .supply-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(232, 160, 82, 0.06) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: supply-shimmer 5s linear infinite;
        }
      `}</style>
    </section>
  );
}
