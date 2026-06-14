"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };

/* ── Category data ── */
const CATEGORIES = [
  {
    slug: "skincare",
    name: "Skincare",
    sub: "Serum · Toner · Moisturizer",
    moq: "500 units",
    lead: "14 days",
    cert: "KGMP",
    accent: "#8B5E3C",
  },
  {
    slug: "sun-care",
    name: "Sun Care",
    sub: "SPF 30–50+ · PA++++",
    moq: "1,000 units",
    lead: "21 days",
    cert: "KGMP · EU",
    accent: "#3B82F6",
  },
  {
    slug: "hair-care",
    name: "Hair Care",
    sub: "Shampoo · Mask · Serum",
    moq: "1,000 units",
    lead: "18 days",
    cert: "KGMP",
    accent: "#8B5E3C",
  },
  {
    slug: "mask-sheet",
    name: "Mask Sheet",
    sub: "Bio-Cellulose · Hydrogel",
    moq: "3,000 units",
    lead: "10 days",
    cert: "KGMP · CF",
    accent: "#3B82F6",
  },
  {
    slug: "body-care",
    name: "Body Care",
    sub: "Lotion · Oil · Scrub",
    moq: "500 units",
    lead: "14 days",
    cert: "KGMP",
    accent: "#8B5E3C",
  },
  {
    slug: "baby-care",
    name: "Baby & Sensitive",
    sub: "EWG Green · Hypoallergenic",
    moq: "500 units",
    lead: "21 days",
    cert: "KGMP · EWG",
    accent: "#3B82F6",
  },
];

export function MarketAnalysisSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F5F0E8]">
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <motion.p variants={fadeUp} className="text-[#8B5E3C] text-[11px] font-bold tracking-[0.3em] uppercase mb-4">
              Product Categories
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-[2.6rem] font-bold text-[#2D2D2D] leading-[1.08]">
              Source by category.
              <br />
              <span className="text-[#2D2D2D]/35">Start with any MOQ.</span>
            </motion.h2>
          </div>
          <motion.div variants={fadeUp}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8B5E3C] hover:gap-3 transition-all"
            >
              Browse All Products <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Category grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {CATEGORIES.map(({ slug, name, sub, moq, lead, cert, accent }) => (
            <motion.div
              key={slug}
              variants={fadeUp}
              className="group bg-white border border-[#2D2D2D]/[0.07] rounded-2xl overflow-hidden hover:shadow-[0_8px_28px_rgba(45,45,45,0.10)] hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Top accent bar */}
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
              />

              <div className="p-6">
                {/* Name + sub */}
                <div className="mb-5">
                  <h3 className="font-display text-[1.1rem] font-bold text-[#2D2D2D] mb-1 group-hover:text-[#8B5E3C] transition-colors">
                    {name}
                  </h3>
                  <p className="text-[11px] text-[#2D2D2D]/45">{sub}</p>
                </div>

                {/* Data rows */}
                <div className="flex flex-col gap-2 mb-5">
                  {[
                    { k: "MOQ",           v: moq  },
                    { k: "Sample Lead",   v: lead },
                    { k: "Certifications",v: cert },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-[10px] text-[#2D2D2D]/35 uppercase tracking-[0.12em] font-semibold">{k}</span>
                      <span className="text-[11px] font-bold text-[#2D2D2D]/70">{v}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={`/products?category=${slug}`}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B5E3C] hover:gap-2 transition-all"
                >
                  View Products <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
