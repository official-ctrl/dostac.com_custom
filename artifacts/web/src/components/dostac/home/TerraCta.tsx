"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCtaClick } from "@/lib/analytics";

export function TerraCta() {
  return (
    <section
      className="relative py-28 md:py-40 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #0D1117 0%, #140C05 60%, #1A0E06 100%)",
      }}
    >
      {/* ── Top separator: thin TERRA accent line ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(to right, transparent 0%, rgba(139,94,60,0.4) 30%, rgba(139,94,60,0.4) 70%, transparent 100%)",
        }}
      />

      {/* ── TERRA ambient glow ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 55% at 50% 60%, rgba(139,94,60,0.22) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Dot grid ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #F5F0E8 1px, transparent 0)",
          backgroundSize: "32px 32px",
          opacity: 0.03,
          pointerEvents: "none",
        }}
      />

      {/* ── Decorative wordmark ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <span
          className="font-display font-bold italic leading-none whitespace-nowrap"
          style={{
            fontSize: "clamp(6rem, 22vw, 20rem)",
            color: "rgba(245,240,232,0.03)",
          }}
        >
          Dostac
        </span>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 container mx-auto px-6 text-center max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="uppercase tracking-[0.35em] text-[11px] font-bold mb-6"
          style={{ color: "#8B5E3C" }}
        >
          Ready to Start?
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold leading-[1.05] mb-6"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            color: "#F5F0E8",
          }}
        >
          Launch Your K-Beauty
          <br />
          Brand Today
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="leading-relaxed mb-10 max-w-xl mx-auto"
          style={{
            fontSize: "clamp(1rem, 1.5vw, 1.125rem)",
            color: "rgba(245,240,232,0.55)",
          }}
        >
          ISO-certified Korean cosmetics OEM/ODM. Low MOQ, fast turnaround,
          shipped to 32+ countries.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#rfq" onClick={() => trackCtaClick("Get Free Quote", "terra_cta")}>
            <Button
              size="lg"
              className="rounded-full text-white h-13 px-8 font-semibold"
              style={{
                backgroundColor: "#8B5E3C",
                boxShadow: "0 0 32px rgba(139,94,60,0.45)",
              }}
            >
              Get a Free Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full bg-transparent h-13 px-8 font-semibold"
              style={{
                borderColor: "rgba(245,240,232,0.2)",
                color: "rgba(245,240,232,0.8)",
              }}
            >
              Talk to Us
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
