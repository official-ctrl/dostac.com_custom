import { Link } from "wouter";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang } from "@/components/dostac/i18n";
import { useListPublicProducts } from "@workspace/api-client-react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

function ProductsContent() {
  const { t } = useT();
  const { lang } = useLang();
  const productsQuery = useListPublicProducts({ lang });
  const products = productsQuery.data ?? [];

  return (
    <>
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={dostacImage("hero-products.webp")}
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
            {t("products.heroTitle") as string}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {t("products.heroSub") as string}
          </p>
        </div>
      </section>

      {/* PRODUCT QUICK NAV */}
      {products.length > 0 && (
        <section className="sticky top-20 z-40 bg-white border-b shadow-sm overflow-x-auto no-scrollbar">
          <div className="container mx-auto px-6 py-4 flex gap-3 min-w-max">
            {products.map((p) => (
              <a
                key={p.id}
                href={`#product-${p.slug}`}
                className="px-4 py-2 rounded-full bg-muted text-sm font-medium text-muted-foreground hover:bg-accent hover:text-white transition-colors whitespace-nowrap"
                data-testid={`product-nav-${p.slug}`}
              >
                {p.name}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-6">
          {productsQuery.isLoading ? (
            <div className="py-32 text-center text-muted-foreground">Loading…</div>
          ) : products.length === 0 ? (
            <div className="py-32 text-center text-muted-foreground">No products yet.</div>
          ) : (
            <div className="space-y-10">
              {products.map((product, index) => {
                const fallbackImg = dostacImage(
                  `product-${String((index % 10) + 1).padStart(2, "0")}.webp`,
                );
                return (
                  <article
                    key={product.id}
                    id={`product-${product.slug}`}
                    className="scroll-mt-32 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 bg-white rounded-2xl shadow-sm border border-border overflow-hidden p-6 md:p-10"
                    data-testid={`product-card-${product.slug}`}
                  >
                    {/* LEFT: image */}
                    <div className="md:col-span-5">
                      <div className="aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border/60">
                        <img
                          src={product.imageUrl ?? fallbackImg}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* RIGHT: content */}
                    <div className="md:col-span-7 flex flex-col">
                      {product.valueProp && (
                        <div className="inline-flex items-center gap-2 self-start rounded-full bg-accent/10 px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider text-accent">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {product.valueProp}
                        </div>
                      )}

                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="font-display text-2xl font-bold text-accent/30">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h2
                          className="font-display text-2xl md:text-3xl font-bold text-primary"
                          data-testid={`product-name-${product.slug}`}
                        >
                          {product.name}
                        </h2>
                      </div>

                      {product.headline && (
                        <p className="text-base md:text-lg font-medium text-accent mb-4">
                          {product.headline}
                        </p>
                      )}

                      {product.body && (
                        <div
                          className="rich-html text-sm text-muted-foreground leading-relaxed mb-5"
                          dangerouslySetInnerHTML={{ __html: product.body }}
                        />
                      )}

                      {product.features.length > 0 && (
                        <ul
                          className="space-y-1.5 mb-5"
                          data-testid={`product-features-${product.slug}`}
                        >
                          {product.features.map((f, i) => (
                            <li
                              key={`${product.id}-feat-${i}`}
                              className="flex items-start gap-2 text-sm text-foreground/80"
                            >
                              <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {product.certs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {product.certs.map((c, i) => (
                            <span
                              key={`${product.id}-cert-${i}`}
                              className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                              data-testid={`product-cert-${product.slug}-${i}`}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 mt-auto pt-2">
                        <Link
                          href="/contact"
                          className="inline-flex h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-medium text-white shadow hover:bg-primary/90 transition-colors"
                          data-testid={`product-cta-sample-${product.slug}`}
                        >
                          {t("products.requestSample") as string}
                        </Link>
                        <Link
                          href="/contact"
                          className="inline-flex h-11 items-center justify-center rounded-sm border border-input bg-transparent px-6 text-sm font-medium shadow-sm hover:bg-muted transition-colors"
                          data-testid={`product-cta-inquire-${product.slug}`}
                        >
                          {t("products.inquireDetails") as string}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-muted/50 border-t text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-primary mb-6">
            {t("products.bottomCtaHeading") as string}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            {t("products.bottomCtaBody") as string}
          </p>
          <Link
            href="/contact"
            className="inline-flex h-14 items-center justify-center rounded-sm bg-accent px-10 text-base font-medium text-white shadow hover:bg-accent/90 transition-colors"
          >
            {t("products.bottomCtaButton") as string}
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
