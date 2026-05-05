import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
          src={dostacImage("hero-home.png")}
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
            <Link href="/products">
              <Button
                size="lg"
                className="rounded-sm bg-accent hover:bg-accent/90 text-white h-12 px-8 text-base font-medium"
              >
                {t("home.heroCta1") as string} <ArrowRight className="ml-2 h-4 w-4" />
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

  const current = banners[active]!;
  const { title, description } = pickBannerText(current, lang);

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
        const inner = (
          <>
            <img
              src={b.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = dostacImage("hero-home.png");
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/55 to-primary/20" />
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-6 text-white max-w-4xl">
                <p className="uppercase tracking-[0.3em] text-xs text-accent font-semibold mb-5">
                  dostac Co., Ltd.
                </p>
                <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.1] mb-6">
                  {text.title}
                </h1>
                {text.description && (
                  <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl">
                    {text.description}
                  </p>
                )}
              </div>
            </div>
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
              <a href={b.linkUrl} className="block h-full w-full">
                {inner}
              </a>
            ) : (
              inner
            )}
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
          <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-2">
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

export default function Home() {
  return (
    <Layout>
      <HomeSlider />
    </Layout>
  );
}
