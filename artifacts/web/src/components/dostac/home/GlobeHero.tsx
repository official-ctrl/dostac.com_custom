"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  Factory,
  FileCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { trackCtaClick } from "@/lib/analytics";
import {
  fadeUp,
  sectionHeaderStagger,
  stagger,
  wordReveal,
  wordStagger,
} from "./kinetic-tokens";
import { GlobeCanvas, type HoverPayload } from "./GlobeCanvas";
import { CityHoverCard } from "./CityDossier";

/* ─────────────────────────────────────────────
   GlobeHero
   - Concept:        Trusted K-Beauty Network
   - Tech story:     Powered by Sourcing Intelligence
   - Layout:         Left brand 45% / Right globe 55%
   - Globe origin:   Korea-centered (initialRotation = -127)
   - Hover popup:    City trait + capacity + recent activity
───────────────────────────────────────────── */

const HEADLINE_L1 = ["The", "Trusted", "Network", "Behind"];
const HEADLINE_L2 = ["Global", "K-Beauty."];

const TECH_STORY = [
  {
    icon: Activity,
    title: "Sourcing intelligence",
    desc:  "Live factory capacity, MOQ, and trend signals.",
  },
  {
    icon: ShieldCheck,
    title: "Verified suppliers",
    desc:  "KGMP, ISO 22716, FDA — audited only.",
  },
  {
    icon: Factory,
    title: "Direct manufacturing",
    desc:  "No middlemen. Factory-direct routes.",
  },
  {
    icon: FileCheck,
    title: "End-to-end documents",
    desc:  "Export, customs, COA, traceability.",
  },
];

const CERTS = [
  { mark: "GMP",       label: "Good Manufacturing" },
  { mark: "FDA",       label: "US Compliant" },
  { mark: "ISO 9001",  label: "Quality System" },
  { mark: "ISO 22716", label: "Cosmetics GMP" },
];

const METRICS = [
  { num: "47",  label: "Export markets" },
  { num: "24",  label: "City network" },
  { num: "14d", label: "Avg. sample" },
  { num: "B2B", label: "Focused" },
];

/* CITY_META + CityHoverCard now live in ./CityDossier (shared between GlobeHero and SupplyChainSection) */

/* Responsive globe size — globe is the primary visual (≈60% width on desktop) */
function useGlobeSize() {
  const [size, setSize] = useState(600);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 400) return 320;
      if (w < 640) return 400;
      if (w < 1024) return 480;
      if (w < 1280) return 560;
      if (w < 1536) return 600;
      return 660;
    };
    const update = () => setSize(compute());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

