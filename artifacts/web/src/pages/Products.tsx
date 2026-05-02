import React from "react";
import { Link } from "wouter";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang } from "@/components/dostac/i18n";
import { useListPublicProducts } from "@workspace/api-client-react";

function ProductsContent() {
  const { t } = useT();
  const { lang } = useLang();
  const productsQuery = useListPublicProducts({ lang });
  const products = productsQuery.data ?? [];

  return (
    <>
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={dostacImage("hero-products.png")} alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">{t("products.heroTitle") as string}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">{t("products.heroSub") as string}</p>
        </div>
      </section>

      {/* PRODUCT NAVIGATION */}
      {products.length > 0 && (
        <section className="sticky top-20 z-40 bg-white border-b shadow-sm overflow-x-auto no-scrollbar">
          <div className="container mx-auto px-6 py-4 flex gap-3 min-w-max">
            {products.map((p) => (
              <a key={p.id} href={`#product-${p.slug}`} className="px-4 py-2 rounded-full bg-muted text-sm font-medium text-muted-foreground hover:bg-accent hover:text-white transition-colors whitespace-nowrap">
                {p.name}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="container mx-auto px-6">
          {productsQuery.isLoading ? (
            <div className="py-32 text-center text-muted-foreground">Loading…</div>
          ) : products.length === 0 ? (
            <div className="py-32 text-center text-muted-foreground">No products yet.</div>
          ) : (
            products.map((product, index) => {
              const fallbackImg = dostacImage(`product-${String((index % 10) + 1).padStart(2, "0")}.png`);
              return (
                <div
                  key={product.id}
                  id={`product-${product.slug}`}
                  className={`py-20 flex flex-col gap-12 ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} border-b border-border last:border-0 items-center`}
                >
                  <div className="w-full md:w-1/2">
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border bg-muted/20">
                      <img src={product.imageUrl ?? fallbackImg} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="w-full md:w-1/2">
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="font-display text-4xl font-bold text-accent/30">{String(index + 1).padStart(2, "0")}</span>
                      <h2 className="font-display text-3xl font-bold text-primary">{product.name}</h2>
                    </div>

                    {product.headline && <h3 className="text-xl font-semibold text-accent mb-6">{product.headline}</h3>}

                    {product.body && (
                      <div
                        className="rich-html text-muted-foreground leading-relaxed mb-8"
                        dangerouslySetInnerHTML={{ __html: product.body }}
                      />
                    )}

                    <div className="flex gap-4">
                      <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-sm bg-primary px-8 text-sm font-medium text-white shadow hover:bg-primary/90 transition-colors">
                        {t("products.requestSample") as string}
                      </Link>
                      <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-sm border border-input bg-transparent px-8 text-sm font-medium shadow-sm hover:bg-muted transition-colors">
                        {t("products.inquireDetails") as string}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="py-20 bg-muted/50 border-t text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-primary mb-6">{t("products.bottomCtaHeading") as string}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">{t("products.bottomCtaBody") as string}</p>
          <Link href="/contact" className="inline-flex h-14 items-center justify-center rounded-sm bg-accent px-10 text-base font-medium text-white shadow hover:bg-accent/90 transition-colors">
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
