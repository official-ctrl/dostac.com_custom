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
  useListPublicProducts,
} from "@workspace/api-client-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

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

  const { data: allProducts } = useListPublicProducts({ lang });

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

  useEffect(() => {
    if (!displayedProduct) return;
    const categoryPart = displayedProduct.category ? `${catLabel(displayedProduct.category)} — ` : "";
    const prev = document.title;
    document.title = `${categoryPart}${displayedProduct.name} | DOSTAC`;
    return () => { document.title = prev; };
  }, [displayedProduct, catLabel]);

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

  return (
    <motion.div
      animate={{ opacity: isFadedOut ? 0 : 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onAnimationComplete={handleFadeComplete}
    >
      {/* HERO */}
      <section className="relative w-full min-h-[480px] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={displayedProduct.imageUrl ?? fallbackImg}
            alt={displayedProduct.name}
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/92 via-primary/60 to-primary/20" />
        </div>
        <div className="container relative z-10 mx-auto px-6 pb-16 pt-32 text-white">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-between gap-2 text-sm text-white/60 mb-8">
            <div className="flex items-center gap-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 hover:text-white transition"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("products.backToProducts") as string}
              </Link>
              {displayedProduct.category && (
                <>
                  <span className="text-white/30">/</span>
                  <span className="text-white/60">{catLabel(displayedProduct.category)}</span>
                </>
              )}
            </div>
            <button
              onClick={handleShare}
              aria-label={copied ? (t("products.copied") as string) : canNativeShare ? (t("products.share") as string) : (t("products.copyLink") as string)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/20 hover:text-white transition-all"
              onMouseEnter={() => {
                isCopiedHoveredRef.current = true;
                if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
              }}
              onMouseLeave={() => {
                isCopiedHoveredRef.current = false;
                if (copied) startCopyTimer();
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span key="copied" className="inline-flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span aria-live="polite">{t("products.copied") as string}</span>
                  </motion.span>
                ) : (
                  <motion.span key="copy" className="inline-flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    {canNativeShare ? <Share2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{canNativeShare ? (t("products.share") as string) : (t("products.copyLink") as string)}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-5">
            {displayedProduct.category && (
              <span className="inline-flex items-center rounded-full bg-white/15 backdrop-blur border border-white/20 px-3 py-1 text-xs font-semibold text-white">
                {catLabel(displayedProduct.category)}
              </span>
            )}
            {displayedProduct.subCategory && (
              <span className="inline-flex items-center rounded-full bg-accent/80 backdrop-blur border border-accent/40 px-3 py-1 text-xs font-semibold text-white">
                {subLabel(displayedProduct.subCategory)}
              </span>
            )}
          </div>

          {displayedProduct.valueProp && (
            <p className="text-xs uppercase tracking-[0.35em] text-accent font-semibold mb-4">
              {displayedProduct.valueProp}
            </p>
          )}

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl mb-4">
            {displayedProduct.name}
          </h1>

          {displayedProduct.headline && (
            <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
              {displayedProduct.headline}
            </p>
          )}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16"
          >
            {/* LEFT — IMAGE + CERTS */}
            <motion.div variants={fadeUp} className="lg:col-span-2 flex flex-col gap-6">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={displayedProduct.imageUrl ?? fallbackImg}
                  alt={displayedProduct.name}
                  className="w-full aspect-[4/3] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
              </div>

              {/* CERT BADGES */}
              {displayedProduct.certs.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-4 w-4 text-accent" />
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500">
                      {t("products.certsLabel") as string}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayedProduct.certs.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA — sidebar */}
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 flex flex-col gap-3">
                <p className="text-sm font-semibold text-primary">
                  {t("products.bottomCtaHeading") as string}
                </p>
                <Link
                  href={`/contact?product=${encodeURIComponent(displayedProduct.slug)}&inquiryType=oem${displayedProduct.material ? `&material=${encodeURIComponent(displayedProduct.material)}` : ""}#contact-form`}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 transition-colors"
                >
                  {t("products.oemInquiry") as string}
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/contact?product=${encodeURIComponent(displayedProduct.slug)}${displayedProduct.material ? `&material=${encodeURIComponent(displayedProduct.material)}` : ""}#contact-form`}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
                >
                  {t("products.contactUs") as string}
                </Link>
              </div>
            </motion.div>

            {/* RIGHT — BODY + FEATURES */}
            <motion.div variants={fadeUp} className="lg:col-span-3">
              {/* Rich body */}
              {displayedProduct.body && (
                <div
                  className="rich-html text-slate-600 text-base leading-relaxed mb-10 pb-10 border-b border-slate-100"
                  dangerouslySetInnerHTML={{ __html: displayedProduct.body }}
                />
              )}

              {/* FEATURES */}
              {displayedProduct.features.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-5">
                    {t("products.featuresLabel") as string}
                  </p>
                  <motion.ul variants={stagger} className="flex flex-col gap-3">
                    {displayedProduct.features.map((feat, i) => (
                      <motion.li
                        key={i}
                        variants={fadeUp}
                        className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 leading-snug">
                          {feat}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              )}

              {/* SPEC PANEL — material + sub-category */}
              {(displayedProduct.material || displayedProduct.subCategory) && (
                <div className={`rounded-xl border border-slate-200 bg-slate-50 overflow-hidden ${displayedProduct.features.length > 0 ? "mt-8" : ""}`}>
                  <table className="w-full text-sm">
                    <tbody>
                      {displayedProduct.subCategory && (
                        <tr className="border-b border-slate-200 last:border-0">
                          <td className="py-3 px-4 w-36 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 whitespace-nowrap">
                            {t("products.subCategoryLabel") as string}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">
                            {subLabel(displayedProduct.subCategory)}
                          </td>
                        </tr>
                      )}
                      {displayedProduct.material && (
                        <tr className="border-b border-slate-200 last:border-0">
                          <td className="py-3 px-4 w-36 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 whitespace-nowrap">
                            {t("products.materialLabel") as string}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">
                            {displayedProduct.material}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Back link */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("products.backToProducts") as string}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
              {t("products.heroLabel") as string}
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-10">
              {t("products.relatedProducts") as string}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item, index) => {
                const fallback = dostacImage(
                  `product-${String((index % 10) + 1).padStart(2, "0")}.webp`,
                );
                return (
                  <Link key={item.id} href={`/products/${item.slug}`} className="group block">
                    <article className="h-full flex flex-col rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                      <div className="relative aspect-[4/3] bg-slate-200 overflow-hidden">
                        <img
                          src={item.imageUrl ?? fallback}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.category && (
                          <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-accent shadow-sm">
                            {catLabel(item.category)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col p-5">
                        <h3 className="font-display text-base font-semibold text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors mb-1">
                          {item.name}
                        </h3>
                        {item.headline && (
                          <p className="text-xs text-slate-500 line-clamp-2 mb-auto">
                            {item.headline}
                          </p>
                        )}
                        <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                          {t("products.viewDetails") as string}
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

      {/* BOTTOM CTA */}
      <section className="py-20 bg-[#0F172A] text-white text-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold mb-4"
            >
              {t("products.heroLabel") as string}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto leading-tight"
            >
              {t("products.bottomCtaHeading") as string}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-white/70 text-lg mb-8 max-w-xl mx-auto leading-relaxed"
            >
              {t("products.bottomCtaBody") as string}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-sm hover:bg-accent/90 hover:shadow-accent/20 hover:shadow-md transition-all"
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
