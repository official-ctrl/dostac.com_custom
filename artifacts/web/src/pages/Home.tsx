import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shield,
  Globe2,
  Sprout,
  Factory,
  Wrench,
  ShoppingCart,
  Tag,
  Ship,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang, type Lang } from "@/components/dostac/i18n";
import {
  useListPublicBanners,
  type PublicBanner,
} from "@workspace/api-client-react";

const LANG_FIELD: Record<
  Lang,
  { title: keyof PublicBanner["translations"]; desc: keyof PublicBanner["translations"] }
> = {
  ko: { title: "titleKo", desc: "descriptionKo" },
  en: { title: "titleEn", desc: "descriptionEn" },
  ja: { title: "titleJa", desc: "descriptionJa" },
  zh: { title: "titleZh", desc: "descriptionZh" },
  vi: { title: "titleVi", desc: "descriptionVi" },
};

function pickBannerText(b: PublicBanner, lang: Lang) {
  const fields = LANG_FIELD[lang];
  const title =
    (b.translations[fields.title] as string | null | undefined) ??
    b.translations.titleKo ??
    "";
  const description =
    (b.translations[fields.desc] as string | null | undefined) ??
    b.translations.descriptionKo ??
    "";
  return { title, description };
}

function HomeSlider() {
  const { t } = useT();
  const { lang } = useLang();
  const { data, isLoading } = useListPublicBanners();
  const banners = data ?? [];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % banners.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [banners.length]);

  useEffect(() => {
    if (active >= banners.length) setActive(0);
  }, [banners.length, active]);

  if (isLoading || banners.length === 0) {
    return (
      <section className="relative w-full h-[calc(100vh-5rem)] min-h-[520px] bg-slate-900 flex items-center justify-center">
        <img
          src={dostacImage("hero-home.webp")}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/65 to-primary/35" />
        <div className="relative z-10 container mx-auto px-6 text-white max-w-4xl">
          <p className="uppercase tracking-[0.3em] text-xs text-accent font-semibold mb-5">
            dostac Co., Ltd.
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.1] mb-6">
            {t("home.heroTitle") as string}
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-10 max-w-2xl">
            {t("home.heroBody") as string}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact">
              <Button
                size="lg"
                className="rounded-sm bg-accent hover:bg-accent/90 text-white h-12 px-8 text-base font-medium"
              >
                {t("home.heroCta3") as string} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="rounded-sm border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white h-12 px-8 text-base font-medium"
              >
                {t("home.heroCta1") as string}
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="rounded-sm border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white h-12 px-8 text-base font-medium"
              >
                {t("home.heroCta2") as string}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const go = (next: number) =>
    setActive(((next % banners.length) + banners.length) % banners.length);

  return (
    <section
      className="relative w-full h-[calc(100vh-5rem)] min-h-[520px] overflow-hidden bg-slate-900"
      data-testid="home-slider"
    >
      {banners.map((b, i) => {
        const text = pickBannerText(b, lang);
        const isActive = i === active;
        const bgContent = (
          <>
            <img
              src={b.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = dostacImage("hero-home.webp");
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/55 to-primary/20" />
          </>
        );
        return (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!isActive}
          >
            {b.linkUrl ? (
              <a href={b.linkUrl} className="absolute inset-0 block">
                {bgContent}
              </a>
            ) : (
              bgContent
            )}
            {/* Text overlay — always on top, not inside the link anchor */}
            <div className="relative z-10 h-full flex items-end pb-24 md:pb-20 md:items-center">
              <div className="container mx-auto px-6 text-white max-w-4xl">
                <p className="uppercase tracking-[0.3em] text-xs text-accent font-semibold mb-4">
                  dostac Co., Ltd.
                </p>
                <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4">
                  {text.title || t("home.heroTitle") as string}
                </h1>
                {(text.description || t("home.heroBody") as string) && (
                  <p className="text-base md:text-xl text-white/85 leading-relaxed max-w-2xl mb-8">
                    {text.description || t("home.heroBody") as string}
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact">
                    <Button
                      size="lg"
                      className="rounded-sm bg-accent hover:bg-accent/90 text-white h-11 px-7 text-sm font-medium"
                    >
                      {t("home.heroCta3") as string} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-sm border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white h-11 px-7 text-sm font-medium"
                    >
                      {t("home.heroCta1") as string}
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-sm border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white h-11 px-7 text-sm font-medium"
                    >
                      {t("home.heroCta2") as string}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(active - 1)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur transition"
            aria-label="Previous slide"
            data-testid="banner-prev"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur transition"
            aria-label="Next slide"
            data-testid="banner-next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                data-testid={`banner-dot-${i}`}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

const VALUE_ICONS = [Shield, Globe2, Sprout];

function AboutSection() {
  const { t } = useT();
  const aboutValues = t("home.aboutValues") as Array<{ title: string; desc: string }>;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-accent mb-4">
            {t("home.aboutEyebrow") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
            {t("home.aboutHeading") as string}
          </h2>
          <p className="text-slate-600 leading-relaxed text-base md:text-lg whitespace-pre-line">
            {t("home.aboutBody") as string}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {aboutValues.map((val, idx) => {
            const Icon = VALUE_ICONS[idx] ?? Shield;
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-accent/30 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-primary text-lg mb-2">{val.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const WHY_ICONS = [Factory, Wrench, ShoppingCart, Tag, Ship, Smartphone];

function WhyDostacSection() {
  const { t } = useT();
  const whyCards = t("home.whyCards") as Array<{ title: string; desc: string }>;

  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-accent mb-4">
            {t("home.whyEyebrow") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">
            {t("home.whyHeading") as string}
          </h2>
          <p className="text-slate-500 text-base">{t("home.whySub") as string}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyCards.map((card, idx) => {
            const Icon = WHY_ICONS[idx] ?? Factory;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-slate-100 hover:border-accent/40 hover:shadow-xl transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5 text-accent group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-primary text-base mb-2">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const PRODUCT_IMAGES = [
  "product-03.webp",
  "product-02.webp",
  "product-pore-strips.webp",
  "product-spot-patches.webp",
  "product-06.webp",
  "product-05.webp",
];

function ProductsCategorySection() {
  const { t } = useT();
  const productCategories = t("home.productCategories") as Array<{
    name: string;
    desc: string;
  }>;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-accent mb-4">
            {t("home.productsCatEyebrow") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">
            {t("home.productsCatHeading") as string}
          </h2>
          <p className="text-slate-500 text-base">{t("home.productsCatSub") as string}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {productCategories.map((cat, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden border border-slate-100 hover:border-accent/30 hover:shadow-xl transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={dostacImage(PRODUCT_IMAGES[idx] ?? "product-01.webp")}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    OEM / ODM
                  </span>
                </div>
                <h3 className="font-bold text-primary text-base mb-2">{cat.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/products">
            <Button
              size="lg"
              className="rounded-sm bg-accent hover:bg-accent/90 text-white h-12 px-10 text-base font-medium"
            >
              {t("home.productsCatCta") as string} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function OEMProcessSection() {
  const { t } = useT();
  const oemSteps = t("home.oemSteps") as Array<{
    step: string;
    title: string;
    desc: string;
  }>;

  return (
    <section className="py-20 md:py-28 bg-primary text-white">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-accent mb-4">
            {t("home.oemEyebrow") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {t("home.oemHeading") as string}
          </h2>
          <p className="text-white/70 text-base">{t("home.oemSub") as string}</p>
        </div>

        <div className="relative">
          {/* Connector line visible on lg (all 5 in a row) */}
          <div className="hidden lg:block absolute top-8 left-[5%] right-[5%] h-px bg-white/20 z-0" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-10 gap-x-6">
            {oemSteps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-5 shadow-lg">
                  <span className="font-display font-bold text-white text-sm">{step.step}</span>
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{step.title}</h3>
                <p className="text-white/60 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link href="/contact">
            <Button
              size="lg"
              className="rounded-sm bg-accent hover:bg-accent/90 text-white h-12 px-10 text-base font-medium"
            >
              {t("home.oemCta") as string} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const { t } = useT();
  const faqItems = t("home.faqItems") as Array<{ q: string; a: string }>;
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="uppercase tracking-[0.25em] text-xs font-semibold text-accent mb-4">
            {t("home.faqEyebrow") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
            {t("home.faqHeading") as string}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-slate-200">
          {faqItems.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="font-semibold text-primary text-sm md:text-base pr-4 group-hover:text-accent transition-colors">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-accent flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 group-hover:text-accent transition-colors" />
                  )}
                </button>
                {isOpen && (
                  <div className="pb-5">
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  const { t } = useT();

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
            {t("home.finalCtaHeading") as string}
          </h2>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-10">
            {t("home.finalCtaBody") as string}
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="rounded-sm bg-accent hover:bg-accent/90 text-white h-14 px-12 text-base font-medium"
            >
              {t("home.finalCtaButton") as string} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout>
      <HomeSlider />
      <AboutSection />
      <WhyDostacSection />
      <ProductsCategorySection />
      <OEMProcessSection />
      <FAQSection />
      <FinalCTASection />
    </Layout>
  );
}
