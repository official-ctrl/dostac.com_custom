"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { trackCtaClick } from "@/lib/analytics";
import { wordReveal, wordStagger } from "./kinetic-tokens";
import { HeroSideRails } from "./HeroSideRails";

const LINE1 = "DOSTAC · OEM · ODM · PRIVATE LABEL · K-BEAUTY · ";
const LINE2 = "YOUR BRAND · OUR FORMULA · BORN IN KOREA · MADE FOR THE WORLD · ";

/* Split headline into per-word tokens for stagger animation */
const HEADLINE_L1 = ["Your", "Beauty", "Brand,"];
const HEADLINE_L2 = ["Born", "in", "Korea"];

/* ─────────────────────────────────────────────
   AnimatedHeadline
   Word-by-word stagger reveal on mount.
   Falls back to static text when prefers-reduced-motion is set.
───────────────────────────────────────────── */
function AnimatedHeadline() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <h1
        className="font-display font-bold text-[#F5F0E8] leading-[1.05] mb-6"
        style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
      >
        Your Beauty Brand,
        <br />
        <span className="italic">Born in Korea</span>
      </h1>
    );
  }

  return (
    <motion.h1
      initial="hidden"
      animate="show"
      variants={wordStagger}
      className="font-display font-bold text-[#F5F0E8] leading-[1.05] mb-6"
      style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
    >
      {/* Line 1 */}
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

      {/* Line 2: italic */}
      <span className="block italic">
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

/* ─────────────────────────────────────────────
   MarqueeHero — full-viewport hero with
   CSS-keyframe marquee background + kinetic headline
───────────────────────────────────────────── */
export function MarqueeHero() {
  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden flex flex-col items-center justify-center pt-20" style={{ backgroundColor: "#0D1117" }}>

      {/* ── TERRA radial glow (Stripe-style ambient) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 60%, rgba(139,94,60,0.13) 0%, transparent 70%)",
        }}
      />

      {/* ── Dot grid pattern ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #F5F0E8 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Marquee background layer ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col justify-center gap-10 pointer-events-none select-none"
      >
        {/* Line 1: large, slow, left → */}
        <div className="overflow-hidden">
          <div
            className="dostac-marquee-inner flex whitespace-nowrap font-display font-bold text-[#F5F0E8]/[0.13] leading-none"
            style={{
              fontSize: "clamp(4rem, 10vw, 9rem)",
              letterSpacing: "-0.02em",
              animation: "dostac-marquee-left 35s linear infinite",
              willChange: "transform",
            }}
          >
            <span>{LINE1}</span>
            <span>{LINE1}</span>
          </div>
        </div>

        {/* Line 2: small, fast, ← right */}
        <div className="overflow-hidden">
          <div
            className="dostac-marquee-inner flex whitespace-nowrap font-sans font-semibold uppercase text-[#8B5E3C]/40"
            style={{
              fontSize: "clamp(0.75rem, 1.8vw, 1.05rem)",
              letterSpacing: "0.3em",
              animation: "dostac-marquee-right 20s linear infinite",
              willChange: "transform",
            }}
          >
            <span>{LINE2}</span>
            <span>{LINE2}</span>
          </div>
        </div>
      </div>

      {/* ── Center content ── */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center max-w-4xl py-16">
        <p className="uppercase tracking-[0.35em] text-[11px] font-bold text-[#8B5E3C] mb-8">
          K-Beauty Intelligence Platform
        </p>

        <AnimatedHeadline />

        <p
          className="text-[#F5F0E8]/55 leading-relaxed mb-10 max-w-lg"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
        >
          From formulation to global delivery — Dostac makes world-class K-beauty accessible for brands everywhere.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="#rfq" onClick={() => trackCtaClick("Get OEM Quote", "hero_marquee")}>
            <Button
              size="lg"
              className="rounded-full bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white h-13 px-8 font-semibold shadow-[0_0_32px_rgba(139,94,60,0.35)]"
            >
              Get OEM Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/20 text-white/80 bg-transparent hover:bg-white/5 h-13 px-8 font-semibold"
            >
              Browse Products
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Side rails — Product UI cards ── */}
      <HeroSideRails />

      {/* ── Scroll indicator ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 text-[#F5F0E8]/25 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.35em] font-semibold">Scroll</span>
        <div className="w-px h-8 bg-[#F5F0E8]/15" />
      </div>
    </section>
  );
}
