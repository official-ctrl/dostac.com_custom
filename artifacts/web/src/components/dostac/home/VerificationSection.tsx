"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Award, Leaf, CheckCircle2 } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };

/* ── Certification cards (TYPE B — glass on DEEP) ── */
const CERTS = [
  {
    Icon: ShieldCheck,
    name: "KGMP",
    full: "Korean Good Manufacturing Practice",
    issuer: "Ministry of Food & Drug Safety",
    country: "Republic of Korea",
    detail: "The mandatory Korean quality standard for cosmetics manufacturing — equivalent to EU GMP but specific to Korea's regulatory framework.",
  },
  {
    Icon: Award,
    name: "ISO 22716",
    full: "Good Manufacturing Practices",
    issuer: "International Organization for Standardization",
    country: "Global Standard",
    detail: "International GMP certification covering personnel, premises, equipment, and production processes for cosmetics.",
  },
  {
    Icon: Leaf,
    name: "Cruelty-Free",
    full: "No Animal Testing",
    issuer: "PETA · Leaping Bunny Standards",
    country: "International",
    detail: "All formulations and finished products are developed without animal testing at any stage of production.",
  },
];

/* ── Process steps ── */
const STEPS = [
  { n: "01", label: "Facility Audit" },
  { n: "02", label: "Document Review" },
  { n: "03", label: "Batch Testing" },
  { n: "04", label: "Ongoing Monitoring" },
];

export function VerificationSection() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#0D1117" }}>
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-[#8B5E3C] text-[11px] font-bold tracking-[0.3em] uppercase mb-4">
            Verification System
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-[#F5F0E8] leading-[1.08] mb-4">
            Every supplier
            <br />
            <span className="text-[#F5F0E8]/40">certified and checked.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#F5F0E8]/50 text-base leading-relaxed">
            We verify compliance before you ever reach out to a manufacturer.
          </motion.p>
        </motion.div>

        {/* Cert cards */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-12"
        >
          {CERTS.map(({ Icon, name, full, issuer, country, detail }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              className="group bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 hover:border-[#8B5E3C]/30 hover:bg-white/[0.06] transition-all duration-300"
            >
              {/* Badge header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#8B5E3C]/15 flex items-center justify-center group-hover:bg-[#8B5E3C]/25 transition-colors">
                  <Icon className="h-5 w-5 text-[#8B5E3C]" />
                </div>
                <div>
                  <p className="font-bold text-[#F5F0E8] text-[15px] leading-none">{name}</p>
                  <p className="text-[9px] text-[#F5F0E8]/35 mt-0.5 uppercase tracking-[0.1em]">Certified</p>
                </div>
              </div>

              {/* Full name */}
              <p className="text-[11px] font-bold text-[#F5F0E8]/50 uppercase tracking-[0.12em] mb-3">
                {full}
              </p>

              {/* Detail */}
              <p className="text-[12px] text-[#F5F0E8]/40 leading-relaxed mb-5">
                {detail}
              </p>

              {/* Issuer */}
              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-[9px] text-[#F5F0E8]/30 uppercase tracking-[0.12em] mb-0.5">Issued by</p>
                <p className="text-[10px] text-[#F5F0E8]/50 font-semibold">{issuer}</p>
                <p className="text-[9px] text-[#8B5E3C]/70">{country}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Verification process steps */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="flex flex-col sm:flex-row items-center justify-center gap-0"
        >
          {STEPS.map(({ n, label }, i) => (
            <motion.div key={n} variants={fadeUp} className="flex items-center">
              <div className="flex flex-col items-center gap-2 px-6 py-4">
                <div className="w-8 h-8 rounded-full border border-[#8B5E3C]/40 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#8B5E3C]">{n}</span>
                </div>
                <span className="text-[10px] text-[#F5F0E8]/40 font-semibold uppercase tracking-[0.12em] text-center whitespace-nowrap">
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block w-8 h-px bg-white/[0.08]" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom trust note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-2 mt-8"
        >
          <CheckCircle2 className="h-4 w-4 text-[#8B5E3C]" />
          <p className="text-[12px] text-[#F5F0E8]/35">
            All manufacturers in our network are independently verified before listing.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
