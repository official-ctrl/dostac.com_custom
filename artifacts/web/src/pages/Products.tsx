import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  Leaf,
  Package,
  Star,
  Globe,
  Shield,
  Droplets,
  ArrowRight,
  Loader2,
  FlaskConical,
  Sparkles,
  Tag,
} from "lucide-react";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang } from "@/components/dostac/i18n";
import { useListPublicProducts } from "@workspace/api-client-react";

const FEATURE_ICONS = [
  CheckCircle2,
  Leaf,
  Shield,
  Globe,
  Package,
  Star,
  Droplets,
  FlaskConical,
  Sparkles,
  Tag,
];

function ProductsContent() {
  const { t } = useT();
  const { lang } = useLang();
  const productsQuery = useListPublicProducts({ lang });
  const products = productsQuery.data ?? [];
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    if (products.length === 0) return;
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
  }, [products]);

  const scrollTo = (slug: string) => {
    const el = document.getElementById(`product-${slug}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* HERO */}
      <section className="relative w-full min-h-[480px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={dostacImage("hero-products.webp")}
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/65 via-primary/55 to-primary/72" />
        </div>
        <div className="container relative z-10 mx-auto px-6 py-28 text-center text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60 font-semibold mb-5">
            {t("products.heroLabel") as string}
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
            {t("products.heroTitle") as string}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            {t("products.heroSub") as string}
          </p>
        </div>
      </section>

      {/* STICKY SUBMENU */}
      {products.length > 0 && (
        <div className="sticky top-20 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-6">
            <nav
              className="flex overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => scrollTo(p.slug)}
                  className={`relative flex-shrink-0 px-5 py-4 text-sm font-semibold transition-colors whitespace-nowrap focus:outline-none ${
                    activeSlug === p.slug
                      ? "text-accent"
                      : "text-slate-500 hover:text-primary"
                  }`}
                >
                  {p.name}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300 ${
                      activeSlug === p.slug ? "bg-accent" : "bg-transparent"
                    }`}
                  />
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* PRODUCT SECTIONS */}
      <div>
        {productsQuery.isLoading ? (
          <div className="py-32 flex justify-center bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-32 text-center text-muted-foreground container mx-auto px-6 bg-white">
            No products yet.
          </div>
        ) : (
          products.map((product, index) => {
            const fallbackImg = dostacImage(
              `product-${String((index % 10) + 1).padStart(2, "0")}.webp`,
            );
            const isOdd = index % 2 !== 0;
            const features = product.features.slice(0, 4);

            return (
              <article
                key={product.id}
                id={`product-${product.slug}`}
                data-slug={product.slug}
                ref={(el) => {
                  if (el) sectionRefs.current.set(product.slug, el);
                  else sectionRefs.current.delete(product.slug);
                }}
                className={`scroll-mt-36 py-24 ${isOdd ? "bg-slate-50" : "bg-white"}`}
              >
                <div className="container mx-auto px-6">
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`}
                  >
                    {/* CONTENT — always first on mobile, order flips on desktop for odd items */}
                    <div className={isOdd ? "lg:order-2" : ""}>
                      {product.valueProp && (
                        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-4">
                          {product.valueProp}
                        </p>
                      )}
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">
                        {product.name}
                      </h2>
                      {product.headline && (
                        <p className="text-lg text-accent font-medium mb-5">
                          {product.headline}
                        </p>
                      )}
                      {product.body && (
                        <div
                          className="rich-html text-muted-foreground text-base leading-relaxed mb-8"
                          dangerouslySetInnerHTML={{ __html: product.body }}
                        />
                      )}

                      {/* FEATURE CARDS — 2×2 grid */}
                      {features.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mb-8">
                          {features.map((feat, i) => {
                            const Icon =
                              FEATURE_ICONS[i % FEATURE_ICONS.length];
                            return (
                              <div
                                key={i}
                                className={`flex items-start gap-3 p-4 rounded-xl border hover:border-accent/40 hover:shadow-sm transition-all duration-200 ${
                                  isOdd
                                    ? "bg-white border-slate-200"
                                    : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <Icon className="w-4 h-4 text-accent" />
                                </div>
                                <span className="text-sm font-medium text-primary leading-snug">
                                  {feat}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* CERT BADGES */}
                      {product.certs.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
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
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href="/contact"
                          className="inline-flex h-11 items-center justify-center rounded-sm bg-accent px-6 text-sm font-medium text-white shadow hover:bg-accent/90 transition-colors"
                          data-testid={`product-cta-oem-${product.slug}`}
                        >
                          {t("products.oemInquiry") as string}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                          href="/contact"
                          className="inline-flex h-11 items-center justify-center rounded-sm border border-slate-300 bg-white px-6 text-sm font-medium text-primary hover:bg-slate-50 transition-colors"
                          data-testid={`product-cta-contact-${product.slug}`}
                        >
                          {t("products.contactUs") as string}
                        </Link>
                      </div>
                    </div>

                    {/* IMAGE */}
                    <div
                      className={`relative rounded-2xl overflow-hidden shadow-lg ${isOdd ? "lg:order-1" : ""}`}
                    >
                      <img
                        src={product.imageUrl ?? fallbackImg}
                        alt={product.name}
                        className="w-full aspect-[4/3] object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* BOTTOM CTA */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="container mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold mb-4">
            {t("products.heroLabel") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto leading-tight">
            {t("products.bottomCtaHeading") as string}
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            {t("products.bottomCtaBody") as string}
          </p>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-sm bg-accent px-8 text-base font-medium text-white shadow hover:bg-accent/90 transition-colors"
          >
            {t("products.bottomCtaButton") as string}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
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
