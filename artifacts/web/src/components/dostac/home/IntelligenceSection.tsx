"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

/* ════════════════════════════════════════════
   Feature Card: Sourcing Intelligence
   — 실제 필터 UI처럼 보이는 미니 대시보드
════════════════════════════════════════════ */
function SourceFilterUI() {
  return (
    <div className="bg-[#F5F0E8] rounded-xl border border-[#2D2D2D]/[0.06] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-3 w-3 text-[#8B5E3C]" />
        <span className="text-[10px] font-bold text-[#2D2D2D]/50 uppercase tracking-[0.15em]">
          Find Manufacturer
        </span>
      </div>

      {/* Filter rows */}
      <div className="flex flex-col gap-2 mb-3">
        {[
          { label: "Category",     value: "Skincare · Serum" },
          { label: "MOQ",          value: "500 units +"      },
          { label: "Certification",value: "KGMP Required"    },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#2D2D2D]/[0.06]"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#2D2D2D]/35">
              {label}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-[#2D2D2D]/75">{value}</span>
              <ChevronDown className="h-2.5 w-2.5 text-[#2D2D2D]/30" />
            </div>
          </div>
        ))}
      </div>

      {/* Result indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-[#2D2D2D]/[0.06]">
        <span className="text-[9px] text-[#2D2D2D]/35">Matching manufacturers</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] animate-pulse" />
          <span className="text-[11px] font-bold text-[#8B5E3C]">24 found</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Small Card: K-Beauty Trends (DEEP bg)
════════════════════════════════════════════ */
function TrendsMiniCard() {
  const bars = [
    { label: "Serum",    pct: 88, hot: true  },
    { label: "Sun Care", pct: 76, hot: true  },
    { label: "Toner",    pct: 58, hot: false },
  ];

  return (
    <div
      className="rounded-2xl p-5 flex flex-col h-full"
      style={{ backgroundColor: "#0D1117" }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <TrendingUp className="h-3.5 w-3.5 text-[#8B5E3C]" />
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
          K-Beauty Trends
        </p>
      </div>
      <p className="text-[12px] font-bold text-white/90 leading-snug mb-4">
        Know what&apos;s growing
        <br />before it peaks.
      </p>
      <div className="flex flex-col gap-2.5 mt-auto">
        {bars.map(({ label, pct, hot }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-white/55">{label}</span>
              {hot && (
                <span className="text-[7px] font-bold bg-[#8B5E3C] text-white px-1.5 py-0.5 rounded-full uppercase tracking-[0.08em]">
                  Hot
                </span>
              )}
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#8B5E3C]"
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Small Card: Verified Network (DEEP bg)
════════════════════════════════════════════ */
function VerifiedMiniCard() {
  const certs = [
    { name: "KGMP",         sub: "Ministry of MFDS, KR" },
    { name: "ISO 22716",    sub: "Good Mfg. Practice"   },
    { name: "Cruelty-Free", sub: "No Animal Testing"    },
  ];

  return (
    <div
      className="rounded-2xl p-5 flex flex-col h-full"
      style={{ backgroundColor: "#0D1117" }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <CheckCircle2 className="h-3.5 w-3.5 text-[#8B5E3C]" />
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
          Verified Network
        </p>
      </div>
      <p className="text-[12px] font-bold text-white/90 leading-snug mb-4">
        Every supplier,
        <br />certified and checked.
      </p>
      <div className="flex flex-col gap-2.5 mt-auto">
        {certs.map(({ name, sub }) => (
          <div key={name} className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#8B5E3C] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-white/80 leading-none">{name}</p>
              <p className="text-[8px] text-white/35 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Copy + Bento shared content
════════════════════════════════════════════ */
function CopyBlock() {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={stagger}
    >
      <motion.p variants={fadeUp} className="text-[#8B5E3C] text-[11px] font-bold tracking-[0.3em] uppercase mb-5">
        The Platform
      </motion.p>
      <motion.h2 variants={fadeUp} className="font-display font-bold text-[#2D2D2D] leading-[1.07] mb-5" style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)" }}>
        Intelligence
        <br />for every
        <br />sourcing
        <br />decision.
      </motion.h2>
      <motion.p variants={fadeUp} className="text-[#2D2D2D]/55 leading-relaxed" style={{ fontSize: "15px" }}>
        Dostac connects global brands with Korea&apos;s best
        manufacturers — backed by verified data, not just promises.
      </motion.p>
    </motion.div>
  );
}

function BentoBlock() {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger}
      className="flex flex-col gap-4"
    >
      {/* Feature card */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-2xl border border-[#2D2D2D]/[0.07] p-6"
        style={{ boxShadow: "0 4px 24px rgba(45,45,45,0.07)" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
            <Search className="h-3.5 w-3.5 text-[#8B5E3C]" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C]">Sourcing Intelligence</p>
            <p className="text-[13px] font-bold text-[#2D2D2D]">Find the right factory, first time.</p>
          </div>
        </div>
        <SourceFilterUI />
      </motion.div>

      {/* 2 small dark cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <motion.div variants={fadeUp}><TrendsMiniCard /></motion.div>
        <motion.div variants={fadeUp}><VerifiedMiniCard /></motion.div>
      </div>
    </motion.div>
  );
}

function IntelligenceLayout() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const check = () => setWide(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (wide) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: "4rem", alignItems: "center" }}>
        <CopyBlock />
        <BentoBlock />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <CopyBlock />
      <BentoBlock />
    </div>
  );
}

/* ════════════════════════════════════════════
   IntelligenceSection (exported)
════════════════════════════════════════════ */
export function IntelligenceSection() {
  return (
    <section style={{ backgroundColor: "#F5F0E8" }}>

      {/* ── Section divider: clean 32px gradient, no fog ── */}
      <div
        aria-hidden="true"
        style={{
          height: 32,
          background: "linear-gradient(to bottom, #0D1117 0%, #F5F0E8 100%)",
        }}
      />

      {/* ── Main content ── */}
      <div className="container mx-auto px-6 max-w-6xl pt-16 pb-24">
        <IntelligenceLayout />
      </div>
    </section>
  );
}
