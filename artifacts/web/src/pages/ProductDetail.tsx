import { Link, useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Award,
  Copy,
  Check,
} from "lucide-react";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang } from "@/components/dostac/i18n";
import {
  useGetPublicProduct,
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
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const { t } = useT();
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const { data: product, isLoading, isError } = useGetPublicProduct(slug, { lang });
  const { data: allProducts } = useListPublicProducts({ lang });

  const related = (allProducts ?? [])
    .filter((p) => p.slug !== slug && (product ? p.category === product.category : true))
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !product) {
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

  const fallbackImg = dostacImage("hero-products.webp");

  return (
    <>
      {/* HERO */}
      <section className="relative w-full min-h-[480px] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={product.imageUrl ?? fallbackImg}
            alt={product.name}
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
              {product.category && (
                <>
                  <span className="text-white/30">/</span>
                  <span className="text-white/60">{product.category}</span>
                </>
              )}
            </div>
            <button
              onClick={handleCopy}
              aria-label={copied ? (t("products.copied") as string) : (t("products.copyLink") as string)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/20 hover:text-white transition-all"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span aria-live="polite">
                {copied ? (t("products.copied") as string) : (t("products.copyLink") as string)}
              </span>
            </button>
          </nav>

          {product.category && (
            <span className="inline-flex items-center rounded-full bg-white/15 backdrop-blur border border-white/20 px-3 py-1 text-xs font-semibold text-white mb-5">
              {product.category}
            </span>
          )}

          {product.valueProp && (
            <p className="text-xs uppercase tracking-[0.35em] text-accent font-semibold mb-4">
              {product.valueProp}
            </p>
          )}

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl mb-4">
            {product.name}
          </h1>

          {product.headline && (
            <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
              {product.headline}
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
                  src={product.imageUrl ?? fallbackImg}
                  alt={product.name}
                  className="w-full aspect-[4/3] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
              </div>

              {/* CERT BADGES */}
              {product.certs.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-4 w-4 text-accent" />
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500">
                      {t("products.certsLabel") as string}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.certs.map((c, i) => (
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
                  href="/contact"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 transition-colors"
                >
                  {t("products.oemInquiry") as string}
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
                >
                  {t("products.contactUs") as string}
                </Link>
              </div>
            </motion.div>

            {/* RIGHT — BODY + FEATURES */}
            <motion.div variants={fadeUp} className="lg:col-span-3">
              {/* Rich body */}
              {product.body && (
                <div
                  className="rich-html text-slate-600 text-base leading-relaxed mb-10 pb-10 border-b border-slate-100"
                  dangerouslySetInnerHTML={{ __html: product.body }}
                />
              )}

              {/* FEATURES */}
              {product.features.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] font-semibold text-accent mb-5">
                    {t("products.featuresLabel") as string}
                  </p>
                  <motion.ul variants={stagger} className="flex flex-col gap-3">
                    {product.features.map((feat, i) => (
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
                            {item.category}
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
    </>
  );
}

export default function ProductDetail() {
  return (
    <Layout>
      <ProductDetailContent />
    </Layout>
  );
}
