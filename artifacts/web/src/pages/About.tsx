import React, { useEffect, useMemo, useState } from "react";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang, type Lang } from "@/components/dostac/i18n";
import { useGetPublicAbout } from "@workspace/api-client-react";
import { MapPin } from "lucide-react";

const SECTIONS = [
  { id: "greeting" },
  { id: "history" },
  { id: "worldwide" },
  { id: "directions" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function pickByLang(
  obj: unknown,
  base: string,
  lang: Lang,
): string {
  if (!obj || typeof obj !== "object") return "";
  const rec = obj as Record<string, unknown>;
  const v = rec[`${base}${cap(lang)}`];
  if (typeof v === "string" && v.trim()) return v;
  const ko = rec[`${base}Ko`];
  return typeof ko === "string" ? ko : "";
}

function pickItem(item: unknown, base: string, lang: Lang): string {
  if (!item || typeof item !== "object") return "";
  const rec = item as Record<string, unknown>;
  const v = rec[`${base}${cap(lang)}`];
  if (typeof v === "string" && v.trim()) return v;
  const ko = rec[`${base}Ko`];
  return typeof ko === "string" ? ko : "";
}

function useScrollSpy(): SectionId {
  const [active, setActive] = useState<SectionId>("greeting");
  useEffect(() => {
    const onScroll = () => {
      const offset = 160;
      let current: SectionId = "greeting";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - offset <= 0) current = s.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return active;
}

function SectionNav({ active }: { active: SectionId }) {
  const { t } = useT();
  return (
    <nav
      className="sticky top-20 z-40 bg-white/95 backdrop-blur border-y border-slate-200/70"
      aria-label="About sections"
    >
      <div className="container mx-auto px-6">
        <ul className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {SECTIONS.map((s) => (
            <li key={s.id} className="flex-shrink-0">
              <a
                href={`#${s.id}`}
                data-testid={`about-tab-${s.id}`}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
                  active === s.id
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-primary"
                }`}
              >
                {t(`about.sections.${s.id}`) as string}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function AboutContent() {
  const { t } = useT();
  const { lang } = useLang();
  const active = useScrollSpy();
  const { data } = useGetPublicAbout();

  const greetingHtml = useMemo(
    () => pickByLang(data, "greetingMessage", lang),
    [data, lang],
  );
  const greetingSig = pickByLang(data, "greetingSignature", lang);
  const worldwideIntro = pickByLang(data, "worldwideIntro", lang);
  const directionsAddress = pickByLang(data, "directionsAddress", lang) || (t("about.directionsAddress") as string);

  const greetingImg = data?.greetingImageUrl || dostacImage("ceo-portrait.webp");
  const worldwideImg = data?.worldwideImageUrl || dostacImage("hero-production.webp");

  return (
    <>
      {/* HERO */}
      <section className="relative w-full h-[360px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={dostacImage("hero-about.webp")}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/65 via-primary/55 to-primary/75" />
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t("about.heroTitle") as string}
          </h1>
          <p className="text-lg md:text-xl text-white/85">
            {t("about.heroSub") as string}
          </p>
        </div>
      </section>

      <SectionNav active={active} />

      {/* 1. GREETING */}
      <section id="greeting" className="scroll-mt-32 py-20 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border bg-muted">
              <img
                src={greetingImg}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-2">
              01 — {t("about.sections.greeting") as string}
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
              {t("about.greetingsHeading") as string}
            </h2>
            <div
              className="prose prose-slate max-w-none text-muted-foreground text-lg leading-relaxed prose-p:my-4"
              data-testid="about-greeting-html"
              dangerouslySetInnerHTML={{ __html: greetingHtml || "" }}
            />
            {greetingSig && (
              <p className="mt-6 text-sm font-semibold text-accent">— {greetingSig}</p>
            )}
          </div>
        </div>
      </section>

      {/* 2. HISTORY */}
      <section id="history" className="scroll-mt-32 py-20 bg-primary text-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-2 text-center">
            02 — {t("about.sections.history") as string}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-center">
            {t("about.historyHeading") as string}
          </h2>
          <p className="text-white/80 text-center leading-relaxed mb-10 max-w-2xl mx-auto whitespace-pre-line">
            {t("about.historyIntro") as string}
          </p>
          <div className="space-y-4 mb-12">
            {(t("about.historyAreas") as string[]).map((area, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[110px_1fr] gap-4 md:gap-8 items-start"
              >
                <div className="font-display text-2xl font-bold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="bg-white/5 backdrop-blur rounded-lg p-5 border border-white/10">
                  <p className="text-base text-white/90 leading-relaxed">{area}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/80 text-center leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
            {t("about.historyOutro") as string}
          </p>
        </div>
      </section>

      {/* 3. WORLDWIDE */}
      <section id="worldwide" className="scroll-mt-32 py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-2 text-center">
            03 — {t("about.sections.worldwide") as string}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary text-center mb-6">
            {t("about.worldwideHeading") as string}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed text-center max-w-3xl mx-auto mb-12">
            {worldwideIntro}
          </p>
          {worldwideImg && (
            <div className="mb-12 max-w-5xl mx-auto rounded-2xl overflow-hidden border bg-white shadow-sm">
              <img
                src={worldwideImg}
                alt=""
                className="w-full h-72 md:h-96 object-cover"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(data?.worldwideItems ?? []).map((w, i) => (
              <article
                key={i}
                data-testid={`about-worldwide-${i}`}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
              >
                {w.imageUrl && (
                  <img
                    src={w.imageUrl}
                    alt=""
                    className="h-40 w-full object-cover rounded-md mb-4"
                  />
                )}
                <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {w.region}
                </div>
                <h3 className="font-display text-xl font-bold text-primary mt-1 mb-2">
                  {pickItem(w, "title", lang)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pickItem(w, "description", lang)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DIRECTIONS */}
      <section id="directions" className="scroll-mt-32 py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-2 text-center">
            04 — {t("about.sections.directions") as string}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary text-center mb-12">
            {t("about.directionsHeading") as string}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="rounded-2xl overflow-hidden border bg-slate-100 aspect-[4/3]">
              {data?.directionsMapEmbed ? (
                <iframe
                  src={data.directionsMapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="map"
                  data-testid="about-map"
                />
              ) : data?.directionsImageUrl ? (
                <img
                  src={data.directionsImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <MapPin className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                    {t("about.directionsAddressLabel") as string}
                  </div>
                  <p
                    className="text-lg text-primary font-medium leading-relaxed whitespace-pre-line"
                    data-testid="about-address"
                  >
                    {directionsAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function About() {
  return (
    <Layout>
      <AboutContent />
    </Layout>
  );
}
