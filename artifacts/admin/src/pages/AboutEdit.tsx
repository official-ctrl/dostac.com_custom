import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminGetAbout,
  useAdminUpdateAbout,
  useAdminTranslate,
  getAdminGetAboutQueryKey,
  type AboutContent,
  type HistoryItem,
  type WorldwideItem,
} from "@workspace/api-client-react";
import { Loader2, Save, Sparkles, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUploader } from "@/components/ImageUploader";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/langs";

const TARGET_LANGS: Lang[] = ["en", "ja", "zh", "vi"];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const langKey = <P extends string>(prefix: P, lang: Lang) =>
  `${prefix}${cap(lang)}` as `${P}${"Ko" | "En" | "Ja" | "Zh" | "Vi"}`;

function emptyAbout(): AboutContent {
  return {
    greetingImageUrl: null,
    greetingMessageKo: "",
    greetingMessageEn: "",
    greetingMessageJa: "",
    greetingMessageZh: "",
    greetingMessageVi: "",
    greetingSignatureKo: "",
    greetingSignatureEn: "",
    greetingSignatureJa: "",
    greetingSignatureZh: "",
    greetingSignatureVi: "",
    historyItems: [],
    worldwideImageUrl: null,
    worldwideIntroKo: "",
    worldwideIntroEn: "",
    worldwideIntroJa: "",
    worldwideIntroZh: "",
    worldwideIntroVi: "",
    worldwideItems: [],
    directionsAddressKo: "",
    directionsAddressEn: "",
    directionsAddressJa: "",
    directionsAddressZh: "",
    directionsAddressVi: "",
    directionsMapEmbed: null,
    directionsImageUrl: null,
  };
}

function newHistoryItem(): HistoryItem {
  return { year: "", textKo: "", textEn: "", textJa: "", textZh: "", textVi: "" };
}

function newWorldwideItem(): WorldwideItem {
  return {
    imageUrl: null,
    region: "",
    titleKo: "", titleEn: "", titleJa: "", titleZh: "", titleVi: "",
    descriptionKo: "", descriptionEn: "", descriptionJa: "", descriptionZh: "", descriptionVi: "",
  };
}

