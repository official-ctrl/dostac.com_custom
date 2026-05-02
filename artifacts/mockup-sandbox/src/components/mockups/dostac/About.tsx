import React from "react";
import { ArrowRight, CheckCircle, Shield, Award, Lightbulb } from "lucide-react";
import { Layout } from "./_shared/Layout";

export function About() {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-about.png" alt="Corporate Headquarters" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bright-overlay"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
            About DOSTAC
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            A Legacy of Sustainable Growth and Global Partnership.
          </p>
        </div>
      </section>

      {/* GREETINGS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-primary mb-8">Welcome to DIO STAC Co., Ltd.</h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>
                  In a rapidly evolving global beauty and healthcare market, brands require more than just a supplier—they need a dedicated partner. At dostac, we pride ourselves on turning visionary ideas into tangible, high-quality products that resonate with consumers worldwide.
                </p>
                <p>
                  Since our inception, we have built a reputation on uncompromising quality, innovative problem-solving, and transparent collaboration. By unifying an advanced manufacturing network with specialized R&D expertise, we deliver a seamless OEM/ODM experience from concept to final delivery.
                </p>
                <p>
                  We invite you to explore a partnership built on trust, excellence, and mutual growth. Together, let us shape the future of health and beauty.
                </p>
              </div>
              <div className="mt-10 pt-8 border-t border-border">
                <p className="font-display font-bold text-xl text-primary">DIO STAC Co., Ltd. — Management</p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square md:aspect-[4/3] rounded-xl overflow-hidden shadow-xl border">
                <img src="/__mockup/images/dostac/ceo-portrait.png" alt="Executive Desk" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-8 shadow-lg border rounded-lg max-w-xs hidden md:block">
                <p className="font-display font-semibold text-primary italic">"Turning visionary ideas into tangible, high-quality products."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW & PROCESS FLOW */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-primary mb-6">Comprehensive OEM/ODM Solutions</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              dostac operates at the forefront of global product development. Rather than relying on rigid, traditional manufacturing limitations, we orchestrate a robust and flexible manufacturing network. This allows us to pair your specific project requirements with the most advanced and appropriate production facilities available. Our streamlined process covers conceptualization, formula development, rigorous quality assurance, packaging design, and final production. This agile approach guarantees optimal quality, faster time-to-market, and highly scalable solutions for brands of all sizes.
            </p>
          </div>

          <div className="relative mt-16 max-w-5xl mx-auto">
            {/* Horizontal connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              {[
                { step: "01", title: "Concept" },
                { step: "02", title: "Formula Development" },
                { step: "03", title: "Quality Assurance" },
                { step: "04", title: "Packaging Design" },
                { step: "05", title: "Production" },
                { step: "06", title: "Delivery" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-accent flex items-center justify-center mb-4 shadow-sm relative">
                    <span className="font-display font-bold text-accent text-xl">{item.step}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-primary max-w-[120px]">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold mb-16">Our Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm text-left">
              <Shield className="w-12 h-12 text-accent mb-6" />
              <h3 className="font-display text-2xl font-bold mb-4 text-white">TRUST</h3>
              <p className="text-white/80 leading-relaxed">
                Building long-term, transparent relationships with global partners through reliable communication and honest business practices.
              </p>
            </div>
            <div className="p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm text-left">
              <Award className="w-12 h-12 text-accent mb-6" />
              <h3 className="font-display text-2xl font-bold mb-4 text-white">QUALITY</h3>
              <p className="text-white/80 leading-relaxed">
                Maintaining zero compromises on safety, efficacy, and global compliance, ensuring absolute satisfaction for the end consumer.
              </p>
            </div>
            <div className="p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm text-left">
              <Lightbulb className="w-12 h-12 text-accent mb-6" />
              <h3 className="font-display text-2xl font-bold mb-4 text-white">INNOVATION</h3>
              <p className="text-white/80 leading-relaxed">
                Continuously exploring new formulations, formats, and network synergies to keep our partners ahead of market trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HISTORY TIMELINE */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-primary mb-6">A Legacy of Sustainable Growth</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From our early specialization in targeted skincare solutions to our current expansive portfolio covering comprehensive daily hygiene products, dostac has consistently evolved to meet global market demand.
            </p>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {[
              { year: "2015", title: "Company Founded", desc: "Established in Seoul, Korea with a focus on premium OEM/ODM solutions." },
              { year: "2017", title: "First Skincare Line Launched", desc: "Successfully delivered advanced Pore Strips and Spot Patches to international buyers." },
              { year: "2019", title: "ISO 9001 & ISO 22716 Certification", desc: "Achieved global manufacturing standard certifications for quality management." },
              { year: "2021", title: "Expansion into Hygiene Category", desc: "Expanded capabilities to include Baby Wet Wipes and Feminine Cleansing Tissues." },
              { year: "2023", title: "Global Partnerships Formed", desc: "Strategic alliances with top-tier beauty brands across Europe and North America." },
              { year: "2026", title: "Advanced Manufacturing Network", desc: "Full orchestration of global R&D and manufacturing facilities." }
            ].map((item, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-accent text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border bg-card shadow-sm">
                  <span className="font-display font-bold text-accent text-xl mb-1 block">{item.year}</span>
                  <h4 className="font-semibold text-primary mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
