"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from "framer-motion";
import { useT } from "@/components/dostac/i18n";

/* ─────────────────────────────────────────────
   HorizontalTimeline
   Replaces the old overflow-x-auto ProductionFlowSection.

   Desktop: 5×100vh vertical scroll container that drives a
            horizontal translateX, revealing one step per screen width.
   Mobile / reduced-motion: simple vertical card list.
───────────────────────────────────────────── */
export function HorizontalTimeline() {
  /* ── All hooks at top level ── */
  const { t }          = useT();
  const containerRef   = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  const flowSteps = t("homeNew.flowSteps") as Array<{
    step: string;
    title: string;
    desc: string;
  }>;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* Translate the strip from 0% → -(n-1)/n * 100% of its own width */
  const pct = flowSteps.length > 0
    ? -((flowSteps.length - 1) / flowSteps.length) * 100
    : 0;
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `${pct}%`]);

  /* Track active step for the progress dots */
  useMotionValueEvent(scrollYProgress, "change", (val) => {
    const next = Math.min(
      flowSteps.length - 1,
      Math.floor(val * flowSteps.length),
    );
    setActiveStep(next);
  });

  /* ── Static / mobile layout ── */
  const StaticLayout = (
    <section className="py-20 md:py-24 bg-[#F5F0E8]">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="uppercase tracking-[0.25em] text-xs font-bold text-[#8B5E3C] mb-3">
            {t("homeNew.flowEyebrow") as string}
          </p>
          <h2 className="font-display font-bold text-[#2D2D2D] text-3xl md:text-4xl leading-tight">
            {t("homeNew.flowHeading") as string}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {flowSteps.map((s, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-[#2D2D2D]/10 hover:border-[#8B5E3C]/30 transition-colors"
            >
              <span
                className="font-display font-bold block mb-3 leading-none text-[#2D2D2D]/15"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)" }}
              >
                {s.step}
              </span>
              <h3 className="font-bold text-[#2D2D2D] mb-2 text-sm">{s.title}</h3>
              <p className="text-[#2D2D2D]/55 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (prefersReduced) return StaticLayout;

  return (
    <>
      {/* Mobile: static (hidden on lg+) */}
      <div className="lg:hidden">{StaticLayout}</div>

      {/* Desktop: scroll-driven horizontal strip (hidden below lg) */}
      <section
        ref={containerRef}
        className="hidden lg:block relative"
        style={{ height: `${flowSteps.length * 100}vh` }}
      >
        <div
          className="sticky top-0 overflow-hidden bg-[#F5F0E8]"
          style={{ height: "100vh" }}
        >
          {/* Header pinned at top-left */}
          <div className="absolute top-0 left-0 right-0 z-10 px-16 pt-14 pb-8 flex items-end justify-between pointer-events-none">
            <div>
              <p className="uppercase tracking-[0.25em] text-xs font-bold text-[#8B5E3C] mb-2">
                {t("homeNew.flowEyebrow") as string}
              </p>
              <h2
                className="font-display font-bold text-[#2D2D2D] leading-tight"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}
              >
                {t("homeNew.flowHeading") as string}
              </h2>
            </div>

            {/* Step counter */}
            <span className="font-display font-bold text-[#2D2D2D]/20 tabular-nums"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              {String(activeStep + 1).padStart(2, "0")} /&nbsp;
              {String(flowSteps.length).padStart(2, "0")}
            </span>
          </div>

          {/* Scrolling cards strip — total width = n × 100vw */}
          <div className="h-full flex items-center">
            <motion.div
              style={{ x }}
              className="flex will-change-transform"
              aria-live="polite"
              aria-label={`Step ${activeStep + 1} of ${flowSteps.length}`}
            >
              {flowSteps.map((s, idx) => (
                <div
                  key={idx}
                  className="w-screen flex-shrink-0 flex items-center justify-center px-16 xl:px-28"
                >
                  <div className="max-w-2xl w-full">
                    {/* Giant step number as background text */}
                    <span
                      aria-hidden="true"
                      className="font-display font-bold block leading-none select-none text-[#2D2D2D]/08 mb-4"
                      style={{ fontSize: "clamp(6rem, 18vw, 14rem)" }}
                    >
                      {s.step}
                    </span>

                    <h3
                      className="font-display font-bold text-[#2D2D2D] leading-tight mb-5"
                      style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="text-[#2D2D2D]/60 leading-relaxed max-w-lg"
                      style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)" }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Progress dots */}
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-0 right-0 flex justify-center gap-2"
          >
            {flowSteps.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: activeStep === i ? "24px" : "8px",
                  height: "8px",
                  backgroundColor:
                    activeStep === i ? "#8B5E3C" : "rgba(45,45,45,0.2)",
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
