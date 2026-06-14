"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, LayoutGrid, List, Clock } from "lucide-react";
import { formatDate } from "@/lib/wordpress";
import type { PostWithMeta } from "./enrichPosts";
import type { WPCategory } from "@/lib/wordpress";
import { TYPE_MAP } from "./enrichPosts";

/* ── Category-based cover gradients ── */
const COVER_GRADIENTS: Record<string, string> = {
  "alibaba":      "linear-gradient(135deg, #F5F0E8 0%, #D4B896 100%)",
  "b2b-sourcing": "linear-gradient(135deg, #EDE8E0 0%, #C9A87C 100%)",
  "k-trends":     "linear-gradient(135deg, #E8EDE0 0%, #9AB87C 100%)",
  "oem-odm":      "linear-gradient(135deg, #E0E8ED 0%, #7C9AB8 100%)",
  "default":      "linear-gradient(135deg, #F5F0E8 0%, #8B5E3C44 100%)",
};

interface Props {
  posts: PostWithMeta[];
  categories: WPCategory[];
}

/* ─────────────────────────────────────────────
   GalleryCard — Notion gallery view card
   Cover image top + meta below
───────────────────────────────────────────── */
function GalleryCard({ post }: { post: PostWithMeta }) {
  const gradient = COVER_GRADIENTS[post.catSlug ?? "default"] ?? COVER_GRADIENTS["default"];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group flex flex-col rounded-2xl overflow-hidden border border-[#2D2D2D]/[0.07] bg-white hover:shadow-[0_8px_32px_rgba(45,45,45,0.12)] transition-all duration-300"
    >
      {/* Cover — 16:10 aspect ratio, object-top so headlines/subjects stay visible */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title.rendered}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: gradient }}>
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, #2D2D2D 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>
        )}
        {post.type && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] text-white"
            style={{ backgroundColor: post.type.color }}
          >
            {post.type.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3 text-[11px] text-[#2D2D2D]/40">
          <time>{formatDate(post.date)}</time>
          {post.readMin > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readMin} min read
              </span>
            </>
          )}
        </div>

        <h2 className="font-display text-[1.05rem] text-[#2D2D2D] leading-snug mb-2 group-hover:text-[#8B5E3C] transition-colors flex-1 line-clamp-2">
          <Link href={`/insights/${post.slug}`}>
            {post.title.rendered}
          </Link>
        </h2>

        {post.excerptText && (
          <p className="text-[12px] text-[#2D2D2D]/55 leading-relaxed line-clamp-2 mb-4">
            {post.excerptText}
          </p>
        )}

        <Link
          href={`/insights/${post.slug}`}
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8B5E3C] hover:gap-2 transition-all mt-auto"
        >
          Read More <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────
   ListCard — Notion list view card
   Horizontal layout with date column on left
───────────────────────────────────────────── */
function ListCard({ post }: { post: PostWithMeta }) {
  return (
    <motion.article
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="group flex gap-6 items-start py-5 border-b border-[#2D2D2D]/[0.07] hover:bg-[#F5F0E8]/50 -mx-4 px-4 rounded-lg transition-colors"
    >
      {/* Date column */}
      <div className="shrink-0 w-20 text-right pt-0.5">
        <time className="text-[10px] font-semibold text-[#2D2D2D]/35 uppercase tracking-wide leading-tight block">
          {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </time>
        <span className="text-[10px] text-[#2D2D2D]/30">
          {new Date(post.date).getFullYear()}
        </span>
      </div>

      {/* Color bar */}
      <div
        className="shrink-0 w-1 h-full self-stretch rounded-full min-h-[40px]"
        style={{ backgroundColor: post.type?.color ?? "#8B5E3C", opacity: 0.4 }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {post.type && (
            <span
              className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: post.type.color }}
            >
              {post.type.label}
            </span>
          )}
          {post.readMin > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-[#2D2D2D]/35">
              <Clock className="h-3 w-3" /> {post.readMin} min read
            </span>
          )}
        </div>
        <h2 className="font-semibold text-[#2D2D2D] text-sm leading-snug mb-1 group-hover:text-[#8B5E3C] transition-colors">
          <Link href={`/insights/${post.slug}`}>
            {post.title.rendered}
          </Link>
        </h2>
        {post.excerptText && (
          <p className="text-[11px] text-[#2D2D2D]/45 line-clamp-1">
            {post.excerptText}
          </p>
        )}
      </div>

      <Link href={`/insights/${post.slug}`} className="shrink-0 mt-1 text-[#8B5E3C]/50 group-hover:text-[#8B5E3C] transition-colors">
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────
   InsightsClient (exported)
   Manages: view toggle + active category filter
───────────────────────────────────────────── */
export function InsightsClient({ posts, categories }: Props) {
  const [view, setView] = useState<"gallery" | "list">("gallery");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filtered = activeCat
    ? posts.filter((p) => p.catSlug === activeCat)
    : posts;

  const displayCats = categories.filter((c) => c.slug !== "uncategorized");

  return (
    <>
      {/* ── Notion-style toolbar: categories + view toggle ── */}
      <div className="sticky top-16 z-20 bg-[#F5F0E8]/90 backdrop-blur-sm border-b border-[#2D2D2D]/[0.07]">
        <div className="container mx-auto px-6 max-w-6xl py-3 flex items-center gap-3">
          {/* Category filters */}
          <div className="flex gap-2 flex-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCat(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-all ${
                activeCat === null
                  ? "bg-[#2D2D2D] text-[#F5F0E8]"
                  : "text-[#2D2D2D]/50 hover:text-[#2D2D2D] hover:bg-[#2D2D2D]/8"
              }`}
            >
              All
            </button>
            {displayCats.map((cat) => {
              const type = TYPE_MAP[cat.slug];
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCat(cat.slug === activeCat ? null : cat.slug)}
                  className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-all ${
                    activeCat === cat.slug
                      ? "text-white"
                      : "text-[#2D2D2D]/50 hover:text-[#2D2D2D] hover:bg-[#2D2D2D]/8"
                  }`}
                  style={activeCat === cat.slug ? { backgroundColor: type?.color ?? "#8B5E3C" } : {}}
                >
                  {type?.label ?? cat.name}
                </button>
              );
            })}
          </div>

          {/* View toggle */}
          <div className="flex shrink-0 gap-1 border border-[#2D2D2D]/15 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setView("gallery")}
              title="Gallery view"
              className={`p-1.5 rounded-md transition-all ${
                view === "gallery"
                  ? "bg-[#2D2D2D] text-[#F5F0E8]"
                  : "text-[#2D2D2D]/40 hover:text-[#2D2D2D]"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              title="List view"
              className={`p-1.5 rounded-md transition-all ${
                view === "list"
                  ? "bg-[#2D2D2D] text-[#F5F0E8]"
                  : "text-[#2D2D2D]/40 hover:text-[#2D2D2D]"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <section className="container mx-auto px-6 py-12 max-w-6xl">
        {filtered.length === 0 ? (
          <p className="text-[#2D2D2D]/40 text-center py-20 text-sm">
            No posts in this category yet.
          </p>
        ) : view === "gallery" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((post) => (
              <GalleryCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="max-w-3xl">
            {filtered.map((post) => (
              <ListCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

