import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  Calendar,
  Globe2,
  Tag,
  Copy,
  Check,
  Share2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Layout, dostacImage } from "@/components/dostac/Layout";
import { useT, useLang } from "@/components/dostac/i18n";
import {
  useGetPublicNotice,
  useListPublicNotices,
} from "@workspace/api-client-react";

function formatDate(iso: string, lang: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(
      lang === "ko"
        ? "ko-KR"
        : lang === "ja"
          ? "ja-JP"
          : lang === "zh"
            ? "zh-CN"
            : lang === "vi"
              ? "vi-VN"
              : "en-US",
      { year: "numeric", month: "long", day: "numeric" },
    ).format(d);
  } catch {
    return iso;
  }
}

function categoryColor(c: string) {
  const lower = c.toLowerCase();
  if (
    lower.includes("company") ||
    lower.includes("회사") ||
    lower.includes("公司") ||
    lower.includes("công ty")
  )
    return "bg-primary/15 text-primary";
  if (
    lower.includes("new") ||
    lower.includes("신제품") ||
    lower.includes("新品") ||
    lower.includes("sản phẩm mới")
  )
    return "bg-accent/15 text-accent";
  if (
    lower.includes("exhib") ||
    lower.includes("전시") ||
    lower.includes("展") ||
    lower.includes("triển lãm")
  )
    return "bg-amber-100 text-amber-800";
  if (
    lower.includes("cert") ||
    lower.includes("인증") ||
    lower.includes("认证") ||
    lower.includes("chứng nhận")
  )
    return "bg-emerald-100 text-emerald-800";
  return "bg-slate-100 text-slate-700";
}

function NoticeDetailContent() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const { t } = useT();
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const {
    data: article,
    isLoading,
    isError,
  } = useGetPublicNotice(slug, { lang });
  const { data: allNotices } = useListPublicNotices({
    lang,
    category: article?.category,
  });

  const related = (allNotices ?? [])
    .filter((n) => n.slug !== slug)
    .slice(0, 3);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: article?.title ?? "", url });
      } catch {
        // user dismissed or share failed — do nothing
      }
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-6">
        <h1 className="font-display text-3xl font-bold text-primary">
          Article not found
        </h1>
        <p className="text-muted-foreground">
          This article may have been removed or is unavailable.
        </p>
        <Link
          href="/notice"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("notice.backToNotice") as string}
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className="relative w-full min-h-[520px] flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <img
            src={article.thumbnailUrl ?? dostacImage("hero-home.webp")}
            alt={article.title}
            fetchPriority="high"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/20" />
        </div>
        <div className="container relative z-10 mx-auto px-6 pb-16 pt-32 text-white">
          <Link
            href="/notice"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("notice.backToNotice") as string}
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${categoryColor(article.category)}`}
            >
              <Tag className="h-3 w-3" />
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-white/70">
              <Calendar className="h-4 w-4" />
              {formatDate(article.publishedAt, lang)}
            </span>
            {article.region && (
              <span className="inline-flex items-center gap-1.5 text-sm text-white/70">
                <Globe2 className="h-4 w-4" />
                {article.region}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-4xl">
            {article.title}
          </h1>
        </div>
      </section>

      {/* ARTICLE BODY */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed mb-10 pb-10 border-b border-slate-200">
                {article.excerpt}
              </p>
            )}

            {/* Body */}
            <div
              className="rich-html text-base text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />

            {/* Actions */}
            <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/notice"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("notice.backToNotice") as string}
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                {canNativeShare ? (
                  <Share2 className="h-4 w-4" />
                ) : copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {canNativeShare
                  ? (t("notice.share") as string)
                  : copied
                    ? (t("notice.copied") as string)
                    : (t("notice.copyLink") as string)}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED POSTS */}
      {related.length > 0 && (
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-2">
              {t("notice.eyebrow") as string}
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-10">
              {t("notice.relatedPosts") as string}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/notice/${item.slug}`}
                  className="group block"
                >
                  <article className="h-full flex flex-col rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                    <div className="relative aspect-[16/10] bg-slate-200 overflow-hidden">
                      <img
                        src={
                          item.thumbnailUrl ?? dostacImage("hero-home.webp")
                        }
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span
                        className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${categoryColor(item.category)}`}
                      >
                        <Tag className="h-3 w-3" />
                        {item.category}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col p-5">
                      <p className="text-xs text-muted-foreground mb-2 inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(item.publishedAt, lang)}
                      </p>
                      <h3 className="font-display text-base font-semibold text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors mb-auto">
                        {item.title}
                      </h3>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                        {t("notice.readMore") as string}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="container mx-auto px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold mb-4">
            {t("notice.eyebrow") as string}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto leading-tight">
            {t("notice.ctaHeading") as string}
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            {t("notice.ctaBody") as string}
          </p>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-medium text-white shadow-sm hover:bg-accent/90 hover:shadow-accent/20 hover:shadow-md transition-all"
          >
            {t("notice.ctaButton") as string}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

export default function NoticeDetail() {
  return (
    <Layout>
      <NoticeDetailContent />
    </Layout>
  );
}