export default function AboutEdit() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: existing, isLoading } = useAdminGetAbout();
  const updateMut = useAdminUpdateAbout();
  const translateMut = useAdminTranslate();

  const [form, setForm] = useState<AboutContent>(emptyAbout());
  const [activeSection, setActiveSection] = useState<
    "greeting" | "history" | "worldwide" | "directions"
  >("greeting");
  const [activeLang, setActiveLang] = useState<Lang>("ko");
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    if (existing) setForm({ ...emptyAbout(), ...existing });
  }, [existing]);

  const setField = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const translateOne = async (
    sourceText: string,
    context: string,
    format: "text" | "html",
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
      const r = await translateMut.mutateAsync({
        data: {
          sourceText,
          sourceLang: "ko",
          targetLangs: TARGET_LANGS,
          context,
          format,
        },
      });
      for (const t of r.translations) {
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

  const translateGreetingMessage = () =>
    translateOne(
      form.greetingMessageKo,
      "company greeting message (HTML rich text)",
      "html",
      (lang, text) => setForm((f) => ({ ...f, [langKey("greetingMessage", lang)]: text })),
    );
  const translateGreetingSignature = () =>
    translateOne(
      form.greetingSignatureKo,
      "CEO/management signature line",
      "text",
      (lang, text) => setForm((f) => ({ ...f, [langKey("greetingSignature", lang)]: text })),
    );
  const translateWorldwideIntro = () =>
    translateOne(
      form.worldwideIntroKo,
      "global network introduction sentence",
      "text",
      (lang, text) => setForm((f) => ({ ...f, [langKey("worldwideIntro", lang)]: text })),
    );
  const translateDirectionsAddress = () =>
    translateOne(
      form.directionsAddressKo,
      "company headquarters / factory street address",
      "text",
      (lang, text) => setForm((f) => ({ ...f, [langKey("directionsAddress", lang)]: text })),
    );

  // History helpers
  const addHistoryItem = () =>
    setForm((f) => ({ ...f, historyItems: [...f.historyItems, newHistoryItem()] }));
  const removeHistoryItem = (i: number) =>
    setForm((f) => ({
      ...f,
      historyItems: f.historyItems.filter((_, idx) => idx !== i),
    }));
  const updateHistoryItem = (i: number, patch: Partial<HistoryItem>) =>
    setForm((f) => ({
      ...f,
      historyItems: f.historyItems.map((h, idx) => (idx === i ? { ...h, ...patch } : h)),
    }));
  const translateHistoryItem = async (i: number) => {
    const it = form.historyItems[i];
    if (!it) return;
    await translateOne(
      it.textKo,
      "company history milestone description",
      "text",
      (lang, text) => updateHistoryItem(i, { [langKey("text", lang)]: text } as Partial<HistoryItem>),
    );
  };

  // Worldwide helpers
  const addWorldwideItem = () =>
    setForm((f) => ({ ...f, worldwideItems: [...f.worldwideItems, newWorldwideItem()] }));
  const removeWorldwideItem = (i: number) =>
    setForm((f) => ({
      ...f,
      worldwideItems: f.worldwideItems.filter((_, idx) => idx !== i),
    }));
  const updateWorldwideItem = (i: number, patch: Partial<WorldwideItem>) =>
    setForm((f) => ({
      ...f,
      worldwideItems: f.worldwideItems.map((w, idx) => (idx === i ? { ...w, ...patch } : w)),
    }));
  const translateWorldwideItemTitle = async (i: number) => {
    const it = form.worldwideItems[i];
    if (!it) return;
    await translateOne(
      it.titleKo,
      "regional market title (e.g. Southeast Asia)",
      "text",
      (lang, text) =>
        updateWorldwideItem(i, { [langKey("title", lang)]: text } as Partial<WorldwideItem>),
    );
  };
  const translateWorldwideItemDesc = async (i: number) => {
    const it = form.worldwideItems[i];
    if (!it) return;
    await translateOne(
      it.descriptionKo,
      "regional market description, partnerships and channels",
      "text",
      (lang, text) =>
        updateWorldwideItem(i, { [langKey("description", lang)]: text } as Partial<WorldwideItem>),
    );
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.greetingMessageKo.trim()) {
      toast({
        title: "한국어 인사말 필수",
        description: "한국어 인사말 본문을 입력하세요.",
        variant: "destructive",
      });
      setActiveSection("greeting");
      setActiveLang("ko");
      return;
    }
    try {
      await updateMut.mutateAsync({ data: form });
      await qc.invalidateQueries({ queryKey: getAdminGetAboutQueryKey() });
      toast({ title: "회사소개가 저장되었습니다" });
    } catch (err) {
      toast({
        title: "저장 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const saving = updateMut.isPending;

  const sectionLabels: Record<typeof activeSection, string> = useMemo(
    () => ({
      greeting: "인사말",
      history: "회사 연혁",
      worldwide: "글로벌 네트워크",
      directions: "오시는 길",
    }),
    [],
  );

  return (
    <form onSubmit={(e) => void onSave(e)} className="px-8 py-8 space-y-6 max-w-6xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">회사소개 (About)</h1>
          <p className="text-xs text-muted-foreground">
            인사말 / 연혁 / 글로벌 네트워크 / 오시는 길 4개 섹션을 5개 언어로 관리합니다.
          </p>
        </div>
        <Button
          type="submit"
          disabled={saving || bulkBusy}
          className="gap-2"
          data-testid="button-save-about"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          저장
        </Button>
      </header>

      <Tabs
        value={activeSection}
        onValueChange={(v) => setActiveSection(v as typeof activeSection)}
      >
        <TabsList className="grid grid-cols-4 w-full">
          {(Object.keys(sectionLabels) as Array<keyof typeof sectionLabels>).map((k) => (
            <TabsTrigger
              key={k}
              value={k}
              data-testid={`section-tab-${k}`}
            >
              {sectionLabels[k]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* GREETING */}
        <TabsContent value="greeting" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">대표 인사말</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>대표 사진</Label>
                <ImageUploader
                  value={form.greetingImageUrl ?? null}
                  onChange={(url) => setField("greetingImageUrl", url ?? null)}
                  previewClassName="h-48 w-40 rounded object-cover bg-muted border border-border"
                  testId="upload-greeting-image"
                />
              </div>

              <LangTabs
                activeLang={activeLang}
                onChange={setActiveLang}
                filledFor={(l) => (form[langKey("greetingMessage", l)] as string).trim().length > 0}
              >
                {(lang) => (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>인사말 본문 {lang === "ko" && <span className="text-destructive">*</span>}</Label>
                        {lang === "ko" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void translateGreetingMessage()}
                            disabled={translateMut.isPending}
                            className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                            data-testid="translate-greeting-message"
                          >
                            <Sparkles className="h-3 w-3" /> 자동 번역
                          </Button>
                        )}
                      </div>
                      <RichTextEditor
                        value={(form[langKey("greetingMessage", lang)] as string) ?? ""}
                        onChange={(html) =>
                          setField(langKey("greetingMessage", lang), html)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>서명 (예: dostac CEO)</Label>
                        {lang === "ko" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void translateGreetingSignature()}
                            disabled={translateMut.isPending}
                            className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                          >
                            <Sparkles className="h-3 w-3" /> 자동 번역
                          </Button>
                        )}
                      </div>
                      <Input
                        value={(form[langKey("greetingSignature", lang)] as string) ?? ""}
                        onChange={(e) =>
                          setField(langKey("greetingSignature", lang), e.target.value)
                        }
                        data-testid={`input-greeting-signature-${lang}`}
                      />
                    </div>
                  </div>
                )}
              </LangTabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HISTORY */}
        <TabsContent value="history" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">회사 연혁</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  연도와 마일스톤을 5개 언어로 관리합니다. 항목을 추가/삭제할 수 있습니다.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addHistoryItem}
                className="gap-2"
                data-testid="add-history-item"
              >
                <Plus className="h-4 w-4" /> 항목 추가
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.historyItems.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  아직 항목이 없습니다.
                </p>
              )}
              {form.historyItems.map((h, i) => (
                <div
                  key={i}
                  className="border rounded-md p-4 space-y-3"
                  data-testid={`history-item-${i}`}
                >
                  <div className="flex items-end justify-between gap-3">
                    <div className="w-32 space-y-1">
                      <Label>연도</Label>
                      <Input
                        value={h.year}
                        onChange={(e) => updateHistoryItem(i, { year: e.target.value })}
                        placeholder="2024"
                        data-testid={`history-year-${i}`}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void translateHistoryItem(i)}
                      disabled={translateMut.isPending}
                      className="h-8 gap-1.5 text-xs text-accent hover:text-accent"
                    >
                      <Sparkles className="h-3 w-3" /> KO → 4개 언어
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeHistoryItem(i)}
                      className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" /> 삭제
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {LANGS.map((lang) => (
                      <div key={lang} className="space-y-1">
                        <Label className="text-xs uppercase tracking-wider">{LANG_LABEL[lang]}</Label>
                        <Textarea
                          rows={3}
                          value={h[langKey("text", lang) as keyof HistoryItem] as string}
                          onChange={(e) =>
                            updateHistoryItem(i, {
                              [langKey("text", lang)]: e.target.value,
                            } as Partial<HistoryItem>)
                          }
                          placeholder={lang === "ko" ? "마일스톤 설명" : ""}
                          data-testid={`history-text-${i}-${lang}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WORLDWIDE */}
        <TabsContent value="worldwide" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">글로벌 네트워크 — 헤더</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>대표 이미지 (지도/공장 외관 등)</Label>
                <ImageUploader
                  value={form.worldwideImageUrl ?? null}
                  onChange={(url) => setField("worldwideImageUrl", url ?? null)}
                  previewClassName="h-48 w-full max-w-2xl rounded object-cover bg-muted border border-border"
                  testId="upload-worldwide-image"
                />
              </div>
              <LangTabs
                activeLang={activeLang}
                onChange={setActiveLang}
                filledFor={(l) => (form[langKey("worldwideIntro", l)] as string).trim().length > 0}
              >
                {(lang) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>소개 문구</Label>
                      {lang === "ko" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void translateWorldwideIntro()}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                        >
                          <Sparkles className="h-3 w-3" /> 자동 번역
                        </Button>
                      )}
                    </div>
                    <Textarea
                      rows={3}
                      value={(form[langKey("worldwideIntro", lang)] as string) ?? ""}
                      onChange={(e) => setField(langKey("worldwideIntro", lang), e.target.value)}
                      placeholder="글로벌 30개국 파트너와 함께…"
                      data-testid={`input-worldwide-intro-${lang}`}
                    />
                  </div>
                )}
              </LangTabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">지역별 거점</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  지역(영문) + 5개 언어 제목/설명 + 선택 이미지.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addWorldwideItem}
                className="gap-2"
                data-testid="add-worldwide-item"
              >
                <Plus className="h-4 w-4" /> 거점 추가
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {form.worldwideItems.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  거점이 등록되어 있지 않습니다.
                </p>
              )}
              {form.worldwideItems.map((w, i) => (
                <div
                  key={i}
                  className="border rounded-md p-4 space-y-4"
                  data-testid={`worldwide-item-${i}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1 md:col-span-2">
                      <Label>지역 코드 (영문, 예: Southeast Asia)</Label>
                      <Input
                        value={w.region}
                        onChange={(e) => updateWorldwideItem(i, { region: e.target.value })}
                        placeholder="Southeast Asia"
                        data-testid={`worldwide-region-${i}`}
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeWorldwideItem(i)}
                        className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" /> 삭제
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>이미지 (선택)</Label>
                    <ImageUploader
                      value={w.imageUrl ?? null}
                      onChange={(url) => updateWorldwideItem(i, { imageUrl: url ?? null })}
                      previewClassName="h-32 w-full max-w-md rounded object-cover bg-muted border border-border"
                      testId={`upload-worldwide-${i}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>제목 (5개 언어)</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void translateWorldwideItemTitle(i)}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                        >
                          <Sparkles className="h-3 w-3" /> KO → 4개 언어
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        {LANGS.map((lang) => (
                          <Input
                            key={lang}
                            value={w[langKey("title", lang) as keyof WorldwideItem] as string}
                            onChange={(e) =>
                              updateWorldwideItem(i, {
                                [langKey("title", lang)]: e.target.value,
                              } as Partial<WorldwideItem>)
                            }
                            placeholder={`${LANG_LABEL[lang]} 제목`}
                            data-testid={`worldwide-title-${i}-${lang}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>설명 (5개 언어)</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void translateWorldwideItemDesc(i)}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                        >
                          <Sparkles className="h-3 w-3" /> KO → 4개 언어
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        {LANGS.map((lang) => (
                          <Textarea
                            key={lang}
                            rows={2}
                            value={
                              w[langKey("description", lang) as keyof WorldwideItem] as string
                            }
                            onChange={(e) =>
                              updateWorldwideItem(i, {
                                [langKey("description", lang)]: e.target.value,
                              } as Partial<WorldwideItem>)
                            }
                            placeholder={`${LANG_LABEL[lang]} 설명`}
                            data-testid={`worldwide-desc-${i}-${lang}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIRECTIONS */}
        <TabsContent value="directions" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">오시는 길</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Google Maps Embed URL</Label>
                  <Input
                    value={form.directionsMapEmbed ?? ""}
                    onChange={(e) =>
                      setField("directionsMapEmbed", e.target.value.trim() || null)
                    }
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    data-testid="input-directions-map"
                  />
                  <p className="text-xs text-muted-foreground">
                    Google Maps에서 공유 → 지도 퍼가기 → iframe의 <code>src</code> URL을 붙여넣으세요.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>대체 이미지 (Maps 사용 안 할 때)</Label>
                  <ImageUploader
                    value={form.directionsImageUrl ?? null}
                    onChange={(url) => setField("directionsImageUrl", url ?? null)}
                    previewClassName="h-32 w-full max-w-md rounded object-cover bg-muted border border-border"
                    testId="upload-directions-image"
                  />
                </div>
              </div>

              <LangTabs
                activeLang={activeLang}
                onChange={setActiveLang}
                filledFor={(l) =>
                  (form[langKey("directionsAddress", l)] as string).trim().length > 0
                }
              >
                {(lang) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>주소</Label>
                      {lang === "ko" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void translateDirectionsAddress()}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                        >
                          <Sparkles className="h-3 w-3" /> 자동 번역
                        </Button>
                      )}
                    </div>
                    <Textarea
                      rows={2}
                      value={(form[langKey("directionsAddress", lang)] as string) ?? ""}
                      onChange={(e) =>
                        setField(langKey("directionsAddress", lang), e.target.value)
                      }
                      placeholder="경기도 안성시 …"
                      data-testid={`input-directions-address-${lang}`}
                    />
                  </div>
                )}
              </LangTabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}

function LangTabs({
  activeLang,
  onChange,
  filledFor,
  children,
}: {
  activeLang: Lang;
  onChange: (l: Lang) => void;
  filledFor: (l: Lang) => boolean;
  children: (lang: Lang) => React.ReactNode;
}) {
  return (
    <Tabs value={activeLang} onValueChange={(v) => onChange(v as Lang)}>
      <TabsList className="grid grid-cols-5 w-full">
        {LANGS.map((lang) => (
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
                className={`h-1.5 w-1.5 rounded-full ${
                  filledFor(lang) ? "bg-accent" : "bg-muted-foreground/30"
                }`}
              />
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {LANGS.map((lang) => (
        <TabsContent key={lang} value={lang} className="mt-4">
          {children(lang)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
