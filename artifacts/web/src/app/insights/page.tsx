import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/dostac/Layout";
import { getPosts, getCategories, stripHtml, formatDate } from "@/lib/wordpress";

export const revalidate = 3600;

export default async function InsightsPage() {
  const [posts, categories] = await Promise.all([getPosts(20), getCategories()]);

  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const displayCats = categories.filter((c) => c.slug !== "uncategorized");

  return (
    <Layout>
    <main className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="bg-[#0F172A] pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <p className="text-accent text-sm font-semibold tracking-[0.15em] uppercase mb-4">
            Insights
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-white leading-tight">
            K-Beauty Intelligence.
            <br />
            <span className="text-white/50">For Global Brands.</span>
          </h1>
          <p className="mt-6 text-slate-300 text-lg max-w-2xl leading-relaxed">
            Industry trends, OEM/ODM strategies, and Korean cosmetics
            manufacturing insights from the Dostac team.
          </p>
        </div>
      </section>

      {/* ── Category pills ── */}
      {displayCats.length > 0 && (
        <div className="border-b border-slate-100 bg-white">
          <div className="container mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
            {displayCats.map((cat) => (
              <span
                key={cat.id}
                className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Post grid ── */}
      <section className="container mx-auto px-6 py-16 max-w-6xl">
        {posts.length === 0 ? (
          <p className="text-slate-400 text-center py-20 text-lg">
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const cat = post.categories
                .map((id) => catMap.get(id))
                .filter((c): c is string => Boolean(c) && c !== "Uncategorized")[0];

              const excerpt = stripHtml(post.excerpt.rendered).slice(0, 160);

              return (
                <article
                  key={post.id}
                  className="group flex flex-col border border-slate-100 rounded-2xl p-6 hover:border-accent/40 hover:shadow-lg transition-all duration-300"
                >
                  {/* Meta */}
                  <div className="flex items-center justify-between mb-4">
                    {cat ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                        {cat}
                      </span>
                    ) : (
                      <span />
                    )}
                    <time className="text-xs text-slate-400">
                      {formatDate(post.date)}
                    </time>
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-2xl text-[#0F172A] leading-snug mb-3 group-hover:text-accent transition-colors flex-1">
                    <Link href={`/insights/${post.slug}`}>
                      {post.title.rendered}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  {excerpt && (
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6">
                      {excerpt}
                    </p>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/insights/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-2.5 transition-all mt-auto"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
    </Layout>
  );
}
