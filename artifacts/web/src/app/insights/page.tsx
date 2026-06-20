import { Layout } from "@/components/dostac/Layout";
import { getPosts, getCategories } from "@/lib/wordpress";
import { InsightsClient } from "@/components/dostac/insights/InsightsClient";
import { enrichPosts } from "@/components/dostac/insights/enrichPosts";

export default async function InsightsPage() {
  const [posts, categories] = await Promise.all([getPosts(20), getCategories()]);

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const enriched = enrichPosts(posts, catMap);

  return (
    <Layout>
      <main className="min-h-screen bg-[#F5F0E8]">

        {/* ── Hero — DARK/CREAM palette ── */}
        <section className="bg-[#2D2D2D] pt-32 pb-20 px-6 relative overflow-hidden">
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #F5F0E8 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="container relative z-10 mx-auto max-w-5xl">
            <p className="text-[#8B5E3C] text-xs font-bold tracking-[0.35em] uppercase mb-5">
              Insights
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-[#F5F0E8] leading-[1.05] mb-6">
              K-Beauty Intelligence.
              <br />
              <span className="text-[#F5F0E8]/40">For Global Brands.</span>
            </h1>
            <p className="text-[#F5F0E8]/60 text-lg max-w-2xl leading-relaxed">
              Industry trends, OEM/ODM strategies, and Korean cosmetics
              manufacturing insights from the Dostac team.
            </p>

            {/* Stat row */}
            <div className="flex gap-8 mt-10">
              {[
                { n: posts.length.toString(), label: "Articles" },
                { n: "4", label: "Categories" },
                { n: "Weekly", label: "Updates" },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="font-display text-2xl font-bold text-[#F5F0E8]">{n}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5F0E8]/35">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Client: view toggle + category filter + cards ── */}
        <InsightsClient posts={enriched} categories={categories} />

      </main>
    </Layout>
  );
}
