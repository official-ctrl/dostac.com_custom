import React, { useEffect, useRef, useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { SectionNav } from "@/components/dostac/SectionNav";
import { useT, useLang } from "@/components/dostac/i18n";
import { useListPublicProducts } from "@workspace/api-client-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function ProductsContent() {
  const { t } = useT();
  const { lang } = useLang();
  const productsQuery = useListPublicProducts({ lang });
  const products = productsQuery.data ?? [];

  const search = useSearch();
  const [, navigate] = useLocation();

  const categoryFromUrl = new URLSearchParams(search).get("category");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [copiedCategory, setCopiedCategory] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedCategory(true);
      setTimeout(() => setCopiedCategory(false), 2000);
    }).catch(() => {
      // Fallback for browsers where clipboard API is unavailable
      const el = document.createElement("textarea");
      el.value = window.location.href;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
        setCopiedCategory(true);
        setTimeout(() => setCopiedCategory(false), 2000);
      } catch {
        // Silent — clipboard unavailable in this context
      } finally {
        document.body.removeChild(el);
      }
    });
  };

  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    setActiveSlug(null);
    setCopiedCategory(false);
  }, [categoryFromUrl]);

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => !!c))
  );

  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    if (selectedCategory !== null && categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(null);
      navigate("/products", { replace: true });
    }
  }, [categories, selectedCategory, navigate]);

  const filteredProducts =
    selectedCategory === null
      ? products
      : products.filter((p) => p.category === selectedCategory);

  useEffect(() => {
    if (filteredProducts.length === 0) return;
    const currentRefs = sectionRefs.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = entry.target.getAttribute("data-slug");
            if (slug) setActiveSlug(slug);
          }
        }
      },
      { threshold: 0.2, rootMargin: "-130px 0px -40% 0px" },
    );
    currentRefs.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredProducts]);

  const scrollTo = (slug: string) => {
    const el = document.getElementById(`product-${slug}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCategorySelect = (cat: string | null) => {
    setSelectedCategory(cat);
    setActiveSlug(null);
    if (cat === null) {
      navigate("/products", { replace: false });
    } else {
      navigate(`/products?category=${encodeURIComponent(cat)}`, { replace: false });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showFilterBar = categories.length > 1;

  return (
    <>
      {/* HERO */}
      <section className="relative w-full min-h-[480px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={dostacImage("hero-products.webp")}
            alt=""
            fetchPriority="high"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/65 via-primary/55 to-primary/72" />
        </div>
        <div className="container relative z-10 mx-auto px-6 py-28 text-center text-white">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.4em] text-white/60 font-semibold mb-5"
          >
            {t("products.heroLabel") as string}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto"
          >
            {t("products.heroTitle") as string}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            {t("products.heroSub") as string}
          </motion.p>
        </div>
      </section>

      {/* CATEGORY FILTER BAR */}
      {showFilterBar && (
        <div className="bg-white border-b border-slate-100">
          <div className="container mx-auto px-6">
            <div
              className="flex overflow-x-auto no-scrollbar gap-2 py-3"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus:outline-none ${
                  selectedCategory === null
                    ? "bg-accent text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("products.filterAll") as string}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    selectedCategory === null
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {products.length}
                </span>
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <div key={cat} className="flex-shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus:outline-none ${
                        isActive
                          ? "bg-accent text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                      <span
                        className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                          isActive
                            ? "bg-white/25 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {categoryCounts[cat] ?? 0}
                      </span>
                    </button>
                    {isActive && (
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        title={copiedCategory ? (t("products.copied") as string) : (t("products.copyLink") as string)}
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none"
                      >
                        {copiedCategory ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STICKY SUBMENU */}
      {filteredProducts.length > 0 && (
        <SectionNav
          items={filteredProducts.map((p) => ({ id: p.slug, label: p.name }))}
          activeId={activeSlug ?? ""}
          onSelect={scrollTo}
          ariaLabel="Products navigation"
          testIdPrefix="products-nav-"
        />
      )}

      {/* PRODUCT SECTIONS */}
      <div className="bg-[#F5F7FA]">
        {productsQuery.isLoading ? (
          <div className="py-32 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-32 text-center text-muted-foreground container mx-auto px-6">
            {t("products.empty") as string}
          </div>
        ) : (
          filteredProducts.map((product, index) => {
            const fallbackImg = dostacImage(
              `product-${String(((product.id - 1) % 10) + 1).padStart(2, "0")}.webp`,
            );
            const isOdd = index % 2 !== 0;
            const features = product.features;

            return (
              <article
                key={product.id}
                id={`product-${product.slug}`}
                data-slug={product.slug}
                ref={(el) => {
                  if (el) sectionRefs.current.set(product.slug, el);
                  else sectionRefs.current.delete(product.slug);
                }}
                className={`scroll-mt-36 py-20 ${isOdd ? "bg-white" : "bg-[#F5F7FA]"}`}
              >
                <div className="container mx-auto px-6">
                  <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={stagger}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
                  >
                    {/* IMAGE — always left on desktop */}
                    <motion.div
                      variants={fadeUp}
                      className="relative rounded-2xl overflow-hidden shadow-md"
                    >
                      <img
                        src={product.imageUrl ?? fallbackImg}
                        alt={product.name}
                        loading="lazy"
                        className="w-full aspect-[4/3] object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                        {product.category && (
                          <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-accent shadow-sm">
                            {product.category}
                          </span>
                        )}
                        {product.subCategory && (
                          <span className="inline-flex items-center rounded-full bg-accent/85 backdrop-blur px-3 py-1 text-xs font-semibold text-white shadow-sm">
                            {product.subCategory}
                          </span>
                        )}
                      </div>
                    </motion.div>

                    {/* CONTENT */}
                    <motion.div variants={fadeUp}>
                      {product.valueProp && (
                        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-4">
                          {product.valueProp}
                        </p>
                      )}
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F172A] mb-3 leading-tight">
                        {product.name}
                      </h2>
                      {product.headline && (
                        <p className="text-base text-accent font-semibold mb-5 leading-snug">
                          {product.headline}
                        </p>
                      )}
                      {product.body && (
                        <div
                          className="rich-html text-slate-600 text-sm leading-relaxed mb-7"
                          dangerouslySetInnerHTML={{ __html: product.body }}
                        />
                      )}

                      {/* FEATURES — clean vertical bullet list */}
                      {features.length > 0 && (
                        <motion.ul
                          variants={stagger}
                          className="flex flex-col gap-2.5 mb-7"
                        >
                          {features.map((feat, i) => (
                            <motion.li
                              key={i}
                              variants={fadeUp}
                              className="flex items-start gap-3"
                            >
                              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              <span className="text-sm text-slate-700 leading-snug">
                                {feat}
                              </span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}

                      {/* CERT BADGES */}
                      {product.certs.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-7">
                          {product.certs.map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTAs */}
                      <div className="flex flex-wrap gap-3 pt-1">
                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 transition-colors"
                          data-testid={`product-cta-detail-${product.slug}`}
                        >
                          {t("products.viewDetails") as string}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                          href="/contact"
                          className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
                          data-testid={`product-cta-oem-${product.slug}`}
                        >
                          {t("products.oemInquiry") as string}
                        </Link>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* BOTTOM CTA */}
      <section className="py-24 bg-[#0F172A] text-white text-center">
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
    </>
  );
}

export default function Products() {
  return (
    <Layout>
      <ProductsContent />
    </Layout>
  );
}
