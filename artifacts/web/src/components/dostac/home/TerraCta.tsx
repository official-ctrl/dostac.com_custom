import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCtaClick } from "@/lib/analytics";

export function TerraCta() {
  return (
    <section className="relative py-28 md:py-40 bg-[#8B5E3C] overflow-hidden">
      {/* Decorative background wordmark */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <span
          className="font-display font-bold italic text-[#F5F0E8]/[0.05] leading-none whitespace-nowrap"
          style={{ fontSize: "clamp(6rem, 22vw, 20rem)" }}
        >
          Dostac
        </span>
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="uppercase tracking-[0.35em] text-[11px] font-bold text-[#F5F0E8]/55 mb-6"
        >
          Ready to Start?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-[#F5F0E8] leading-[1.05] mb-6"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
        >
          Launch Your K-Beauty<br />Brand Today
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#F5F0E8]/65 leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
        >
          ISO-certified Korean cosmetics OEM/ODM. Low MOQ, fast turnaround, shipped to 32+ countries.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#rfq" onClick={() => trackCtaClick("Get Free Quote", "terra_cta")}>
            <Button
              size="lg"
              className="rounded-full bg-[#F5F0E8] text-[#8B5E3C] hover:bg-[#F5F0E8]/90 h-13 px-8 font-semibold"
            >
              Get a Free Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-[#F5F0E8]/30 text-[#F5F0E8] bg-transparent hover:bg-[#F5F0E8]/10 h-13 px-8 font-semibold"
            >
              Talk to Us
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
