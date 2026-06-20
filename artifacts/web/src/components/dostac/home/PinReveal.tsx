"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/dostac/i18n";
import { dostacImage } from "@/components/dostac/Layout";

/* ── Images shown sequentially as user scrolls ── */
const IMAGES = [
  "product-01.webp",
  "product-02.webp",
  "hero-production.webp",
] as const;

/* ─────────────────────────────────────────────
   PinReveal
   Desktop:  sticky left-text / right-images, 300vh scrollable container.
   Mobile:   static grid, all three images visible at once.
   Both:     prefers-reduced-motion shows the static layout.
───────────────────────────────────────────── */
export function PinReveal() {
  /* ── All hooks at top level (rules of hooks) ── */
  const { t }          = useT();
  const containerRef   = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /*
   * Cover-fade approach: images are stacked by z-index (img0 top → img2 bottom).
   * The top image fades OUT to reveal the one below — no double-exposure artifact
   * since the fading layer is always in front of the incoming one.
   *
   * img2 is always opacity:1 (base layer, z-10)
   * img1 fades out at ~63 % → z-20
   * img0 fades out at ~33 % → z-30
   */
  const img0Opacity = useTransform(scrollYProgress, [0.27, 0.36], [1, 0]);
  const img1Opacity = useTransform(scrollYProgress, [0.60, 0.69], [1, 0]);

  /* Track active caption */
  useMotionValueEvent(scrollYProgress, "change", (val) => {
    if (val < 0.33)      setActiveIdx(0);
    else if (val < 0.63) setActiveIdx(1);
    else                 setActiveIdx(2);
  });

  /* i18n */
  const eyebrow  = t("homeNew.pinRevealEyebrow") as string;
  const title    = t("homeNew.pinRevealTitle") as string;
  const body     = t("homeNew.pinRevealBody") as string;
  const cta      = t("homeNew.pinRevealCta") as string;
  const captions = t("homeNew.pinRevealCaptions") as string[];

  /* ── Static layout (mobile + reduced-motion) ── */
  const StaticLayout = (
    <section className="py-20 md:py-24 bg-[#F5F0E8]">
      <div className="container mx-auto px-6">
        <div className="max-w-xl mb-12">
          <p className="uppercase tracking-[0.25em] text-xs font-bold text-[#8B5E3C] mb-4">
            {eyebrow}
          </p>
          <h2
            className="font-display font-bold text-[#2D2D2D] leading-tight mb-5"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
          >
            {title}
          </h2>
          <p className="text-[#2D2D2D]/60 leading-relaxed mb-6">{body}</p>
          <Link href="/contact">
            <Button className="rounded-full bg-[#2D2D2D] text-[#F5F0E8] hover:bg-[#2D2D2D]/80 font-semibold">
              {cta} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {IMAGES.map((src, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden relative">
              <Image
                src={dostacImage(src)}
                alt={captions[i] ?? ""}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
                loading="lazy"
              />
              <p className="text-xs font-semibold uppercase tracking-widest text-[#8B5E3C] mt-2 pl-1">
                {captions[i]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (prefersReduced) return StaticLayout;

  return (
    <>
      {/* Mobile: static (hidden on lg+) */}
      <div className="lg:hidden">{StaticLayout}</div>

      {/* Desktop: sticky pin (hidden below lg) */}
      <section
        ref={containerRef}
        className="hidden lg:block relative"
        style={{ height: "300vh" }}
      >
        <div
          className="sticky top-0 overflow-hidden grid grid-cols-2"
          style={{ height: "100vh" }}
        >
          {/* ── Left: text ── */}
          <div className="flex flex-col justify-center px-16 py-16 bg-[#F5F0E8]">
            <p className="uppercase tracking-[0.25em] text-xs font-bold text-[#8B5E3C] mb-4">
              {eyebrow}
            </p>
            <h2
              className="font-display font-bold text-[#2D2D2D] leading-tight mb-6"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
            >
              {title}
            </h2>
            <p className="text-[#2D2D2D]/60 leading-relaxed mb-8 max-w-md">
              {body}
            </p>
            <Link href="/contact">
              <Button className="rounded-full bg-[#2D2D2D] text-[#F5F0E8] hover:bg-[#2D2D2D]/80 font-semibold w-fit">
                {cta} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            {/* Caption indicator */}
            {captions.length > 0 && (
              <div className="mt-12 flex gap-8">
                {captions.map((cap, i) => (
                  <span
                    key={i}
                    className="text-xs font-bold uppercase tracking-widest transition-colors duration-300"
                    style={{
                      color: activeIdx === i ? "#8B5E3C" : "rgba(45,45,45,0.25)",
                    }}
                  >
                    {cap}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: cover-fade image stack ── */}
          <div className="relative bg-[#2D2D2D]">
            {/* img2 — bottom base layer, always visible */}
            <div className="absolute inset-0 z-10">
              <Image src={dostacImage(IMAGES[2])} alt={captions[2] ?? ""} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" loading="lazy" />
            </div>
            {/* img1 — middle layer, fades out at ~63 % */}
            <motion.div style={{ opacity: img1Opacity }} className="absolute inset-0 z-20">
              <Image src={dostacImage(IMAGES[1])} alt={captions[1] ?? ""} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" loading="lazy" />
            </motion.div>
            {/* img0 — top layer, fades out at ~33 % */}
            <motion.div style={{ opacity: img0Opacity }} className="absolute inset-0 z-30">
              <Image src={dostacImage(IMAGES[0])} alt={captions[0] ?? ""} fill sizes="(max-width: 1024px) 100vw, 50vw" priority className="object-cover" />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
