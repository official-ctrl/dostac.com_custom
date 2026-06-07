import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/dostac/Layout";
import { InsightsCtaButton } from "./cta-button";
import {
  getPostBySlug,
  getAllSlugs,
  getCategories,
  stripHtml,
  formatDate,
  transformWpContent,
} from "@/lib/wordpress";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const description = stripHtml(post.excerpt?.rendered ?? "").slice(0, 160);

  return {
    title: post.title.rendered,
    description,
    openGraph: {
      title: `${post.title.rendered} | Dostac Insights`,
      description,
    },
  };
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, categories] = await Promise.all([
    getPostBySlug(slug),
    getCategories(),
  ]);

  if (!post) notFound();

  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const cat = post.categories
    .map((id) => catMap.get(id))
    .find((c) => c && c !== "Uncategorized");

  const content = transformWpContent(post.content?.rendered ?? "");

  return (
    <Layout>
    <main className="min-h-screen bg-white">
      {/* ── Article header ── */}
      <div className="bg-[#0F172A] pt-28 pb-16 px-6">
        <div className="container mx-auto max-w-3xl">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Insights
          </Link>

          <div className="flex items-center gap-3 mb-5">
            {cat && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent">
                {cat}
              </span>
            )}
            <time className="text-slate-400 text-sm">{formatDate(post.date)}</time>
          </div>

          <h1 className="font-display text-4xl md:text-5xl text-white leading-tight">
            {post.title.rendered}
          </h1>
        </div>
      </div>

      {/* ── Article body ── */}
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div
          className="wp-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* ── Footer nav ── */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Insights
          </Link>
          <InsightsCtaButton />
        </div>
      </article>
    </main>
    </Layout>
  );
}
