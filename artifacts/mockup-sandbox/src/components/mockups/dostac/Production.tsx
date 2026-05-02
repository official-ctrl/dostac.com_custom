import React from "react";
import { Layout } from "./_shared/Layout";
import { CheckCircle2, ShieldCheck, BadgeCheck, FileText, ArrowRight } from "lucide-react";

export function Production() {
  const certificates = [
    { name: "ISO 9001", body: "International Organization for Standardization", desc: "Quality Management Systems standard ensuring consistent product quality." },
    { name: "ISO 22716 (GMP)", body: "International Organization for Standardization", desc: "Good Manufacturing Practices specifically for Cosmetics." },
    { name: "CGMP", body: "Ministry of Food and Drug Safety", desc: "Current Good Manufacturing Practice for advanced quality control." },
    { name: "FDA Registration", body: "U.S. Food and Drug Administration", desc: "Facility registration for export compliance to the United States." },
    { name: "CPNP", body: "European Commission", desc: "Cosmetic Products Notification Portal registration for EU markets." },
    { name: "Vegan Certification", body: "V-Label / Eve Vegan", desc: "Verification of formulations free from animal-derived ingredients." },
    { name: "Cruelty-Free", body: "Leaping Bunny Program", desc: "Certification confirming no animal testing is conducted." },
    { name: "Halal", body: "Halal Certification Authority", desc: "Compliance with Islamic law regarding ingredients and production." },
    { name: "Korea Cosmetic GMP", body: "KFDA", desc: "Strict domestic guidelines for cosmetic manufacturing excellence." }
  ];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative w-full h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/__mockup/images/dostac/hero-production.png" alt="Automated cosmetic production line" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
            Certified Production Standards You Can Trust
          </h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-xl text-muted-foreground leading-relaxed">
            Quality is the foundation of every OEM/ODM project we deliver. Through our advanced production network, dostac works with manufacturing partners that meet strict quality management and compliance requirements. Relevant certifications and documented quality systems provide our global buyers with confidence in safety, consistency, and export readiness.
          </p>
        </div>
      </section>

      {/* QUALITY ASSURANCE PROCESS */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-center text-primary mb-16">Quality Assurance Process</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "Raw Material Inspection", icon: ShieldCheck, desc: "Rigorous testing of all incoming ingredients for purity and safety." },
              { title: "In-Process Control", icon: Factory, desc: "Continuous monitoring during blending and filling stages." },
              { title: "Final Product Testing", icon: CheckCircle2, desc: "Comprehensive microbiological and physical stability tests." },
              { title: "Export Documentation", icon: FileText, desc: "Complete regulatory compliance and certification processing." }
            ].map((step, idx) => (
              <div key={idx} className="relative bg-white p-8 rounded-xl border shadow-sm flex flex-col items-center text-center">
                {idx < 3 && <ArrowRight className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-muted-foreground w-8 h-8 z-10" />}
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-accent" />
                </div>
                <div className="font-display font-bold text-lg text-primary mb-3">
                  Step {idx + 1}: <br/>{step.title}
                </div>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATES GRID */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-primary mb-4">Global Certifications & Compliance</h2>
            <p className="text-muted-foreground text-lg">Meeting the highest international standards for manufacturing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, idx) => (
              <div key={idx} className="flex gap-4 p-6 border rounded-xl hover:border-accent hover:shadow-md transition-all duration-300">
                <div className="shrink-0 w-16 h-16 rounded bg-muted/50 border flex items-center justify-center">
                  <BadgeCheck className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-primary mb-1">{cert.name}</h4>
                  <p className="text-xs font-semibold text-accent mb-2">{cert.body}</p>
                  <p className="text-sm text-muted-foreground">{cert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-3xl font-bold mb-6">Need specific regulatory documents?</h2>
          <a href="/__mockup/preview/dostac/Contact" className="inline-flex h-12 items-center justify-center rounded-sm bg-accent px-8 text-base font-medium text-white shadow hover:bg-accent/90 transition-colors">
            Contact Our Compliance Team
          </a>
        </div>
      </section>
    </Layout>
  );
}

// Inline icon component since factory was missing in imports
function Factory(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </svg>
  )
}
