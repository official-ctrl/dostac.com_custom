"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Award,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang, useCategoryLabel, useSubCategoryLabel } from "@/components/dostac/i18n";
import {
  getGetPublicProductQueryOptions,
  getListPublicProductsQueryOptions,
} from "@workspace/api-client-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

function toTitleCase(s: string) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function ProductDetailContent() {
  const rawParams = useParams(); const slug = (rawParams?.slug as string) ?? "";
  const { t } = useT();
  const { lang } = useLang();
  const catLabel = useCategoryLabel();
  const subLabel = useSubCategoryLabel();
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCopiedHoveredRef = useRef(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const dismissCopy = useCallback(() => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    setCopied(false);
  }, []);

  const startCopyTimer = useCallback(() => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      if (!isCopiedHoveredRef.current) dismissCopy();
    }, 5000);
  }, [dismissCopy]);

  useEffect(() => {
    if (!copied) return;
    startCopyTimer();
    return () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); };
  }, [copied, startCopyTimer]);

  const {
    data: product,
    isLoading,
    isError,
    isPlaceholderData,
  } = useQuery({
    ...getGetPublicProductQueryOptions(slug, { lang }),
    placeholderData: keepPreviousData,
  });

  // ── Language-switch cross-fade ───────────────────────────────────────────
  const [isFadedOut, setIsFadedOut] = useState(false);
  const isFadedOutRef = useRef(false);
  const isPlaceholderDataRef = useRef(isPlaceholderData);
  isPlaceholderDataRef.current = isPlaceholderData;

  const [displayedProduct, setDisplayedProduct] = useState(product);
  const latestProductRef = useRef(product);

  const { data: allProducts } = useQuery({
    ...getListPublicProductsQueryOptions({ lang }),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isPlaceholderData) return;
    latestProductRef.current = product;
    if (!isFadedOutRef.current) {
      setDisplayedProduct(product);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isPlaceholderData]);

  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;
    isFadedOutRef.current = true;
    setIsFadedOut(true);
  }, [lang]);

  useEffect(() => {
    if (!isFadedOut || isPlaceholderData) return;
    setDisplayedProduct(latestProductRef.current);
    isFadedOutRef.current = false;
    setIsFadedOut(false);
  }, [isFadedOut, isPlaceholderData]);

  const handleFadeComplete = useCallback(() => {
    if (!isFadedOutRef.current) return;
    if (isPlaceholderDataRef.current) return;
    setDisplayedProduct(latestProductRef.current);
    isFadedOutRef.current = false;
    setIsFadedOut(false);
  }, []);


  const fallbackCopyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
    }).catch(() => {});
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name ?? "",
        url: window.location.href,
      }).catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        fallbackCopyToClipboard();
      });
    } else {
      fallbackCopyToClipboard();
    }
  };

  const related = (allProducts ?? [])
    .filter((p) => p.slug !== slug && (displayedProduct ? p.category === displayedProduct.category : true))
    .slice(0, 3);

  if (isLoading && !displayedProduct) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !displayedProduct) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-6">
        <h1 className="font-display text-3xl font-bold text-primary">
          {t("products.notFound") as string}
        </h1>
        <p className="text-muted-foreground">
          {t("products.notFoundHelper") as string}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("products.backToProducts") as string}
        </Link>
      </div>
    );
  }

  const fallbackImg = dostacImage(
    `product-${String(((displayedProduct.id - 1) % 10) + 1).padStart(2, "0")}.webp`,
  );

  const displayName = displayedProduct.name || toTitleCase(slug);
  const oemHref = `/contact?product=${encodeURIComponent(displayedProduct.slug)}&inquiryType=oem${displayedProduct.material ? `&material=${encodeURIComponent(displayedProduct.material)}` : ""}#contact-form`;
  const contactHref = `/contact?product=${encodeURIComponent(displayedProduct.slug)}${displayedProduct.material ? `&material=${encodeURIComponent(displayedProduct.material)}` : ""}#contact-form`;

  return (
    <motion.div
      animate={{ opacity: isFadedOut ? 0 : 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onAnimationComplete={handleFadeComplete}
    >

      {/* ═══ HERO — Split layout ═══ */}
      <section style={{ backgroundColor: "#0D1117" }} className="overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[580px]">

            {/* LEFT: Text */}
            <div className="flex flex-col justify-between py-12 lg:py-16 lg:pr-12 text-white order-2 lg:order-1">
              {/* Breadcrumb + Share */}
              <nav className="flex items-center justify-between gap-2 text-sm">
                <Link href="/products" className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/18 hover:text-white transition-all">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("products.backToProducts") as string}
                </Link>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label={copied ? (t("products.copied") as string) : canNativeShare ? (t("products.share") as string) : (t("products.copyLink") as string)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/15 hover:text-white transition-all"
                  onMouseEnter={() => { isCopiedHoveredRef.current = true; if (copyTimerRef.current) clearTimeout(copyTimerRef.current); }}
                  onMouseLeave={() => { isCopiedHoveredRef.current = false; if (copied) startCopyTimer(); }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span key="copied" className="inline-flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span aria-live="polite">{t("products.copied") as string}</span>
                      </motion.span>
                    ) : (
                      <motion.span key="copy" className="inline-flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        {canNativeShare ? <Share2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{canNativeShare ? (t("products.share") as string) : (t("products.copyLink") as string)}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </nav>

              {/* Main info */}
              <div className="flex-1 flex flex-col justify-center mt-10 lg:mt-0">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {displayedProduct.category && (
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold text-white/70">
                      {catLabel(displayedProduct.category)}
                    </span>
                  )}
                  {displayedProduct.subCategory && (
                    <span className="inline-flex items-center rounded-full bg-[#8B5E3C]/80 border border-[#8B5E3C]/40 px-3 py-1 text-[11px] font-semibold text-white">
                      {subLabel(displayedProduct.subCategory)}
                    </span>
                  )}
                </div>

                {displayedProduct.valueProp && (
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#8B5E3C] font-bold mb-3">
                    {displayedProduct.valueProp}
                  </p>
                )}

                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.05] max-w-lg mb-4">
                  {displayName}
                </h1>

                {displayedProduct.headline && (
                  <p className="text-base md:text-lg text-white/65 leading-relaxed max-w-md mb-8">
                    {displayedProduct.headline}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Link href={oemHref} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#8B5E3C] px-6 text-sm font-semibold text-white hover:bg-[#7a5235] transition-colors">
                    {t("products.oemInquiry") as string}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link href={contactHref} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white/80 hover:bg-white/8 hover:text-white transition-all">
                    {t("products.contactUs") as string}
                  </Link>
                </div>
              </div>

              {/* Bottom cert strip */}
              {displayedProduct.certs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-white/10">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-semibold shrink-0">
                    {t("products.certsLabel") as string}
                  </span>
                  {displayedProduct.certs.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full border border-[#8B5E3C]/35 bg-[#8B5E3C]/10 px-2.5 py-1 text-[11px] font-semibold text-[#C99A72]">
                      <Award className="h-3 w-3" />
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product image */}
            <div className="relative flex items-center justify-center order-1 lg:order-2 pt-12 pb-8 lg:py-12 lg:pl-12">
              <div className="relative w-full max-w-[440px] mx-auto">
                <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
                  <img
                    src={displayedProduct.imageUrl ?? fallbackImg}
                    alt={displayedProduct.name}
                    className="w-full h-full object-contain p-10"
                  />
                </div>
                {/* Decorative glow */}
                <div aria-hidden="true" className="absolute -inset-8 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,94,60,0.12) 0%, transparent 70%)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BODY TEXT ═══ */}
      {displayedProduct.body && (
        <section className="py-16 md:py-20" style={{ backgroundColor: "#F5F0E8" }}>
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.3em] text-[#8B5E3C] font-bold mb-2">
                Overview
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="rich-html text-[#2D2D2D]/75 text-[15px] leading-[1.85] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: displayedProduct.body }}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══ FEATURES ═══ */}
      {displayedProduct.features.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={stagger}
            >
              <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.3em] text-[#8B5E3C] font-bold mb-2">
                {t("products.featuresLabel") as string}
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-display text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-10">
                Key Benefits
              </motion.h2>
              <motion.div
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {displayedProduct.features.map((feat, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="flex items-start gap-3.5 p-5 rounded-2xl border border-[#2D2D2D]/[0.07]"
                    style={{ backgroundColor: "#F5F0E8" }}
                  >
                    <div className="shrink-0 w-7 h-7 rounded-full bg-[#8B5E3C]/12 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[#8B5E3C]" />
                    </div>
                    <span className="text-[13.5px] text-[#2D2D2D]/80 leading-relaxed">{feat}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══ MATERIAL + SPEC ═══ */}
      {(displayedProduct.material || displayedProduct.subCategory) && (
        <section className="py-16 md:py-20" style={{ backgroundColor: "#0D1117" }}>
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {displayedProduct.material && (
                <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#8B5E3C] font-bold mb-1">
                    {t("products.materialLabel") as string}
                  </p>
                  <h3 className="font-display text-xl font-bold text-white mb-4">
                    Material &amp; Formula
                  </h3>
                  <p className="text-white/60 text-[14px] leading-relaxed">
                    {displayedProduct.material}
                  </p>
                </motion.div>
              )}

              {displayedProduct.subCategory && (
                <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#8B5E3C] font-bold mb-1">
                    {t("products.subCategoryLabel") as string}
                  </p>
                  <h3 className="font-display text-xl font-bold text-white mb-4">
                    Product Type
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#8B5E3C]/15 border border-[#8B5E3C]/30 px-4 py-2 text-sm font-semibold text-[#C99A72]">
                      {catLabel(displayedProduct.category)}
                    </span>
                    <span className="text-white/30">›</span>
                    <span className="inline-flex items-center rounded-full bg-[#8B5E3C]/25 border border-[#8B5E3C]/40 px-4 py-2 text-sm font-semibold text-[#D4AA82]">
                      {subLabel(displayedProduct.subCategory)}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══ OEM / ODM CTA ═══ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="rounded-2xl border border-[#8B5E3C]/15 p-8 md:p-12"
            style={{ backgroundColor: "#F5F0E8" }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#8B5E3C] font-bold mb-2">
                  OEM / ODM
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-3 leading-snug">
                  {t("products.bottomCtaHeading") as string}
                </h2>
                <p className="text-[#2D2D2D]/60 text-[14.5px] leading-relaxed max-w-lg">
                  {t("products.bottomCtaBody") as string}
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0 min-w-[180px]">
                <Link
                  href={oemHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#8B5E3C] px-7 text-sm font-semibold text-white hover:bg-[#7a5235] transition-colors shadow-sm"
                >
                  {t("products.oemInquiry") as string}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={contactHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#8B5E3C]/30 px-7 text-sm font-semibold text-[#8B5E3C] hover:bg-[#8B5E3C]/8 transition-all text-center"
                >
                  {t("products.contactUs") as string}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ RELATED PRODUCTS ═══ */}
      {related.length > 0 && (
        <section className="py-16 md:py-20 border-t border-[#2D2D2D]/[0.06]" style={{ backgroundColor: "#F5F0E8" }}>
          <div className="container mx-auto px-6 max-w-6xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#8B5E3C] font-bold mb-2">
              {t("products.heroLabel") as string}
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-10">
              {t("products.relatedProducts") as string}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => {
                const fallback = dostacImage(
                  `product-${String(((item.id - 1) % 10) + 1).padStart(2, "0")}.webp`,
                );
                return (
                  <Link key={item.id} href={`/products/${item.slug}`} className="group block">
                    <article className="h-full flex flex-col rounded-2xl bg-white border border-[#2D2D2D]/[0.07] overflow-hidden hover:shadow-[0_8px_32px_rgba(45,45,45,0.10)] hover:-translate-y-1 transition-all duration-300">
                      <div className="relative aspect-square bg-[#F5F0E8] overflow-hidden">
                        <img
                          src={item.imageUrl ?? fallback}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.category && (
                          <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-[#8B5E3C] shadow-sm">
                            {catLabel(item.category)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col p-5">
                        <h3 className="font-display text-[15px] font-bold text-[#2D2D2D] leading-snug line-clamp-2 group-hover:text-[#8B5E3C] transition-colors mb-1.5">
                          {item.name}
                        </h3>
                        {item.headline && (
                          <p className="text-[12px] text-[#2D2D2D]/50 line-clamp-2 mb-auto leading-relaxed">
                            {item.headline}
                          </p>
                        )}
                        <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8B5E3C]">
                          {t("products.viewDetails") as string}
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="py-20 text-white text-center" style={{ backgroundColor: "#0D1117" }}>
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-semibold mb-4">
              {t("products.heroLabel") as string}
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {t("products.bottomCtaHeading") as string}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 text-[15px] mb-8 leading-relaxed">
              {t("products.bottomCtaBody") as string}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#8B5E3C] px-8 text-sm font-semibold text-white hover:bg-[#7a5235] hover:shadow-lg transition-all"
              >
                {t("products.bottomCtaButton") as string}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}

export default function ProductDetail() {
  return (
    <Layout>
      <ProductDetailContent />
    </Layout>
  );
}
