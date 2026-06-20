"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clock, Zap, FlaskConical } from "lucide-react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const CARD_W = 164;

/* ═══════════════════════════════════════════════
   LEFT RAIL — Process Cards (소싱 프로세스 단면)
═══════════════════════════════════════════════ */
function RFQCard() {
  return (
    <div
      className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.10] rounded-2xl p-4"
      style={{ width: CARD_W }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
          New RFQ
        </span>
      </div>
      <p className="text-[12px] font-bold text-white/90 leading-tight mb-1">Serum · 5,000u</p>
      <p className="text-[10px] text-white/50 mb-3">🇩🇪 Germany</p>
      <div className="text-[9px] text-[#8B5E3C] font-semibold flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C] inline-block animate-pulse" />
        Reviewing...
      </div>
    </div>
  );
}

function SampleCard() {
  return (
    <div
      className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.10] rounded-2xl p-4"
      style={{ width: CARD_W }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">
        Sample #2847
      </p>
      <div className="w-full h-1 bg-white/10 rounded-full mb-2.5 overflow-hidden">
        <div className="h-full rounded-full bg-[#8B5E3C]" style={{ width: "80%" }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-white/80">80%</span>
        <span className="text-[9px] text-white/40 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" /> 3 days left
        </span>
      </div>
    </div>
  );
}

function KGMPCard() {
  return (
    <div
      className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.10] rounded-2xl p-4"
      style={{ width: CARD_W }}
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-[#8B5E3C]" />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8B5E3C]">
          KGMP
        </span>
      </div>
      <p className="text-[10px] text-white/60 leading-snug mb-2.5">
        Ministry of Food
        <br />
        &amp; Drug Safety, KR
      </p>
      <span className="inline-block text-[8px] bg-[#8B5E3C]/20 text-[#8B5E3C] px-2 py-0.5 rounded-full font-bold uppercase tracking-[0.1em]">
        Active
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RIGHT RAIL — Product Cards (제품/포뮬러 단면)
═══════════════════════════════════════════════ */
function FormulaCard() {
  const ingredients = [
    { name: "Niacinamide", pct: "10%" },
    { name: "Hyaluronic Acid", pct: "2%" },
    { name: "Centella", pct: "0.5%" },
  ];
  return (
    <div
      className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.10] rounded-2xl p-4"
      style={{ width: CARD_W }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <FlaskConical className="h-3 w-3 text-[#3B82F6]" />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
          Formula 01
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {ingredients.map(({ name, pct }) => (
          <div key={name} className="flex items-center justify-between">
            <span className="text-[9px] text-white/55">{name}</span>
            <span className="text-[9px] font-bold text-[#3B82F6]">{pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MOQCard() {
  const rows = [
    { cat: "Skincare", qty: "500u" },
    { cat: "Hair Care", qty: "1,000u" },
    { cat: "Mask Sheet", qty: "3,000u" },
  ];
  return (
    <div
      className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.10] rounded-2xl p-4"
      style={{ width: CARD_W }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">MOQ</p>
      <div className="flex flex-col gap-2">
        {rows.map(({ cat, qty }) => (
          <div key={cat} className="flex items-center justify-between">
            <span className="text-[9px] text-white/50">{cat}</span>
            <span className="text-[9px] font-bold text-white/80">{qty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIMatchCard() {
  const tags = ["Vegan", "EWG Green", "Cruelty-Free"];
  return (
    <div
      className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.10] rounded-2xl p-4"
      style={{ width: CARD_W }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <Zap className="h-3 w-3 text-[#3B82F6]" />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
          AI Matched
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {tags.map((tag) => (
          <div key={tag} className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-[#8B5E3C]" />
            <span className="text-[9px] text-white/70">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Card wrapper — slide-in + float + tilt
═══════════════════════════════════════════════ */
interface WrapperProps {
  CardComponent: () => React.JSX.Element;
  floatDur: number;
  floatDelay: number;
  rotate: number;
  enterDelay: number;
  direction: "left" | "right";
}

function CardWrapper({
  CardComponent,
  floatDur,
  floatDelay,
  rotate,
  enterDelay,
  direction,
}: WrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? -56 : 56 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.85, delay: enterDelay, ease: EASE_OUT_EXPO }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: floatDur,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        }}
        whileHover={{ scale: 1.03, rotate: 0, transition: { duration: 0.18 } }}
        style={{ rotate: `${rotate}deg` }}
        className="cursor-default select-none"
      >
        <CardComponent />
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Rail data
═══════════════════════════════════════════════ */
const LEFT_CARDS = [
  { component: RFQCard,    floatDur: 3.2, floatDelay: 0,   rotate: -1.5 },
  { component: SampleCard, floatDur: 2.9, floatDelay: 0.6, rotate:  1.0 },
  { component: KGMPCard,   floatDur: 3.5, floatDelay: 1.1, rotate: -1.0 },
];

const RIGHT_CARDS = [
  { component: FormulaCard,  floatDur: 3.0, floatDelay: 0.4, rotate:  1.5 },
  { component: MOQCard,      floatDur: 3.3, floatDelay: 0.8, rotate: -1.0 },
  { component: AIMatchCard,  floatDur: 2.8, floatDelay: 0.2, rotate:  1.0 },
];

/* ═══════════════════════════════════════════════
   Rail container — centres cards in the gutter
   between viewport edge and max-w-4xl (896 px)
═══════════════════════════════════════════════ */
function Rail({
  cards,
  direction,
  viewportWidth,
}: {
  cards: typeof LEFT_CARDS;
  direction: "left" | "right";
  viewportWidth: number;
}) {
  const CENTER_HALF = 448;
  const gutter = viewportWidth / 2 - CENTER_HALF;
  const offset = Math.max(16, (gutter - CARD_W) / 2);
  const posStyle = direction === "left" ? { left: offset } : { right: offset };

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 bottom-0 flex flex-col justify-center z-[5]"
      style={{ ...posStyle, gap: 12, pointerEvents: "none" }}
    >
      {cards.map(({ component, floatDur, floatDelay, rotate }, i) => (
        <div key={i} style={{ pointerEvents: "auto" }}>
          <CardWrapper
            CardComponent={component}
            floatDur={floatDur}
            floatDelay={floatDelay}
            rotate={rotate}
            enterDelay={direction === "left" ? 0.4 + i * 0.1 : 0.5 + i * 0.1}
            direction={direction}
          />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HeroSideRails (exported)
   SSR-safe: hidden until hydration + viewport ≥ 1280
═══════════════════════════════════════════════ */
export function HeroSideRails() {
  const prefersReduced = useReducedMotion();
  const [vw, setVw] = useState(0);

  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (prefersReduced || vw < 1280) return null;

  return (
    <>
      <Rail cards={LEFT_CARDS}  direction="left"  viewportWidth={vw} />
      <Rail cards={RIGHT_CARDS} direction="right" viewportWidth={vw} />
    </>
  );
}
