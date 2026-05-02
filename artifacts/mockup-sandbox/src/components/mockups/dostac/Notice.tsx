import React from "react";
import { Layout } from "./_shared/Layout";
import {
  ArrowRight,
  Calendar,
  Tag,
  Megaphone,
  Sparkles,
  Globe2,
  Award,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Notice() {
  const featured = {
    category: "Industry News",
    date: "April 28, 2026",
    title:
      "dostac Expands Advanced Manufacturing Network into Southeast Asian Hygiene Category",
    excerpt:
      "Building on our customized OEM/ODM solutions, dostac's expanded production network now serves new daily-hygiene partners across Vietnam, Indonesia, and the Philippines — accelerating time-to-market for global brand owners.",
    image: "/__mockup/images/dostac/hero-home.png",
  };

  const categories = [
    { name: "All", count: 24, active: true },
    { name: "Company News", count: 8, icon: Megaphone },
    { name: "New Products", count: 7, icon: Sparkles },
    { name: "Exhibitions", count: 5, icon: Globe2 },
    { name: "Certifications", count: 4, icon: Award },
  ];

  const newProducts = [
    {
      tag: "New Launch",
      title: "Crystal Nose Strip — Vegan-Certified Transparent Pore Care",
      date: "April 22, 2026",
      excerpt:
        "Our newest premium pore strip introduces a transparent crystal formula with a vegan-certified adhesive system, ready for private-label customization.",
      image: "/__mockup/images/dostac/product-pore-strips.png",
    },
    {
      tag: "New Launch",
      title: "Salicylic Acid 0.1% Spot Patch Series — Now in Three Sizes",
      date: "April 10, 2026",
      excerpt:
        "Targeted blemish care expands with three new patch dimensions, supporting flexible MOQ and fully customizable carrier-card packaging.",
      image: "/__mockup/images/dostac/product-spot-patches.png",
    },
    {
      tag: "New Launch",
      title: "Biodegradable Baby Wet Wipe (100% Rayon) Lineup Released",
      date: "March 30, 2026",
      excerpt:
        "Eco-conscious brand owners can now access a fully biodegradable wet-wipe substrate with our 7-step purified-water formula.",
      image: "/__mockup/images/dostac/product-baby-wipes.png",
    },
  ];

  const archive = [
    {
      category: "Exhibition",
      date: "April 15, 2026",
      title:
        "dostac to Showcase Customized OEM Solutions at Cosmoprof Bologna 2026 (Booth Hall 14, B-22)",
    },
    {
      category: "Certification",
      date: "April 02, 2026",
      title:
        "dostac Production Network Achieves Renewal of ISO 22716 (Cosmetics GMP) Certification",
    },
    {
      category: "Company News",
      date: "March 25, 2026",
      title:
        "Q1 2026 Business Review: Global Inquiries Up 38% Year-over-Year",
    },
    {
      category: "Industry News",
      date: "March 18, 2026",
      title:
        "Why \"Manufacturing Network\" Models Are Outpacing Traditional Single-Factory OEMs",
    },
    {
      category: "New Products",
      date: "March 05, 2026",
      title:
        "Deodorant Cooling Tissue — Summer 2026 Active-Lifestyle Line Now in Sample Stage",
    },
    {
      category: "Exhibition",
      date: "February 20, 2026",
      title:
        "Recap: dostac at K-Beauty Expo Bangkok — Over 120 Buyer Meetings Completed",
    },
    {
      category: "Company News",
      date: "February 04, 2026",
      title:
        "dostac Strengthens R&D Partnership with Two New Korean Formulation Laboratories",
    },
    {
      category: "Certification",
      date: "January 18, 2026",
      title:
        "Halal Certification Granted for Selected Hygiene & Personal-Care Lines",
    },
  ];

  const categoryColor = (c: string) => {
    switch (c) {
      case "Company News":
        return "bg-primary/10 text-primary";
      case "New Products":
        return "bg-accent/15 text-accent";
      case "Exhibition":
      case "Exhibitions":
        return "bg-amber-100 text-amber-800";
      case "Certification":
      case "Certifications":
        return "bg-emerald-100 text-emerald-800";
      case "Industry News":
        return "bg-slate-200 text-slate-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <Layout>
      {/* HERO */}
      <section className="relative w-full h-[360px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/__mockup/images/dostac/hero-home.png"
            alt="dostac newsroom"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-primary/85 mix-blend-multiply"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-white">
          <p className="uppercase tracking-[0.3em] text-xs text-accent mb-4">
            Newsroom
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-3xl">
            Latest News, Product Updates & Industry Highlights
          </h1>
          <p className="max-w-2xl text-white/85 text-lg leading-relaxed">
            Keep your partners and visitors informed with the latest updates
            from dostac — company announcements, hot industry news, exhibition
            participation, newly launched products, and important notices that
            reinforce our active presence in the global beauty and personal
            care market.
          </p>
        </div>
      </section>

      {/* CATEGORY + SEARCH BAR */}
      <section className="border-b bg-white sticky top-20 z-40">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.name}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    c.active
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {c.name}
                  <span
                    className={`text-xs ${
                      c.active ? "text-primary-foreground/70" : "text-slate-500"
                    }`}
                  >
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search news & notices"
              className="pl-9 h-10 rounded-full"
            />
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="relative h-[420px] rounded-md overflow-hidden shadow-lg">
              <img
                src={featured.image}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span
                className={`absolute top-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${categoryColor(
                  featured.category,
                )}`}
              >
                <Tag className="h-3 w-3" />
                {featured.category}
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">
                Featured Story
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight mb-5">
                {featured.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {featured.date}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Globe2 className="h-4 w-4" /> Global Markets
                </span>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {featured.excerpt}
              </p>
              <Button className="rounded-sm h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                Read Full Story <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* NEW PRODUCT UPDATES */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-2">
                Product Pipeline
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
                New Product Updates
              </h2>
            </div>
            <a
              href="/__mockup/preview/dostac/Products"
              className="text-sm font-semibold text-primary hover:text-accent inline-flex items-center gap-1"
            >
              View full product portfolio <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newProducts.map((p) => (
              <article
                key={p.title}
                className="group bg-white rounded-md overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-200/60"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-accent/15 text-accent px-3 py-1 text-xs font-semibold">
                    <Sparkles className="h-3 w-3" /> {p.tag}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-2 mb-3">
                    <Calendar className="h-3 w-3" /> {p.date}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-primary leading-snug mb-3 group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {p.excerpt}
                  </p>
                  <a
                    href="#"
                    className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:text-accent"
                  >
                    Learn more <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHIVE LIST */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-2">
              Archive
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
              All Announcements & Updates
            </h2>
          </div>

          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {archive.map((item) => (
              <a
                key={item.title}
                href="#"
                className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-8 py-6 px-2 hover:bg-slate-50 transition-colors"
              >
                <span
                  className={`inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${categoryColor(
                    item.category,
                  )}`}
                >
                  {item.category}
                </span>
                <span className="text-sm text-muted-foreground inline-flex items-center gap-2 md:w-36 shrink-0">
                  <Calendar className="h-4 w-4" /> {item.date}
                </span>
                <h3 className="flex-1 font-medium text-primary group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <ChevronRight className="hidden md:block h-5 w-5 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </a>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-center gap-2 mt-10">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`h-10 w-10 rounded-sm text-sm font-medium transition ${
                  n === 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {n}
              </button>
            ))}
            <button className="h-10 px-4 rounded-sm text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 inline-flex items-center gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Stay ahead with dostac insights.
            </h3>
            <p className="text-primary-foreground/80 max-w-xl">
              Subscribe to receive new product launches, exhibition schedules,
              and customized OEM/ODM opportunity briefings directly to your
              inbox.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <Input
              placeholder="your@company.com"
              className="h-12 md:w-72 bg-white text-primary"
            />
            <Button className="h-12 px-6 rounded-sm bg-accent hover:bg-accent/90 text-white whitespace-nowrap">
              Subscribe <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
