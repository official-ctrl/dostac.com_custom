import React from "react";
import { Layout } from "./_shared/Layout";
import { ArrowRight, Check } from "lucide-react";

export function Products() {
  const products = [
    {
      id: "01",
      name: "Pore Strips",
      headline: "Advanced Blackhead & Sebum Control Solutions",
      copy: "Maximize your skincare portfolio with our highly effective Nose Pore Strips. Formulated to powerfully adhere to clogged pores, these strips effortlessly extract excess sebum, impurities, and stubborn blackheads from the T-zone, leaving skin instantly smoother and clearer. With high customizability, we offer versatile product lines to fit any brand concept.",
      points: [
        "Diverse Formats: Classic White, Sebum-absorbing Charcoal, Fun Printed Designs, and Animal patterns.",
        "Specialized Variations: Natural ingredients (Aloe, Tea Tree), Oversized strips for wider coverage, and structured 3-Step Kits.",
        "Premium Options: Vegan-certified formulas and innovative transparent Crystal Nose Strips."
      ],
      image: "/__mockup/images/dostac/product-01.png"
    },
    {
      id: "02",
      name: "Micro Needle Patches",
      headline: "Next-Generation Dissolvable Skincare Delivery",
      copy: "Offer your customers professional-grade care at home. Our Micro Needle Patches are engineered with ultra-fine, dissolvable needles crafted from Hyaluronic Acid. This advanced delivery system penetrates the stratum corneum, channeling active ingredients directly into the skin for superior moisturizing, anti-aging, and targeted blemish control.",
      points: [
        "Painless Delivery: Micro-sized needles guarantee maximum efficacy with virtually no discomfort.",
        "Targeted Applications: Custom shapes for Lip & Eye lines, Under-eye puffiness, Forehead, and Spot care.",
        "Anti-Acne Solution: Specialized patches infused with Salicylic Acid 0.1% for rapid blemish and sebum control."
      ],
      image: "/__mockup/images/dostac/product-02.png"
    },
    {
      id: "03",
      name: "Lip & Eye Remover Tissues",
      headline: "Gentle & Effective Makeup Removal On-the-Go",
      copy: "Deliver ultimate convenience without compromising skin health. Our Lip & Eye Remover Tissues are soaked in a specialized, mild cleansing formula designed to effortlessly dissolve stubborn point makeup, including waterproof mascara and long-lasting lipsticks. Crafted for the delicate eye and lip areas, they ensure a thorough, irritation-free cleanse.",
      points: [
        "High Cleansing Power: Instantly melts away heavy and waterproof makeup.",
        "Mild & Safe: Formulated to minimize irritation on highly sensitive facial zones.",
        "Travel-Friendly: Compact packaging ideal for busy lifestyles and travel cosmetic kits."
      ],
      image: "/__mockup/images/dostac/product-03.png"
    },
    {
      id: "04",
      name: "Spot Patches",
      headline: "Targeted Blemish & Acne Care",
      copy: "Provide an invisible shield for troubled skin. Our Spot Patches are transparent, highly adhesive covers infused with proven anti-acne agents like Salicylic Acid (0.1%) and Tea Tree Oil. They continuously deliver soothing ingredients to the targeted area while protecting the blemish from external irritants.",
      points: [
        "Active Ingredients: Formulated with trusted acne-fighting agents for rapid soothing.",
        "Invisible Protection: Ultra-thin, transparent design blends seamlessly with natural skin tones.",
        "Strong Adhesion: Stays securely in place all day to ensure continuous care."
      ],
      image: "/__mockup/images/dostac/product-04.png"
    },
    {
      id: "05",
      name: "Fruit Pads",
      headline: "Fun, Soothing & Revitalizing Point Care",
      copy: "Combine playful design with serious skincare. Our Fruit Pads are unique, essence-infused point masks printed and shaped like vibrant fruits. Designed to deliver instant cooling, relaxing, and moisturizing benefits to specific areas of the face or body, they offer a highly engaging consumer experience.",
      points: [
        "Various Concepts: Available in Cucumber, Orange, Kiwi, Watermelon, Aloe, and Lemon themes.",
        "Multi-functional: Provides soothing, revitalizing, and hydrating solutions.",
        "Flexible Packaging: Can be packed in 2-sheet pouches, zipper bags, or 24/36-sheet jars."
      ],
      image: "/__mockup/images/dostac/product-05.png"
    },
    {
      id: "06",
      name: "Oil Control Films",
      headline: "Instant Shine Removal & Premium Sebum Absorption",
      copy: "Keep skin flawlessly matte all day long. Manufactured using advanced specialized films, our Oil Control Films offer absorption capabilities far superior to standard blotting papers. With a gentle press, they instantly eliminate excess oil and unwanted shine without smudging makeup.",
      points: [
        "Superior Absorption: Traps oil instantly, leaving skin fresh and clean.",
        "Makeup-Friendly: Removes sebum exclusively without ruining cosmetic applications.",
        "Ultra-Compact: Sleek, pocket-sized packaging (60 sheets/pack) for ultimate portability."
      ],
      image: "/__mockup/images/dostac/product-06.png"
    },
    {
      id: "07",
      name: "Oral Cleansing Tissues",
      headline: "Safe & Hygienic Infant Oral Care",
      copy: "Ensure safe dental hygiene for the little ones. Our Oral Cleansing Tissues are specifically designed for infants and toddlers (ages 0-3). Made from premium nonwoven fabric infused with a gentle oral cleanser, they offer an easier and more hygienic alternative to traditional finger-type brushes.",
      points: [
        "Infant Safe: Formulated perfectly for babies unable to brush independently.",
        "Strict Sterilization: Both fabric and finished products undergo rigorous sterilization.",
        "Individually Packed: Sealed individually for maximum safety and on-the-go convenience."
      ],
      image: "/__mockup/images/dostac/product-07.png"
    },
    {
      id: "08",
      name: "Baby Wet Wipes",
      headline: "Ultra-Gentle Cleansing for Delicate Skin",
      copy: "Provide parents with peace of mind. Our alcohol-free, hypoallergenic Baby Wet Wipes are formulated using a meticulous 7-step water purification process. Enriched with skin-loving ingredients like Aloe and Vitamin E, they cleanse gently while maintaining essential moisture for delicate baby skin.",
      points: [
        "Ultimate Purity: Crafted with 7-step purified water and zero harsh chemicals.",
        "Nourishing Formula: Infused with Aloe and Vitamin E for soothing hydration.",
        "Extensive Fabric Customization: Choose from Spunlace (40g-70g), Embossed, Biodegradable (100% Rayon), 100% Cotton, or Airlaid Pulp."
      ],
      image: "/__mockup/images/dostac/product-08.png"
    },
    {
      id: "09",
      name: "Feminine Cleansing Tissues",
      headline: "Daily Freshness & Intimate Care",
      copy: "Empower consumers with confidence and comfort wherever they go. Our Feminine Cleansing Tissues are developed with a pH-balanced, gentle formula tailored for sensitive intimate areas. Perfect for daily hygiene, they deliver instant freshness and odor control in a discreet, highly portable format.",
      points: [
        "pH-Balanced: Respects and protects natural sensitive skin barriers.",
        "Instant Refreshment: Effectively cleanses and neutralizes odors on the go.",
        "Discreet & Portable: Convenient packaging designed for handbags and travel."
      ],
      image: "/__mockup/images/dostac/product-09.png"
    },
    {
      id: "10",
      name: "Deodorant Cooling Tissues",
      headline: "Instant Refreshment & Sweat Relief",
      copy: "The ultimate solution for an active lifestyle. Our Deodorant Cooling Tissues act as a portable shower, instantly wiping away sweat, odor, and sticky discomfort. Formulated with a cooling agent, they leave the body feeling revitalized, clean, and exceptionally fresh.",
      points: [
        "Cooling Sensation: Lowers skin temperature instantly for immediate relief.",
        "Odor & Sweat Control: Removes stickiness and neutralizes body odor effectively.",
        "Active Lifestyle Ready: Ideal for sports, outdoor activities, travel, and summer product lines."
      ],
      image: "/__mockup/images/dostac/product-10.png"
    }
  ];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-products.png" alt="Cosmetic textures" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bright-overlay"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
            High-Performance Solutions Tailored for Your Brand
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Explore our extensive OEM/ODM portfolio spanning specialized skincare to premium daily hygiene.
          </p>
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
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
                  <h4 className="font-display font-semibold text-primary mb-4">Key Selling Points</h4>
                  <ul className="space-y-3">
                    {product.points.map((point, i) => {
                      const [title, ...rest] = point.split(':');
                      return (
                        <li key={i} className="flex gap-3">
                          <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">
                            {rest.length > 0 ? (
                              <><strong className="text-primary font-semibold">{title}:</strong>{rest.join(':')}</>
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
                    Request Sample
                  </a>
                  <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-12 items-center justify-center rounded-sm border border-input bg-transparent px-8 text-sm font-medium shadow-sm hover:bg-muted transition-colors">
                    Inquire Details
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
          <h2 className="font-display text-3xl font-bold text-primary mb-6">Don't see exactly what you need?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Our R&D network specializes in custom formulations and bespoke packaging solutions. Let's discuss your unique project requirements.
          </p>
          <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-14 items-center justify-center rounded-sm bg-accent px-10 text-base font-medium text-white shadow hover:bg-accent/90 transition-colors">
            Start Custom Development
          </a>
        </div>
      </section>
    </Layout>
  );
}
