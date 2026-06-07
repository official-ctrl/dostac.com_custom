"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package, Tag, Box, Calculator, FileText, Globe,
  MessageCircle, Users, FlaskConical, Factory as FactoryIcon,
  ShieldCheck, Truck, BadgeCheck, ArrowRight, Loader2,
} from "lucide-react";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang } from "@/components/dostac/i18n";
import { SectionNav } from "@/components/dostac/SectionNav";
import { useGetPublicProcess } from "@workspace/api-client-react";
import { PRODUCTION_META } from "@/hooks/page-meta-config";
import type { Lang } from "@/components/dostac/i18n";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function pickLang(obj: unknown, prefix: string, lang: Lang): string {
  if (!obj || typeof obj !== "object") return "";
  const key = `${prefix}${cap(lang)}`;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "string" ? v : "";
}

const FEATURE_ICONS = [Package, Tag, Box, Calculator, FileText, Globe];
const PROCESS_ICONS = [MessageCircle, Users, FlaskConical, FactoryIcon, ShieldCheck, Truck];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT_EXPO } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const sectionHeaderStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

type ActiveSection = "oem-odm" | "global-certifications";

function ProductionContent() {
  const { t } = useT();
  const { lang } = useLang();
  const { data, isLoading } = useGetPublicProcess();
  const [activeSection, setActiveSection] = useState<ActiveSection>("oem-odm");

  const oemRef = useRef<HTMLElement | null>(null);
  const certRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as ActiveSection);
          }
        }
      },
      { threshold: 0.25, rootMargin: "-130px 0px -40% 0px" }
    );
    if (oemRef.current) observer.observe(oemRef.current);
    if (certRef.current) observer.observe(certRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── 딥링크 처리: 헤더 드롭다운에서 /production#section 진입 시
        데이터 로드 완료 후 한 번만 실행 ── */
  useEffect(() => {
    if (isLoading || !data) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    // rAF + 100ms: 페인트 완료 후 스크롤
    requestAnimationFrame(() => {
      setTimeout(() => scrollTo(hash), 100);
    });
  // data 로드 완료 시 한 번만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, data]);

  const oemFeatures = t("production.oemFeatures") as { title: string; desc: string }[];
  const processSteps = t("production.processSteps") as string[];

  if (isLoading || !data) {
    return (
      <div className="container mx-auto py-32 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const certIntro = pickLang(data, "certIntro", lang) || (t("production.certIntroStatic") as string);
  const oemDesc = pickLang(data, "oemDescription", lang) || (t("production.oemIntroStatic") as string);

  const SUBMENU = [
    { id: "oem-odm" as ActiveSection, label: t("production.sections.oem") as string },
    { id: "global-certifications" as ActiveSection, label: t("production.sections.cert") as string },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative w-full min-h-[480px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={data.oemImageUrl ?? dostacImage("hero-production.webp")}
            alt=""
            fetchPriority="high"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/70 via-[#0F172A]/60 to-[#0F172A]/75" />
        </div>
        <div className="container relative z-10 mx-auto px-6 py-28 text-center text-white">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.4em] text-white/60 font-semibold mb-5"
          >
            {t("production.heroLabel") as string}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto"
          >
            {t("production.heroTitle2") as string}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            {t("production.heroSub") as string}
          </motion.p>
        </div>
      </section>

      <SectionNav
        items={SUBMENU}
        activeId={activeSection}
        onSelect={scrollTo}
        ariaLabel={t("production.sectionNavLabel") as string}
      />

      {/* SECTION 1 — OEM / ODM */}
      <section
        id="oem-odm"
        ref={oemRef as React.RefObject<HTMLElement>}
        className="scroll-mt-36 py-24 bg-white"
      >
        <div className="container mx-auto px-6">
          {/* 2-col layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionHeaderStagger}
            >
              <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-4">
                {t("production.oemLabel") as string}
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] mb-6 leading-tight">
                {t("production.oemHeading2") as string}
              </motion.h2>
              <motion.div variants={fadeUp} className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                {oemDesc}
              </motion.div>
            </motion.div>
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-lg"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
            >
              <img
                src={data.oemImageUrl ?? dostacImage("hero-production.webp")}
                alt={t("production.oemImageAlt") as string}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/15 to-transparent" />
            </motion.div>
          </div>

          {/* FEATURE CARDS */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
          >
            {oemFeatures.map((feat, idx) => {
              const Icon = FEATURE_ICONS[idx] ?? Package;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-accent/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0F172A] mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* PROCESS TIMELINE */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUp}
            className="bg-slate-50 rounded-2xl p-8 md:p-12"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3 text-center">
              {t("production.processLabel") as string}
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-[#0F172A] mb-12 text-center">
              {t("production.processHeading") as string}
            </h3>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-2"
            >
              {processSteps.map((step, idx) => {
                const Icon = PROCESS_ICONS[idx] ?? ArrowRight;
                return (
                  <motion.div key={idx} variants={fadeUp} className="flex flex-col items-center text-center relative">
                    {idx < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-7 left-[calc(50%+1.75rem)] w-[calc(100%-3.5rem)] h-px bg-accent/20" />
                    )}
                    <div className="w-14 h-14 rounded-full bg-white border-2 border-accent/30 flex items-center justify-center mb-3 shadow-sm z-10">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-xs font-bold text-accent/60 mb-1 tabular-nums">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="text-sm font-semibold text-[#0F172A] leading-tight">{step}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 — GLOBAL CERTIFICATIONS */}
      <section
        id="global-certifications"
        ref={certRef as React.RefObject<HTMLElement>}
        className="scroll-mt-36 py-24 bg-slate-50"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionHeaderStagger}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-4">
              {t("production.certLabel") as string}
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] mb-6">
              {t("production.certsHeading2") as string}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
              {certIntro}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {data.certItems.map((cert, idx) => {
              const name = pickLang(cert, "name", lang);
              const desc = pickLang(cert, "description", lang);
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="bg-white p-6 rounded-xl border border-slate-200 hover:border-accent/50 hover:shadow-md transition-all duration-300 flex flex-col"
                  data-testid={`cert-item-${idx}`}
                >
                  <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 overflow-hidden">
                    {cert.imageUrl ? (
                      <img src={cert.imageUrl} alt={cert.code} loading="lazy" className="w-full h-full object-contain p-1" />
                    ) : (
                      <BadgeCheck className="w-7 h-7 text-[#0F172A]" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-accent mb-1.5 uppercase tracking-wider">
                    {cert.code}
                  </div>
                  <h4 className="font-display font-bold text-base text-[#0F172A] mb-2">{name}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0F172A] text-white text-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionHeaderStagger}
          >
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold mb-4">
              {t("production.ctaEyebrow") as string}
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto leading-tight">
              {t("production.ctaHeading") as string}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              {t("production.ctaSub") as string}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/contact?source=production&inquiryType=oem#contact-form"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-medium text-white shadow-sm hover:bg-accent/90 hover:shadow-accent/20 hover:shadow-md transition-all"
              >
                {t("production.ctaButton") as string}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default function Production() {
  return (
    <Layout>
      <ProductionContent />
    </Layout>
  );
}