/* ─── Word-stagger headline (matches MarqueeHero pattern) ─── */
function AnimatedHeadline() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <h1
        className="font-display font-bold text-[#F5F0E8] leading-[1.05] tracking-tight mb-6"
        style={{ fontSize: "clamp(2.1rem, 4.5vw, 4.25rem)" }}
      >
        The Trusted Network Behind
        <br />
        <span className="italic text-[#F5F0E8]/65">Global K-Beauty.</span>
      </h1>
    );
  }

  return (
    <motion.h1
      initial="hidden"
      animate="show"
      variants={wordStagger}
      className="font-display font-bold text-[#F5F0E8] leading-[1.05] tracking-tight mb-6"
      style={{ fontSize: "clamp(2.1rem, 4.5vw, 4.25rem)" }}
    >
      <span className="block">
        {HEADLINE_L1.map((word, i) => (
          <motion.span
            key={i}
            variants={wordReveal}
            style={{ display: "inline-block", marginRight: "0.22em" }}
          >
            {word}
          </motion.span>
        ))}
      </span>
      <span className="block italic text-[#F5F0E8]/65">
        {HEADLINE_L2.map((word, i) => (
          <motion.span
            key={i}
            variants={wordReveal}
            style={{ display: "inline-block", marginRight: "0.22em" }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    </motion.h1>
  );
}

/* CityHoverCard imported from ./CityDossier above */

/* ─── GlobeHero — main hero with Korea-centered globe ─── */
export function GlobeHero() {
  const globeSize = useGlobeSize();
  const [hover, setHover] = useState<HoverPayload | null>(null);

  return (
    <section
      className="relative w-full min-h-[100svh] overflow-hidden flex flex-col pt-20"
      style={{ backgroundColor: "#0D1117" }}
    >
      {/* ── Intelligence grid background ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,240,232,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,232,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, #000 35%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, #000 35%, transparent 95%)",
        }}
      />

      {/* TERRA radial wash (warmer on globe side) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 72% 50%, rgba(139,94,60,0.20) 0%, transparent 65%)",
        }}
      />

      {/* Drifting data particles */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: "8%",  top: "22%", delay: "0s",   dur: "11s" },
          { left: "22%", top: "72%", delay: "2.4s", dur: "13s" },
          { left: "38%", top: "30%", delay: "5.1s", dur: "10s" },
          { left: "55%", top: "82%", delay: "1.2s", dur: "14s" },
          { left: "72%", top: "18%", delay: "3.8s", dur: "12s" },
          { left: "88%", top: "62%", delay: "6.5s", dur: "11s" },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#E9A052]/55 hero-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>

      {/* Corner marks (desktop) */}
      <div aria-hidden="true" className="hidden sm:block absolute top-24 left-6 w-5 h-5 border-l border-t border-[#8B5E3C]/40 pointer-events-none" />
      <div aria-hidden="true" className="hidden sm:block absolute top-24 right-6 w-5 h-5 border-r border-t border-[#8B5E3C]/40 pointer-events-none" />
      <div aria-hidden="true" className="hidden sm:block absolute bottom-6 left-6 w-5 h-5 border-l border-b border-[#8B5E3C]/40 pointer-events-none" />
      <div aria-hidden="true" className="hidden sm:block absolute bottom-6 right-6 w-5 h-5 border-r border-b border-[#8B5E3C]/40 pointer-events-none" />

      {/* ── Main 2-col grid: 40% content / 60% globe ── */}
      <div className="relative z-10 container mx-auto px-5 sm:px-6 flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.1fr)] gap-8 lg:gap-8 items-center py-6 sm:py-10">

        {/* ─── LEFT: brand + tech story ─── */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={sectionHeaderStagger}
          className="flex flex-col order-2 lg:order-1"
        >
          {/* Concept pill */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 self-start mb-6 px-3 py-1.5 rounded-full border border-[#8B5E3C]/30 bg-[#8B5E3C]/[0.06]"
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#E9A052] opacity-70 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E9A052]" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#E9A052] font-semibold">
              Trusted K-Beauty Network · Live
            </span>
          </motion.div>

          {/* Main brand headline */}
          <AnimatedHeadline />

          {/* Sub message (tech story) */}
          <motion.p
            variants={fadeUp}
            className="text-[#F5F0E8]/55 leading-relaxed mb-8 max-w-xl"
            style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.075rem)" }}
          >
            Powered by <span className="text-[#E9A052] font-medium">sourcing intelligence</span>,
            verified manufacturers, and real-time global market insights.
          </motion.p>

          {/* 4 tech capability cards */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8"
          >
            {TECH_STORY.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  variants={fadeUp}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:border-[#8B5E3C]/30 hover:bg-[#8B5E3C]/[0.04] transition-colors"
                >
                  <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-[#8B5E3C]/12 border border-[#8B5E3C]/25 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#E9A052]" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[13.5px] text-[#F5F0E8] font-medium mb-0.5 leading-tight">
                      {s.title}
                    </p>
                    <p className="text-[11px] text-[#F5F0E8]/45 leading-snug">
                      {s.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-3"
          >
            <a
              href="#rfq"
              onClick={() => trackCtaClick("Start your project", "hero_globe")}
            >
              <Button
                size="lg"
                className="rounded-full bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white h-12 px-7 font-semibold shadow-[0_0_28px_rgba(139,94,60,0.4)]"
              >
                Start your project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/production">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/15 text-white/75 bg-transparent hover:bg-white/5 h-12 px-6 font-medium"
              >
                How sourcing works
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* ─── RIGHT: Globe (main visual) ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-center items-center order-1 lg:order-2 w-full"
        >
          {/* Radar sweep behind globe */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <div
              className="rounded-full opacity-50 hero-radar"
              style={{
                width: globeSize * 1.18,
                height: globeSize * 1.18,
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(232,160,82,0.12) 40deg, transparent 95deg, transparent 360deg)",
              }}
            />
          </div>

          {/* Top overlays */}
          <div
            aria-hidden="true"
            className="absolute top-1 left-2 right-2 z-10 hidden md:flex items-start justify-between text-[10px] uppercase tracking-[0.22em] font-semibold pointer-events-none"
          >
            <div className="flex items-center gap-2.5 text-[#F5F0E8]/40">
              <span className="w-4 h-px bg-[#8B5E3C]/60" />
              Origin
              <span className="text-[#E9A052] font-mono normal-case tracking-tight text-[10.5px]">
                Seoul · 37.57&deg;N 126.98&deg;E
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#F5F0E8]/40">
              <span className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-[#E9A052] opacity-70 animate-ping" />
                <span className="relative inline-flex h-1 w-1 rounded-full bg-[#E9A052]" />
              </span>
              Live routes
            </div>
          </div>

          {/* Bottom overlays */}
          <div
            aria-hidden="true"
            className="absolute bottom-1 left-2 right-2 z-10 hidden md:flex items-end justify-between font-mono text-[9.5px] tracking-[0.1em] text-[#F5F0E8]/22 pointer-events-none"
          >
            <span>LAT —40 ... +80</span>
            <span>24 NODES · 1 ORIGIN</span>
            <span>LNG —180 ... +180</span>
          </div>

          {/* The globe with hover popup as children */}
          <GlobeCanvas
            size={globeSize}
            initialRotation={-127}
            rotationSpeed={0.035}
            enableMouseTilt
            onCityHover={setHover}
          >
            {hover && <CityHoverCard payload={hover} />}
          </GlobeCanvas>
        </motion.div>
      </div>

      {/* ── Bottom strip: certs + metrics ── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="relative z-10 container mx-auto px-5 sm:px-6 pb-6 sm:pb-10"
      >
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 sm:gap-y-0 border-y border-[#8B5E3C]/15 py-3.5 sm:py-4 mb-4 sm:mb-5"
        >
          {CERTS.map((cert, idx) => (
            <div
              key={cert.mark}
              className={`text-center px-3 ${idx < CERTS.length - 1 ? "sm:border-r border-[#8B5E3C]/12" : ""}`}
            >
              <div className="font-display text-[14px] sm:text-[15px] text-[#8B5E3C] tracking-[0.06em] mb-1">
                {cert.mark}
              </div>
              <div className="text-[9px] sm:text-[9.5px] text-[#F5F0E8]/40 uppercase tracking-[0.16em]">
                {cert.label}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-4">
          {METRICS.map((m, idx) => (
            <div
              key={m.label}
              className={`text-center px-2 ${idx < METRICS.length - 1 ? "border-r border-[#8B5E3C]/10" : ""}`}
            >
              <div className="font-display text-xl sm:text-2xl text-[#F5F0E8] font-medium leading-none mb-1.5 tracking-tight">
                {m.num}
              </div>
              <div className="text-[9px] sm:text-[10px] text-[#F5F0E8]/45 uppercase tracking-[0.14em]">
                {m.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes hero-particle-drift {
          0%   { transform: translate(0, 0)       scale(0.8); opacity: 0; }
          15%  { opacity: 0.85; }
          50%  { transform: translate(40px, -30px) scale(1.1); opacity: 1; }
          85%  { opacity: 0.55; }
          100% { transform: translate(80px, -60px) scale(0.7); opacity: 0; }
        }
        .hero-particle {
          animation: hero-particle-drift linear infinite;
          will-change: transform, opacity;
          box-shadow: 0 0 8px rgba(232, 160, 82, 0.5);
        }
        @keyframes hero-radar-sweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .hero-radar {
          animation: hero-radar-sweep 16s linear infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
