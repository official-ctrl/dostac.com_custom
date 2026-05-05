import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminGetBanner,
  useAdminCreateBanner,
  useAdminUpdateBanner,
  useAdminTranslate,
  getAdminGetBannerQueryKey,
  getAdminListBannersQueryKey,
  type AdminBannerInput,
  type BannerTranslations,
} from "@workspace/api-client-react";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUploader } from "@/components/ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/langs";
import { cn } from "@/lib/utils";

const TARGET_LANGS: Lang[] = ["en", "ja", "zh", "vi"];

const TITLE_KEY: Record<Lang, keyof BannerTranslations> = {
  ko: "titleKo",
  en: "titleEn",
  ja: "titleJa",
  zh: "titleZh",
  vi: "titleVi",
};
const DESC_KEY: Record<Lang, keyof BannerTranslations> = {
  ko: "descriptionKo",
  en: "descriptionEn",
  ja: "descriptionJa",
  zh: "descriptionZh",
  vi: "descriptionVi",
};

function emptyTranslations(): BannerTranslations {
  return {
    titleKo: "",
    titleEn: "",
    titleJa: "",
    titleZh: "",
    titleVi: "",
    descriptionKo: "",
    descriptionEn: "",
    descriptionJa: "",
    descriptionZh: "",
    descriptionVi: "",
  };
}

