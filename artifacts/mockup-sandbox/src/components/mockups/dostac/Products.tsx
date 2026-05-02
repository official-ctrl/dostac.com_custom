import React from "react";
import { Layout } from "./_shared/Layout";
import { Check } from "lucide-react";
import { useT } from "./_shared/i18n";

function ProductsContent() {
  const { t } = useT();
  const products = t("products.items") as Array<{
    id: string; name: string; headline: string; copy: string; points: string[];
  }>;
  const productImages = [
    "/__mockup/images/dostac/product-01.png", "/__mockup/images/dostac/product-02.png",
    "/__mockup/images/dostac/product-03.png", "/__mockup/images/dostac/product-04.png",
    "/__mockup/images/dostac/product-05.png", "/__mockup/images/dostac/product-06.png",
    "/__mockup/images/dostac/product-07.png", "/__mockup/images/dostac/product-08.png",
    "/__mockup/images/dostac/product-09.png", "/__mockup/images/dostac/product-10.png",
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-products.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">{t("products.heroTitle")}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">{t("products.heroSub")}</p>
        </div>
      </section>

      {/* PRODUCT NAVIGATION */}
      <section className="sticky top-20 z-40 bg-white border-b shadow-sm overflow-x-auto no-scrollbar">
        <div className="container mx-auto px-6 py-4 flex gap-3 min-w-max">
          {products.map(p => (
            <a key={p.id} href={`#product-${p.id}`} className="px-4 py-2 rounded-full bg-muted text-sm font-medium text-muted-foreground hover:bg-accent hover:text-white transition-colors whitespace-nowrap">
              {p.name}
            </a>
          ))}
        </div>
      </section>

      {/* PRODUCTS CATALOG */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {products.map((product, index) => (
            <div key={product.id} id={`product-${product.id}`} className={`py-20 flex flex-col gap-12 ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} border-b border-border last:border-0 items-center`}>

              <div className="w-full md:w-1/2">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border bg-muted/20">
                  <img src={productImages[index]} alt={product.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-display text-4xl font-bold text-accent/30">{product.id}</span>
                  <h2 className="font-display text-3xl font-bold text-primary">{product.name}</h2>
                </div>

                <h3 className="text-xl font-semibold text-accent mb-6">{product.headline}</h3>
                <p className="text-muted-foreground leading-relaxed mb-8">{product.copy}</p>

                <div className="bg-muted/30 rounded-xl p-6 mb-8 border border-border/50">
                  <h4 className="font-display font-semibold text-primary mb-4">{t("products.keyPoints")}</h4>
                  <ul className="space-y-3">
                    {product.points.map((point, i) => {
                      const colonIdx = point.indexOf(":");
                      const hasTitle = colonIdx > 0;
                      const title = hasTitle ? point.slice(0, colonIdx) : "";
                      const rest = hasTitle ? point.slice(colonIdx + 1) : point;
                      return (
                        <li key={i} className="flex gap-3">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">
                            {hasTitle ? (
                              <><strong className="text-primary font-semibold">{title}:</strong>{rest}</>
                            ) : (
                              point
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex gap-4">
                  <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-12 items-center justify-center rounded-sm bg-primary px-8 text-sm font-medium text-white shadow hover:bg-primary/90 transition-colors">
                    {t("products.requestSample")}
                  </a>
                  <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-12 items-center justify-center rounded-sm border border-input bg-transparent px-8 text-sm font-medium shadow-sm hover:bg-muted transition-colors">
                    {t("products.inquireDetails")}
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 bg-muted/50 border-t text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-primary mb-6">{t("products.bottomCtaHeading")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">{t("products.bottomCtaBody")}</p>
          <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-14 items-center justify-center rounded-sm bg-accent px-10 text-base font-medium text-white shadow hover:bg-accent/90 transition-colors">
            {t("products.bottomCtaButton")}
          </a>
        </div>
      </section>
    </>
  );
}

export function Products() {
  return (
    <Layout>
      <ProductsContent />
    </Layout>
  );
}
