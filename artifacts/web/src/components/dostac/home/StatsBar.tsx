"use client";

import { motion } from "framer-motion";
import { CountUp } from "./CountUp";

const STATS = [
  { value: 14,  suffix: "",  unit: "Yrs",      label: "Industry Experience" },
  { value: 32,  suffix: "+", unit: "Countries", label: "Global Distribution" },
  { value: 800, suffix: "+", unit: "SKU",       label: "Product Range" },
  { value: 24,  suffix: "h", unit: "Response",  label: "Quote Turnaround" },
] as const;

export function StatsBar() {
  return (
    <section className="py-14 md:py-16" style={{ backgroundColor: "#0D1117" }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="flex items-baseline justify-center gap-1.5 mb-1.5">
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  duration={1.8}
                  className="font-display text-4xl md:text-5xl font-bold text-[#F5F0E8]"
                />
                <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-widest">
                  {stat.unit}
                </span>
              </div>
              <p className="text-[#F5F0E8]/40 text-[11px] uppercase tracking-[0.2em] font-semibold">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
