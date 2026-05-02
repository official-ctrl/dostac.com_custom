import React from "react";
import { ArrowRight, CheckCircle2, Globe, ShieldCheck, Factory } from "lucide-react";
import { Layout } from "./_shared/Layout";
import { Button } from "@/components/ui/button";

export function Home() {
  const products = [
    { id: 1, name: "Pore Strips", tagline: "Advanced Blackhead & Sebum Control Solutions", image: "/__mockup/images/dostac/product-01.png" },
    { id: 2, name: "Micro Needle Patches", tagline: "Next-Generation Dissolvable Skincare Delivery", image: "/__mockup/images/dostac/product-02.png" },
    { id: 3, name: "Lip & Eye Remover Tissues", tagline: "Gentle & Effective Makeup Removal On-the-Go", image: "/__mockup/images/dostac/product-03.png" },
    { id: 4, name: "Spot Patches", tagline: "Targeted Blemish & Acne Care", image: "/__mockup/images/dostac/product-04.png" },
    { id: 5, name: "Fruit Pads", tagline: "Fun, Soothing & Revitalizing Point Care", image: "/__mockup/images/dostac/product-05.png" },
    { id: 6, name: "Oil Control Films", tagline: "Instant Shine Removal & Premium Sebum Absorption", image: "/__mockup/images/dostac/product-06.png" },
    { id: 7, name: "Oral Cleansing Tissues", tagline: "Safe & Hygienic Infant Oral Care", image: "/__mockup/images/dostac/product-07.png" },
    { id: 8, name: "Baby Wet Wipes", tagline: "Ultra-Gentle Cleansing for Delicate Skin", image: "/__mockup/images/dostac/product-08.png" },
    { id: 9, name: "Feminine Cleansing Tissues", tagline: "Daily Freshness & Intimate Care", image: "/__mockup/images/dostac/product-09.png" },
    { id: 10, name: "Deodorant Cooling Tissues", tagline: "Instant Refreshment & Sweat Relief", image: "/__mockup/images/dostac/product-10.png" }
  ];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative w-full h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-home.png" alt="High-end cosmetic manufacturing laboratory" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 hero-overlay"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-white">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6">
              Your Premier OEM/ODM Partner for Beauty & Health Innovation
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl">
              Transforming your brand's vision into market-ready bestsellers. DIO STAC Co., Ltd. (dostac) leverages a highly advanced manufacturing network to deliver customized, uncompromising quality for global markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/__mockup/preview/dostac/Products" className="inline-flex h-12 items-center justify-center rounded-sm bg-accent px-8 text-base font-medium text-white shadow hover:bg-accent/90 transition-colors">
                Explore Products
              </a>
              <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-12 items-center justify-center rounded-sm border border-white/30 bg-white/10 backdrop-blur-sm px-8 text-base font-medium text-white hover:bg-white/20 transition-colors">
                Request a Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CORE STRENGTHS */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 border shadow-sm rounded-xl hover:-translate-y-1 transition-transform duration-300">
              <Globe className="h-10 w-10 text-accent mb-6" />
              <h3 className="font-display text-xl font-bold text-primary mb-4">Agile Manufacturing Excellence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access a highly optimized, global-standard production network built for scalability.
              </p>
            </div>
            <div className="bg-white p-10 border shadow-sm rounded-xl hover:-translate-y-1 transition-transform duration-300">
              <ShieldCheck className="h-10 w-10 text-accent mb-6" />
              <h3 className="font-display text-xl font-bold text-primary mb-4">Uncompromising Quality Control</h3>
              <p className="text-muted-foreground leading-relaxed">
                Rigorous testing and compliance ensure every product meets premium global standards.
              </p>
            </div>
            <div className="bg-white p-10 border shadow-sm rounded-xl hover:-translate-y-1 transition-transform duration-300">
              <Factory className="h-10 w-10 text-accent mb-6" />
              <h3 className="font-display text-xl font-bold text-primary mb-4">Customized Development</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tailored formulations and packaging solutions designed specifically for your brand's success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-primary-foreground/20">
            <div className="py-4">
              <div className="font-display text-5xl font-bold text-white mb-2">10+</div>
              <div className="text-primary-foreground/80 font-medium">Product Categories</div>
            </div>
            <div className="py-4">
              <div className="font-display text-5xl font-bold text-white mb-2">Global</div>
              <div className="text-primary-foreground/80 font-medium">Standard Compliance</div>
            </div>
            <div className="py-4">
              <div className="font-display text-5xl font-bold text-white mb-2">360°</div>
              <div className="text-primary-foreground/80 font-medium">OEM/ODM Solutions</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">Featured Solutions</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">High-performance formulations tailored for your brand.</p>
            </div>
            <a href="/__mockup/preview/dostac/Products" className="hidden md:inline-flex items-center text-accent font-medium hover:text-primary transition-colors">
              View All Products <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map(product => (
              <a key={product.id} href="/__mockup/preview/dostac/Products" className="group block group">
                <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden mb-4 border">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h4 className="font-display font-semibold text-lg text-primary mb-1 group-hover:text-accent transition-colors">{product.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.tagline}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-20 bg-muted/50 border-t">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">Ready to elevate your brand?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Contact our global business team today. Provide us with your project details, and our experts will guide you through customized formulations, pricing, and rapid sample development.
          </p>
          <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-14 items-center justify-center rounded-sm bg-primary px-10 text-base font-medium text-white shadow hover:bg-primary/90 transition-colors">
            Contact Global Sales <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </Layout>
  );
}