export default function BannerEdit() {
  const params = useParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : null;
  const isNew = id === null;
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: existing, isLoading } = useAdminGetBanner(id ?? 0, {
    query: { queryKey: getAdminGetBannerQueryKey(id ?? 0), enabled: !isNew },
  });
  const createMut = useAdminCreateBanner();
  const updateMut = useAdminUpdateBanner();
  const translateMut = useAdminTranslate();

  const [activeLang, setActiveLang] = useState<Lang>("ko");
  const [translatingFor, setTranslatingFor] = useState<Lang | "all" | null>(null);
  const [form, setForm] = useState<AdminBannerInput>({
    imageUrl: "",
    linkUrl: null,
    sortOrder: 0,
    active: true,
    translations: emptyTranslations(),
  });

  useEffect(() => {
    if (existing) {
      setForm({
        imageUrl: existing.imageUrl,
        linkUrl: existing.linkUrl ?? null,
        sortOrder: existing.sortOrder,
        active: existing.active,
        translations: { ...emptyTranslations(), ...existing.translations },
      });
    }
  }, [existing]);

  const setT = (key: keyof BannerTranslations, value: string) => {
    setForm((f) => ({
      ...f,
      translations: { ...f.translations, [key]: value },
    }));
  };

  const translateField = async (
    sourceText: string,
    context: string,
    apply: (lang: Lang, text: string) => void,
  ) => {
    if (!sourceText.trim()) {
      toast({
        title: "한국어 원문이 없습니다",
        description: "먼저 한국어 내용을 입력하세요.",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await translateMut.mutateAsync({
        data: {
          sourceText,
          sourceLang: "ko",
          targetLangs: TARGET_LANGS,
          context,
          format: "text",
        },
      });
      for (const t of result.translations) {
        if (t.lang === "ko") continue;
        apply(t.lang, t.text);
      }
      toast({ title: "번역 완료", description: context });
    } catch (err) {
      toast({
        title: "번역 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const translateAll = async () => {
    setTranslatingFor("all");
    try {
      const ko = form.translations;
      // Build new translations once instead of multiple state updates
      let next: BannerTranslations = { ...ko };
      if (ko.titleKo.trim()) {
        const r = await translateMut.mutateAsync({
          data: {
            sourceText: ko.titleKo,
            sourceLang: "ko",
            targetLangs: TARGET_LANGS,
            context: "marketing banner headline",
            format: "text",
          },
        });
        for (const t of r.translations) {
          if (t.lang === "ko") continue;
          next = { ...next, [TITLE_KEY[t.lang]]: t.text };
        }
      }
      if (ko.descriptionKo.trim()) {
        const r = await translateMut.mutateAsync({
          data: {
            sourceText: ko.descriptionKo,
            sourceLang: "ko",
            targetLangs: TARGET_LANGS,
            context: "marketing banner subheadline",
            format: "text",
          },
        });
        for (const t of r.translations) {
          if (t.lang === "ko") continue;
          next = { ...next, [DESC_KEY[t.lang]]: t.text };
        }
      }
      setForm((f) => ({ ...f, translations: next }));
      toast({ title: "전체 번역 완료" });
    } catch (err) {
      toast({
        title: "번역 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTranslatingFor(null);
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      toast({
        title: "이미지 필수",
        description: "배너 이미지를 업로드하세요.",
        variant: "destructive",
      });
      return;
    }
    if (!form.translations.titleKo.trim()) {
      toast({
        title: "한국어 제목 필수",
        description: "한국어 제목을 입력하세요.",
        variant: "destructive",
      });
      return;
    }
    try {
      if (isNew) {
        await createMut.mutateAsync({ data: form });
        toast({ title: "배너가 생성되었습니다" });
      } else {
        await updateMut.mutateAsync({ id: id!, data: form });
        toast({ title: "배너가 저장되었습니다" });
      }
      await qc.invalidateQueries({ queryKey: getAdminListBannersQueryKey() });
      navigate("/banners");
    } catch (err) {
      toast({
        title: "저장 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <form
      onSubmit={(e) => void onSave(e)}
      className="px-8 py-8 space-y-6 max-w-5xl"
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/banners">
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "신규 배너" : "배너 편집"}
            </h1>
            <p className="text-xs text-muted-foreground">
              랜딩 페이지 풀스크린 슬라이더에 노출됩니다.
            </p>
          </div>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="gap-2"
          data-testid="button-save-banner"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          저장
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">배너 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>배너 이미지 *</Label>
            <ImageUploader
              value={form.imageUrl || null}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url ?? "" }))}
              previewClassName="h-40 w-full max-w-md rounded object-cover bg-muted border border-border"
              testId="upload-banner-image"
            />
            <p className="text-xs text-muted-foreground">
              권장 비율 16:9 또는 21:9. 대형 헤드라인이 잘 보이도록 좌측이 비교적 비어있는 사진을 권장합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="linkUrl">링크 URL (선택)</Label>
              <Input
                id="linkUrl"
                value={form.linkUrl ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    linkUrl: e.target.value.trim() === "" ? null : e.target.value,
                  }))
                }
                placeholder="/products 또는 https://..."
                data-testid="input-link-url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">정렬 순서</Label>
              <Input
                id="sortOrder"
                type="number"
                value={form.sortOrder ?? 0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
                }
                data-testid="input-sort-order"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              id="active"
              checked={form.active}
              onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              data-testid="switch-active"
            />
            <Label htmlFor="active" className="cursor-pointer">
              {form.active ? "게시중" : "비공개"}
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">다국어 콘텐츠</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              한국어로 입력 후 자동 번역으로 4개 언어를 채웁니다. 모두 수동 수정 가능합니다.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => void translateAll()}
            disabled={translatingFor !== null}
            className="gap-2"
            data-testid="button-translate-all"
          >
            {translatingFor === "all" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            KO → 전체 번역
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Lang)}>
            <TabsList className="grid grid-cols-5 w-full">
              {LANGS.map((lang) => {
                const filled =
                  (form.translations[TITLE_KEY[lang]] ?? "").trim().length > 0;
                return (
                  <TabsTrigger
                    key={lang}
                    value={lang}
                    className="gap-1.5"
                    data-testid={`tab-lang-${lang}`}
                  >
                    <span>{LANG_LABEL[lang]}</span>
                    {lang === "ko" ? (
                      <span className="text-[10px] uppercase tracking-wider text-accent font-bold">
                        원문
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          filled ? "bg-accent" : "bg-muted-foreground/30",
                        )}
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {LANGS.map((lang) => {
              const isKo = lang === "ko";
              return (
                <TabsContent
                  key={lang}
                  value={lang}
                  className="mt-4 space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        제목 {isKo && <span className="text-destructive">*</span>}
                      </Label>
                      {isKo && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void translateField(
                              form.translations.titleKo,
                              "marketing banner headline",
                              (l, text) => setT(TITLE_KEY[l], text),
                            )
                          }
                          disabled={translateMut.isPending || translatingFor !== null}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                        >
                          <Sparkles className="h-3 w-3" /> 자동 번역
                        </Button>
                      )}
                    </div>
                    <Input
                      value={form.translations[TITLE_KEY[lang]] ?? ""}
                      onChange={(e) => setT(TITLE_KEY[lang], e.target.value)}
                      placeholder="배너 제목"
                      data-testid={`input-title-${lang}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>설명</Label>
                      {isKo && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void translateField(
                              form.translations.descriptionKo,
                              "marketing banner subheadline",
                              (l, text) => setT(DESC_KEY[l], text),
                            )
                          }
                          disabled={translateMut.isPending || translatingFor !== null}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                        >
                          <Sparkles className="h-3 w-3" /> 자동 번역
                        </Button>
                      )}
                    </div>
                    <Textarea
                      rows={3}
                      value={form.translations[DESC_KEY[lang]] ?? ""}
                      onChange={(e) => setT(DESC_KEY[lang], e.target.value)}
                      placeholder="배너 설명 (선택)"
                      data-testid={`input-description-${lang}`}
                    />
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </form>
  );
}
