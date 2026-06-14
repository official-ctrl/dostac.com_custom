"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/wordpress";
import { TYPE_MAP } from "@/components/dostac/insights/enrichPosts";

/* ── Cached edge endpoint (1h ISR + SWR 24h). See:
   src/app/api/insights/latest/route.ts ── */
const INSIGHTS_API = "/api/insights/latest?limit=3";

/* Shape returned by /api/insights/latest — kept in sync with route.ts */
interface ApiCard {
  id: number;
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  catSlug: string | undefined;
  catName: string | undefined;
  readMin: number;
  imageUrl: string | undefined;
}

/* ── Derived post data ── */
interface CardData {
  id: number;
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  catSlug: string | undefined;
  type: { label: string; color: string } | undefined;
  readMin: number;
  imageUrl: string | undefined;
}

async function fetchInsightsCards(): Promise<CardData[]> {
  try {
    const res = await fetch(INSIGHTS_API);
    if (!res.ok) return [];
    const data: { cards: ApiCard[] } = await res.json();
    return data.cards.map((c) => ({
      ...c,
      type: c.catSlug ? TYPE_MAP[c.catSlug] : undefined,
      imageUrl: c.imageUrl,
    }));
  } catch {
    return [];
  }
}

/* ── Cover gradient per category ── */
const COVER_GRADIENTS: Record<string, string> = {
  "alibaba":      "linear-gradient(135deg, #F5F0E8 0%, #D4B896 100%)",
  "b2b-sourcing": "linear-gradient(135deg, #EDE8E0 0%, #C9A87C 100%)",
  "k-trends":     "linear-gradient(135deg, #E8EDE0 0%, #9AB87C 100%)",
  "oem-odm":      "linear-gradient(135deg, #E0E8ED 0%, #7C9AB8 100%)",
  "default":      "linear-gradient(135deg, #F5F0E8 0%, #D4B896 100%)",
};

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* ─────────────────────────────────────────────
   LatestInsightCard
───────────────────────────────────────────── */
function LatestInsightCard({ card, index }: { card: CardData; index: number }) {
  const gradient = COVER_GRADIENTS[card.catSlug ?? "default"] ?? COVER_GRADIENTS["default"];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: EASE_OUT_EXPO }}
      className="group flex flex-col rounded-2xl overflow-hidden border border-[#2D2D2D]/[0.08] bg-white hover:shadow-[0_8px_32px_rgba(45,45,45,0.12)] transition-all duration-300"
    >
      {/* Cover strip — 16:10 aspect ratio, object-top preserves image subject */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: gradient }}>
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, #2D2D2D 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>
        )}
        {card.type && (
          <span
            className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.12em] text-white"
            style={{ backgroundColor: card.type.color }}
          >
            {card.type.label}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-2.5 text-[10px] text-[#2D2D2D]/40">
          <time>{formatDate(card.date)}</time>
          {card.readMin > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {card.readMin} min read
              </span>
            </>
          )}
        </div>

        <h3 className="font-display text-[0.95rem] text-[#2D2D2D] leading-snug mb-2 group-hover:text-[#8B5E3C] transition-colors flex-1 line-clamp-2">
          <Link href={`/insights/${card.slug}`}>{card.title}</Link>
        </h3>

        {card.excerpt && (
          <p className="text-[11px] text-[#2D2D2D]/50 leading-relaxed line-clamp-2 mb-4">
            {card.excerpt}
          </p>
        )}

        <Link
          href={`/insights/${card.slug}`}
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B5E3C] hover:gap-2 transition-all mt-auto"
        >
          Read More <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────
   Skeleton placeholder
───────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#2D2D2D]/[0.08] bg-white animate-pulse">
      <div style={{ height: 96, background: "#EDE8E0" }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-2.5 w-24 bg-[#2D2D2D]/10 rounded-full" />
        <div className="h-4 w-4/5 bg-[#2D2D2D]/10 rounded-full" />
        <div className="h-3 w-full bg-[#2D2D2D]/[0.06] rounded-full" />
        <div className="h-3 w-2/3 bg-[#2D2D2D]/[0.06] rounded-full" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LatestInsightsSection (exported)
───────────────────────────────────────────── */
export function LatestInsightsSection() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const result = await fetchInsightsCards();
      if (cancelled) return;
      setCards(result);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  /* Don't render section at all if no posts could be fetched */
  if (!loading && cards.length === 0) return null;

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#0D1117" }}>
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          >
            <p className="text-[#8B5E3C] text-xs font-bold tracking-[0.3em] uppercase mb-3">
              Latest Insights
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8] leading-tight">
              Intelligence for
              <br />
              <span className="text-[#F5F0E8]/45">Global Sourcing.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/insights"
              className="hidden md:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#F5F0E8]/50 hover:text-[#8B5E3C] transition-colors"
            >
              View All Insights <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {loading
            ? [0, 1, 2].map((i) => <CardSkeleton key={i} />)
            : cards.map((card, i) => (
                <LatestInsightCard key={card.id} card={card} index={i} />
              ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#F5F0E8]/50 hover:text-[#8B5E3C] transition-colors"
          >
            View All Insights <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
