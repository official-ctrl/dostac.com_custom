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
  type WhyDostacItem,
} from "@workspace/api-client-react";
import { Loader2, Save, Sparkles, Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
    companyDescKo: "",
    companyDescEn: "",
    companyDescJa: "",
    companyDescZh: "",
    companyDescVi: "",
    whyDostacItems: [],
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

function newWhyDostacItem(sortOrder: number): WhyDostacItem {
  return {
    titleKo: "", titleEn: "", titleJa: "", titleZh: "", titleVi: "",
    descKo: "", descEn: "", descJa: "", descZh: "", descVi: "",
    active: true,
    sortOrder,
  };
}

/* ─── LangTabs helper ─────────────────────────────────────────── */
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
      <TabsList className="h-8 mb-3">
        {LANGS.map((l) => (
          <TabsTrigger key={l} value={l} className="h-7 px-3 text-xs gap-1">
            {LANG_LABEL[l]}
            {filledFor(l) && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
          </TabsTrigger>
        ))}
      </TabsList>
      {LANGS.map((l) => (
        <TabsContent key={l} value={l}>
          {children(l)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
export default function AboutEdit() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: existing, isLoading } = useAdminGetAbout();
  const updateMut = useAdminUpdateAbout();
  const translateMut = useAdminTranslate();

  const [form, setForm] = useState<AboutContent>(emptyAbout());
  const [activeSection, setActiveSection] = useState<
    "greeting" | "company" | "why" | "history" | "directions"
  >("greeting");
  const [activeLang, setActiveLang] = useState<Lang>("ko");

  useEffect(() => {
    if (existing) setForm({ ...emptyAbout(), ...existing });
  }, [existing]);

  const setField = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  /* ─── translate helper ──────────────────────────────────────── */
  const translateOne = async (
    sourceText: string,
    context: string,
    format: "text" | "html",
    apply: (lang: Lang, text: string) => void,
  ) => {
    if (!sourceText.trim()) {
      toast({ title: "한국어 원문이 없습니다", description: "먼저 한국어 내용을 입력하세요.", variant: "destructive" });
      return;
    }
    try {
      const r = await translateMut.mutateAsync({
        data: { sourceText, sourceLang: "ko", targetLangs: TARGET_LANGS, context, format },
      });
      for (const t of r.translations) {
        if (t.lang === "ko") continue;
        apply(t.lang, t.text);
      }
      toast({ title: "번역 완료", description: context });
    } catch (err) {
      toast({ title: "번역 실패", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const translateGreetingMessage = () =>
    translateOne(form.greetingMessageKo, "company greeting message (HTML rich text)", "html",
      (lang, text) => setForm((f) => ({ ...f, [langKey("greetingMessage", lang)]: text })));

  const translateGreetingSignature = () =>
    translateOne(form.greetingSignatureKo, "CEO/management signature line", "text",
      (lang, text) => setForm((f) => ({ ...f, [langKey("greetingSignature", lang)]: text })));

  const translateCompanyDesc = () =>
    translateOne(form.companyDescKo, "company introduction / about us description", "text",
      (lang, text) => setForm((f) => ({ ...f, [langKey("companyDesc", lang)]: text })));

  const translateWorldwideIntro = () =>
    translateOne(form.worldwideIntroKo, "global network introduction sentence", "text",
      (lang, text) => setForm((f) => ({ ...f, [langKey("worldwideIntro", lang)]: text })));

  const translateDirectionsAddress = () =>
    translateOne(form.directionsAddressKo, "company headquarters / factory street address", "text",
      (lang, text) => setForm((f) => ({ ...f, [langKey("directionsAddress", lang)]: text })));

  /* ─── History helpers ───────────────────────────────────────── */
  const addHistoryItem = () =>
    setForm((f) => ({ ...f, historyItems: [...f.historyItems, newHistoryItem()] }));
  const removeHistoryItem = (i: number) =>
    setForm((f) => ({ ...f, historyItems: f.historyItems.filter((_, idx) => idx !== i) }));
  const updateHistoryItem = (i: number, patch: Partial<HistoryItem>) =>
    setForm((f) => ({ ...f, historyItems: f.historyItems.map((h, idx) => (idx === i ? { ...h, ...patch } : h)) }));
  const translateHistoryItem = async (i: number) => {
    const it = form.historyItems[i];
    if (!it) return;
    await translateOne(it.textKo, "company history milestone description", "text",
      (lang, text) => updateHistoryItem(i, { [langKey("text", lang)]: text } as Partial<HistoryItem>));
  };

  /* ─── Worldwide helpers ─────────────────────────────────────── */
  const addWorldwideItem = () =>
    setForm((f) => ({ ...f, worldwideItems: [...f.worldwideItems, newWorldwideItem()] }));
  const removeWorldwideItem = (i: number) =>
    setForm((f) => ({ ...f, worldwideItems: f.worldwideItems.filter((_, idx) => idx !== i) }));
  const updateWorldwideItem = (i: number, patch: Partial<WorldwideItem>) =>
    setForm((f) => ({ ...f, worldwideItems: f.worldwideItems.map((w, idx) => (idx === i ? { ...w, ...patch } : w)) }));
  const translateWorldwideItemTitle = async (i: number) => {
    const it = form.worldwideItems[i];
    if (!it) return;
    await translateOne(it.titleKo, "regional market title (e.g. Southeast Asia)", "text",
      (lang, text) => updateWorldwideItem(i, { [langKey("title", lang)]: text } as Partial<WorldwideItem>));
  };
  const translateWorldwideItemDesc = async (i: number) => {
    const it = form.worldwideItems[i];
    if (!it) return;
    await translateOne(it.descriptionKo, "regional market description, partnerships and channels", "text",
      (lang, text) => updateWorldwideItem(i, { [langKey("description", lang)]: text } as Partial<WorldwideItem>));
  };

  /* ─── Why Dostac helpers ────────────────────────────────────── */
  const addWhyItem = () =>
    setForm((f) => ({ ...f, whyDostacItems: [...f.whyDostacItems, newWhyDostacItem(f.whyDostacItems.length)] }));
  const removeWhyItem = (i: number) =>
    setForm((f) => ({ ...f, whyDostacItems: f.whyDostacItems.filter((_, idx) => idx !== i).map((it, idx) => ({ ...it, sortOrder: idx })) }));
  const updateWhyItem = (i: number, patch: Partial<WhyDostacItem>) =>
    setForm((f) => ({ ...f, whyDostacItems: f.whyDostacItems.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }));
  const toggleWhyActive = (i: number) =>
    updateWhyItem(i, { active: !form.whyDostacItems[i]?.active });
  const translateWhyItem = async (i: number) => {
    const it = form.whyDostacItems[i];
    if (!it) return;
    await translateOne(it.titleKo, "Why Dostac card title — short B2B benefit phrase", "text",
      (lang, text) => updateWhyItem(i, { [langKey("title", lang)]: text } as Partial<WhyDostacItem>));
    if (it.descKo.trim()) {
      await translateOne(it.descKo, "Why Dostac card description — 1~2 sentence benefit explanation", "text",
        (lang, text) => updateWhyItem(i, { [langKey("desc", lang)]: text } as Partial<WhyDostacItem>));
    }
  };

  /* ─── Save ──────────────────────────────────────────────────── */
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMut.mutateAsync({ data: form });
      await qc.invalidateQueries({ queryKey: getAdminGetAboutQueryKey() });
      toast({ title: "회사소개가 저장되었습니다" });
    } catch (err) {
      toast({ title: "저장 실패", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const saving = updateMut.isPending;

  const sectionLabels = useMemo(() => ({
    greeting: "인사말",
    company: "회사소개",
    why: "Why Dostac",
    history: "연혁",
    directions: "오시는 길",
  }), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSave(e)} className="px-8 py-8 space-y-6 max-w-6xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">회사소개 (About)</h1>
          <p className="text-xs text-muted-foreground">
            인사말 · 회사소개 · Why Dostac · 연혁 · 오시는 길 — 5개 언어로 관리합니다.
          </p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2" data-testid="button-save-about">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          저장
        </Button>
      </header>

      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as typeof activeSection)}>
        <TabsList className="grid grid-cols-5 w-full">
          {(Object.keys(sectionLabels) as Array<keyof typeof sectionLabels>).map((k) => (
            <TabsTrigger key={k} value={k} data-testid={`section-tab-${k}`}>
              {sectionLabels[k]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─── GREETING ─────────────────────────────────────────── */}
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
                        <Label>인사말 본문</Label>
                        {lang === "ko" && (
                          <Button type="button" size="sm" variant="ghost"
                            onClick={() => void translateGreetingMessage()}
                            disabled={translateMut.isPending}
                            className="h-7 gap-1.5 text-xs text-accent hover:text-accent">
                            <Sparkles className="h-3 w-3" /> KO → 4개 언어 자동 번역
                          </Button>
                        )}
                      </div>
                      <RichTextEditor
                        value={(form[langKey("greetingMessage", lang)] as string) ?? ""}
                        onChange={(html) => setField(langKey("greetingMessage", lang), html)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>서명 (예: CEO, Dostac)</Label>
                        {lang === "ko" && (
                          <Button type="button" size="sm" variant="ghost"
                            onClick={() => void translateGreetingSignature()}
                            disabled={translateMut.isPending}
                            className="h-7 gap-1.5 text-xs text-accent hover:text-accent">
                            <Sparkles className="h-3 w-3" /> 자동 번역
                          </Button>
                        )}
                      </div>
                      <Input
                        value={(form[langKey("greetingSignature", lang)] as string) ?? ""}
                        onChange={(e) => setField(langKey("greetingSignature", lang), e.target.value)}
                        placeholder="CEO, Dostac"
                        data-testid={`input-greeting-signature-${lang}`}
                      />
                    </div>
                  </div>
                )}
              </LangTabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── COMPANY DESC ──────────────────────────────────────── */}
        <TabsContent value="company" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">회사소개 (About Dostac)</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                About 페이지의 철학/회사 소개 섹션에 표시되는 설명 문구입니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <LangTabs
                activeLang={activeLang}
                onChange={setActiveLang}
                filledFor={(l) => (form[langKey("companyDesc", l)] as string).trim().length > 0}
              >
                {(lang) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>회사 소개 문구 ({LANG_LABEL[lang]})</Label>
                      {lang === "ko" && (
                        <Button type="button" size="sm" variant="ghost"
                          onClick={() => void translateCompanyDesc()}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent">
                          <Sparkles className="h-3 w-3" /> KO → 4개 언어 자동 번역
                        </Button>
                      )}
                    </div>
                    <Textarea
                      rows={8}
                      value={(form[langKey("companyDesc", lang)] as string) ?? ""}
                      onChange={(e) => setField(langKey("companyDesc", lang), e.target.value)}
                      placeholder={lang === "ko"
                        ? "Dostac는 한국 기반의 글로벌 소싱 및 무역 회사로, K-뷰티, 화장품 OEM/ODM, 프라이빗 라벨 개발 및 국제 이커머스 유통을 전문으로 합니다."
                        : ""}
                      data-testid={`input-company-desc-${lang}`}
                    />
                  </div>
                )}
              </LangTabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">OUR STORY — 이미지 &amp; 6가지 강점</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  About 페이지 "OUR STORY" 섹션의 우측 이미지, 소개 설명, 강점 카드(최대 6개)를 관리합니다.
                </p>
              </div>
              <Button
                type="button" size="sm" variant="outline"
                onClick={() => { if (form.worldwideItems.length < 6) addWorldwideItem(); }}
                disabled={form.worldwideItems.length >= 6}
                className="gap-2 shrink-0" data-testid="add-worldwide-item"
              >
                <Plus className="h-4 w-4" />
                강점 추가 ({form.worldwideItems.length}/6)
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Section image */}
              <div className="space-y-2">
                <Label>섹션 우측 이미지</Label>
                <ImageUploader
                  value={form.worldwideImageUrl ?? null}
                  onChange={(url) => setField("worldwideImageUrl", url ?? null)}
                  previewClassName="h-52 w-full max-w-2xl rounded-xl object-cover bg-muted border border-border"
                  testId="upload-worldwide-image"
                />
                <p className="text-xs text-muted-foreground">비워두면 기본 이미지가 사용됩니다.</p>
              </div>

              {/* Intro description */}
              <LangTabs
                activeLang={activeLang}
                onChange={setActiveLang}
                filledFor={(l) => (form[langKey("worldwideIntro", l)] as string).trim().length > 0}
              >
                {(lang) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>소개 설명 ({LANG_LABEL[lang]})</Label>
                      {lang === "ko" && (
                        <Button type="button" size="sm" variant="ghost"
                          onClick={() => void translateWorldwideIntro()}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent">
                          <Sparkles className="h-3 w-3" /> KO → 4개 언어 자동 번역
                        </Button>
                      )}
                    </div>
                    <Textarea
                      rows={3}
                      value={(form[langKey("worldwideIntro", lang)] as string) ?? ""}
                      onChange={(e) => setField(langKey("worldwideIntro", lang), e.target.value)}
                      placeholder={lang === "ko"
                        ? "Dostac는 화장품 유통, 온라인 커머스, 글로벌 소싱의 실제 경험을 바탕으로 설립되었습니다.\n\n약 20년간 뷰티 및 이커머스 산업 전반에 걸쳐 다음 분야에서 활동해왔습니다:"
                        : ""}
                      data-testid={`input-worldwide-intro-${lang}`}
                    />
                  </div>
                )}
              </LangTabs>

              {/* 6 strength cards */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold">6가지 강점 카드</Label>
                  <span className="text-xs text-muted-foreground">(제목만 입력해도 됩니다 — 아이콘은 순서에 따라 자동 지정)</span>
                </div>
                {form.worldwideItems.length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">강점 카드가 없습니다.</p>
                    <Button type="button" size="sm" variant="outline" onClick={addWorldwideItem} className="gap-2">
                      <Plus className="h-4 w-4" /> 첫 번째 강점 추가
                    </Button>
                  </div>
                )}
                {form.worldwideItems.map((w, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3" data-testid={`worldwide-item-${i}`}>
                    {/* Card header */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono shrink-0">#{i + 1}</Badge>
                      <p className="text-sm font-medium flex-1 truncate">
                        {w.titleKo || <span className="text-muted-foreground italic">제목 없음</span>}
                      </p>
                      <Button type="button" size="sm" variant="ghost"
                        onClick={() => void translateWorldwideItemTitle(i)}
                        disabled={translateMut.isPending}
                        className="h-7 gap-1.5 text-xs text-accent hover:text-accent shrink-0">
                        <Sparkles className="h-3 w-3" /> KO → 4개 언어
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeWorldwideItem(i)}
                        className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive shrink-0">
                        <Trash2 className="h-3 w-3" /> 삭제
                      </Button>
                    </div>

                    {/* Title fields (5 langs, inline) */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {LANGS.map((lang) => (
                        <div key={lang} className="space-y-1">
                          <Label className="text-xs font-mono text-muted-foreground">{lang.toUpperCase()}</Label>
                          <Input
                            value={w[langKey("title", lang) as keyof WorldwideItem] as string}
                            onChange={(e) => updateWorldwideItem(i, { [langKey("title", lang)]: e.target.value } as Partial<WorldwideItem>)}
                            placeholder={lang === "ko" ? "강점 제목" : ""}
                            data-testid={`worldwide-title-${i}-${lang}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── WHY DOSTAC ───────────────────────────────────────── */}
        <TabsContent value="why" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Why Dostac 카드</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  About 페이지의 "Why Dostac" 섹션에 표시되는 특장점 카드를 관리합니다.
                  카드를 추가/수정/삭제하고 5개 언어로 자동 번역할 수 있습니다.
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addWhyItem} className="gap-2" data-testid="add-why-item">
                <Plus className="h-4 w-4" /> 카드 추가
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.whyDostacItems.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">등록된 카드가 없습니다.</p>
                  <Button type="button" size="sm" variant="outline" onClick={addWhyItem} className="gap-2">
                    <Plus className="h-4 w-4" /> 첫 번째 카드 추가
                  </Button>
                </div>
              )}
              {form.whyDostacItems.map((item, i) => (
                <div
                  key={i}
                  className={`border rounded-lg p-5 space-y-4 transition-opacity ${item.active ? "" : "opacity-60"}`}
                  data-testid={`why-item-${i}`}
                >
                  {/* Card header row */}
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Badge variant="outline" className="text-xs font-mono">#{i + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.titleKo || <span className="text-muted-foreground italic">제목 없음</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button type="button" size="sm" variant="ghost"
                        onClick={() => void translateWhyItem(i)}
                        disabled={translateMut.isPending}
                        className="h-8 gap-1.5 text-xs text-accent hover:text-accent">
                        <Sparkles className="h-3 w-3" /> KO → 4개 언어
                      </Button>
                      <button
                        type="button"
                        onClick={() => toggleWhyActive(i)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                        title={item.active ? "비활성화" : "활성화"}
                      >
                        {item.active
                          ? <><Eye className="h-3.5 w-3.5" /> 표시</>
                          : <><EyeOff className="h-3.5 w-3.5" /> 숨김</>
                        }
                      </button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeWhyItem(i)}
                        className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" /> 삭제
                      </Button>
                    </div>
                  </div>

                  {/* Title + Desc per lang */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Titles */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">제목 (5개 언어)</Label>
                      <div className="space-y-2">
                        {LANGS.map((lang) => (
                          <div key={lang} className="flex gap-2 items-center">
                            <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">{lang.toUpperCase()}</span>
                            <Input
                              value={item[langKey("title", lang) as keyof WhyDostacItem] as string}
                              onChange={(e) => updateWhyItem(i, { [langKey("title", lang)]: e.target.value } as Partial<WhyDostacItem>)}
                              placeholder={lang === "ko" ? "카드 제목 (예: 한국 제조 네트워크)" : ""}
                              data-testid={`why-title-${i}-${lang}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">설명 (5개 언어)</Label>
                      <div className="space-y-2">
                        {LANGS.map((lang) => (
                          <div key={lang} className="flex gap-2 items-start">
                            <span className="text-xs font-mono text-muted-foreground w-6 shrink-0 mt-2">{lang.toUpperCase()}</span>
                            <Textarea
                              rows={2}
                              value={item[langKey("desc", lang) as keyof WhyDostacItem] as string}
                              onChange={(e) => updateWhyItem(i, { [langKey("desc", lang)]: e.target.value } as Partial<WhyDostacItem>)}
                              placeholder={lang === "ko" ? "짧은 혜택 설명 (1~2문장)" : ""}
                              data-testid={`why-desc-${i}-${lang}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── HISTORY ──────────────────────────────────────────── */}
        <TabsContent value="history" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">회사 연혁</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  연도와 마일스톤을 5개 언어로 관리합니다.
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addHistoryItem} className="gap-2" data-testid="add-history-item">
                <Plus className="h-4 w-4" /> 항목 추가
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.historyItems.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">아직 항목이 없습니다.</p>
              )}
              {form.historyItems.map((h, i) => (
                <div key={i} className="border rounded-md p-4 space-y-3" data-testid={`history-item-${i}`}>
                  <div className="flex items-end justify-between gap-3">
                    <div className="w-32 space-y-1">
                      <Label>연도</Label>
                      <Input value={h.year} onChange={(e) => updateHistoryItem(i, { year: e.target.value })}
                        placeholder="2024" data-testid={`history-year-${i}`} />
                    </div>
                    <Button type="button" size="sm" variant="ghost"
                      onClick={() => void translateHistoryItem(i)}
                      disabled={translateMut.isPending}
                      className="h-8 gap-1.5 text-xs text-accent hover:text-accent">
                      <Sparkles className="h-3 w-3" /> KO → 4개 언어
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeHistoryItem(i)}
                      className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" /> 삭제
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {LANGS.map((lang) => (
                      <div key={lang} className="space-y-1">
                        <Label className="text-xs uppercase tracking-wider">{LANG_LABEL[lang]}</Label>
                        <Textarea rows={3}
                          value={h[langKey("text", lang) as keyof HistoryItem] as string}
                          onChange={(e) => updateHistoryItem(i, { [langKey("text", lang)]: e.target.value } as Partial<HistoryItem>)}
                          placeholder={lang === "ko" ? "마일스톤 설명" : ""}
                          data-testid={`history-text-${i}-${lang}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── DIRECTIONS ───────────────────────────────────────── */}
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
                    onChange={(e) => setField("directionsMapEmbed", e.target.value.trim() || null)}
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
                    previewClassName="h-32 w-full max-w-sm rounded object-cover bg-muted border border-border"
                    testId="upload-directions-image"
                  />
                </div>
              </div>

              <LangTabs
                activeLang={activeLang}
                onChange={setActiveLang}
                filledFor={(l) => (form[langKey("directionsAddress", l)] as string).trim().length > 0}
              >
                {(lang) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>주소 ({LANG_LABEL[lang]})</Label>
                      {lang === "ko" && (
                        <Button type="button" size="sm" variant="ghost"
                          onClick={() => void translateDirectionsAddress()}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent">
                          <Sparkles className="h-3 w-3" /> 자동 번역
                        </Button>
                      )}
                    </div>
                    <Textarea
                      rows={3}
                      value={(form[langKey("directionsAddress", lang)] as string) ?? ""}
                      onChange={(e) => setField(langKey("directionsAddress", lang), e.target.value)}
                      placeholder={lang === "ko" ? "경기도 화성시 …" : ""}
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
