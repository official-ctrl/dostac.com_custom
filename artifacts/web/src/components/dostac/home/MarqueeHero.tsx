import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCtaClick } from "@/lib/analytics";

const LINE1 = "DOSTAC · OEM · ODM · PRIVATE LABEL · K-BEAUTY · ";
const LINE2 = "YOUR BRAND · OUR FORMULA · BORN IN KOREA · MADE FOR THE WORLD · ";

export function MarqueeHero() {
  return (
    <section className="relative w-full min-h-[100svh] bg-[#F5F0E8] overflow-hidden flex flex-col items-center justify-center pt-20">

      {/* ── Marquee background layer ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col justify-center gap-10 pointer-events-none select-none"
      >
        {/* Line 1: large, slow, left → */}
        <div className="overflow-hidden">
          <div
            className="dostac-marquee-inner flex whitespace-nowrap font-display font-bold text-[#2D2D2D]/[0.07] leading-none"
            style={{
              fontSize: "clamp(4rem, 10vw, 9rem)",
              letterSpacing: "-0.02em",
              animation: "dostac-marquee-left 35s linear infinite",
              willChange: "transform",
            }}
          >
            <span>{LINE1}</span>
            <span>{LINE1}</span>
          </div>
        </div>

        {/* Line 2: small, fast, ← right */}
        <div className="overflow-hidden">
          <div
            className="dostac-marquee-inner flex whitespace-nowrap font-sans font-semibold uppercase text-[#8B5E3C]/30"
            style={{
              fontSize: "clamp(0.75rem, 1.8vw, 1.05rem)",
              letterSpacing: "0.3em",
              animation: "dostac-marquee-right 20s linear infinite",
              willChange: "transform",
            }}
          >
            <span>{LINE2}</span>
            <span>{LINE2}</span>
          </div>
        </div>
      </div>

      {/* ── Center content ── */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center max-w-4xl py-16">
        <p className="uppercase tracking-[0.35em] text-[11px] font-bold text-[#8B5E3C] mb-8">
          Korean Cosmetics · OEM &amp; ODM Manufacturer
        </p>
        <h1
          className="font-display font-bold text-[#2D2D2D] leading-[1.05] mb-6"
          style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
        >
          Your Beauty Brand,<br />
          <span className="italic">Born in Korea</span>
        </h1>
        <p
          className="text-[#2D2D2D]/60 leading-relaxed mb-10 max-w-lg"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
        >
          From formulation to global delivery — Dostac makes world-class K-beauty accessible for brands everywhere.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="#rfq" onClick={() => trackCtaClick("Get OEM Quote", "hero_marquee")}>
            <Button
              size="lg"
              className="rounded-full bg-[#2D2D2D] hover:bg-[#2D2D2D]/80 text-[#F5F0E8] h-13 px-8 font-semibold"
            >
              Get OEM Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-[#2D2D2D]/25 text-[#2D2D2D] bg-transparent hover:bg-[#2D2D2D]/5 h-13 px-8 font-semibold"
            >
              Browse Products
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 text-[#2D2D2D]/30 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.35em] font-semibold">Scroll</span>
        <div className="w-px h-8 bg-[#2D2D2D]/20" />
      </div>
    </section>
  );
}
