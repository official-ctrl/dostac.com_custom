import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminGetProcess,
  useAdminUpdateProcess,
  useAdminTranslate,
  getAdminGetProcessQueryKey,
  type ProcessContent,
  type OemStep,
  type CertItem,
} from "@workspace/api-client-react";
import { Loader2, Save, Sparkles, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUploader } from "@/components/ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/langs";

const TARGET_LANGS: Lang[] = ["en", "ja", "zh", "vi"];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const langKey = <P extends string>(prefix: P, lang: Lang) =>
  `${prefix}${cap(lang)}` as `${P}${"Ko" | "En" | "Ja" | "Zh" | "Vi"}`;

function emptyProcess(): ProcessContent {
  return {
    oemImageUrl: null,
    oemDescriptionKo: "",
    oemDescriptionEn: "",
    oemDescriptionJa: "",
    oemDescriptionZh: "",
    oemDescriptionVi: "",
    oemSteps: [],
    certIntroKo: "",
    certIntroEn: "",
    certIntroJa: "",
    certIntroZh: "",
    certIntroVi: "",
    certItems: [],
  };
}

function newOemStep(): OemStep {
  return {
    titleKo: "", titleEn: "", titleJa: "", titleZh: "", titleVi: "",
    descriptionKo: "", descriptionEn: "", descriptionJa: "", descriptionZh: "", descriptionVi: "",
  };
}

function newCertItem(): CertItem {
  return {
    imageUrl: null,
    code: "",
    nameKo: "", nameEn: "", nameJa: "", nameZh: "", nameVi: "",
    descriptionKo: "", descriptionEn: "", descriptionJa: "", descriptionZh: "", descriptionVi: "",
  };
}

export default function ProcessEdit() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: existing, isLoading } = useAdminGetProcess();
  const updateMut = useAdminUpdateProcess();
  const translateMut = useAdminTranslate();

  const [form, setForm] = useState<ProcessContent>(emptyProcess());
  const [activeSection, setActiveSection] = useState<"oem" | "cert">("oem");
  const [activeLang, setActiveLang] = useState<Lang>("ko");

  useEffect(() => {
    if (existing) setForm({ ...emptyProcess(), ...existing });
  }, [existing]);

  const setField = <K extends keyof ProcessContent>(key: K, value: ProcessContent[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const translateOne = async (
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
      const r = await translateMut.mutateAsync({
        data: {
          sourceText,
          sourceLang: "ko",
          targetLangs: TARGET_LANGS,
          context,
          format: "text",
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

  const translateOemDescription = () =>
    translateOne(
      form.oemDescriptionKo,
      "OEM/ODM section description",
      (lang, text) => setForm((f) => ({ ...f, [langKey("oemDescription", lang)]: text })),
    );

  const translateCertIntro = () =>
    translateOne(
      form.certIntroKo,
      "global certifications intro",
      (lang, text) => setForm((f) => ({ ...f, [langKey("certIntro", lang)]: text })),
    );

  // OEM step helpers
  const addOemStep = () =>
    setForm((f) => ({ ...f, oemSteps: [...f.oemSteps, newOemStep()] }));
  const removeOemStep = (i: number) =>
    setForm((f) => ({ ...f, oemSteps: f.oemSteps.filter((_, idx) => idx !== i) }));
  const updateOemStep = (i: number, patch: Partial<OemStep>) =>
    setForm((f) => ({
      ...f,
      oemSteps: f.oemSteps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  const moveOemStep = (i: number, dir: -1 | 1) => {
    setForm((f) => {
      const next = [...f.oemSteps];
      const target = i + dir;
      if (target < 0 || target >= next.length) return f;
      const [moved] = next.splice(i, 1);
      if (!moved) return f;
      next.splice(target, 0, moved);
      return { ...f, oemSteps: next };
    });
  };
  const translateOemStepTitle = async (i: number) => {
    const s = form.oemSteps[i];
    if (!s) return;
    await translateOne(
      s.titleKo,
      "OEM/ODM step title (Design / Sampling / Production)",
      (lang, text) =>
        updateOemStep(i, { [langKey("title", lang)]: text } as Partial<OemStep>),
    );
  };
  const translateOemStepDesc = async (i: number) => {
    const s = form.oemSteps[i];
    if (!s) return;
    await translateOne(
      s.descriptionKo,
      "OEM/ODM step description",
      (lang, text) =>
        updateOemStep(i, { [langKey("description", lang)]: text } as Partial<OemStep>),
    );
  };

  // Cert helpers
  const addCertItem = () =>
    setForm((f) => ({ ...f, certItems: [...f.certItems, newCertItem()] }));
  const removeCertItem = (i: number) =>
    setForm((f) => ({ ...f, certItems: f.certItems.filter((_, idx) => idx !== i) }));
  const updateCertItem = (i: number, patch: Partial<CertItem>) =>
    setForm((f) => ({
      ...f,
      certItems: f.certItems.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));
  const translateCertName = async (i: number) => {
    const c = form.certItems[i];
    if (!c) return;
    await translateOne(
      c.nameKo,
      "certification full name",
      (lang, text) =>
        updateCertItem(i, { [langKey("name", lang)]: text } as Partial<CertItem>),
    );
  };
  const translateCertDesc = async (i: number) => {
    const c = form.certItems[i];
    if (!c) return;
    await translateOne(
      c.descriptionKo,
      "certification description",
      (lang, text) =>
        updateCertItem(i, { [langKey("description", lang)]: text } as Partial<CertItem>),
    );
  };

  const sectionLabels = useMemo(
    () => ({ oem: "OEM/ODM", cert: "Global Certifications" }) as const,
    [],
  );

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMut.mutateAsync({ data: form });
      await qc.invalidateQueries({ queryKey: getAdminGetProcessQueryKey() });
      toast({ title: "Process가 저장되었습니다" });
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

  return (
    <form onSubmit={(e) => void onSave(e)} className="px-8 py-8 space-y-6 max-w-6xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Process 관리</h1>
          <p className="text-xs text-muted-foreground">
            OEM/ODM 3단계 프로세스와 Global Certifications를 5개 언어로 관리합니다.
          </p>
        </div>
        <Button type="submit" disabled={saving} className="gap-2" data-testid="button-save-process">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          저장
        </Button>
      </header>

      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as typeof activeSection)}>
        <TabsList className="grid grid-cols-2 w-full">
          {(Object.keys(sectionLabels) as Array<keyof typeof sectionLabels>).map((k) => (
            <TabsTrigger key={k} value={k} data-testid={`process-tab-${k}`}>
              {sectionLabels[k]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OEM/ODM */}
        <TabsContent value="oem" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">OEM/ODM 헤더</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>대표 이미지</Label>
                <ImageUploader
                  value={form.oemImageUrl ?? null}
                  onChange={(url) => setField("oemImageUrl", url ?? null)}
                  previewClassName="h-48 w-full max-w-2xl rounded object-cover bg-muted border border-border"
                  testId="upload-oem-image"
                />
              </div>
              <LangTabs
                activeLang={activeLang}
                onChange={setActiveLang}
                filledFor={(l) => (form[langKey("oemDescription", l)] as string).trim().length > 0}
              >
                {(lang) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>설명 문구</Label>
                      {lang === "ko" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void translateOemDescription()}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                          data-testid="translate-oem-description"
                        >
                          <Sparkles className="h-3 w-3" /> 자동 번역
                        </Button>
                      )}
                    </div>
                    <Textarea
                      rows={4}
                      value={(form[langKey("oemDescription", lang)] as string) ?? ""}
                      onChange={(e) => setField(langKey("oemDescription", lang), e.target.value)}
                      placeholder="OEM/ODM 섹션의 설명 문구"
                      data-testid={`input-oem-description-${lang}`}
                    />
                  </div>
                )}
              </LangTabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">3단계 프로세스</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Design → Sampling → Production. 추가/삭제/순서 변경이 가능합니다.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addOemStep}
                disabled={translateMut.isPending}
                className="gap-2"
                data-testid="add-oem-step"
              >
                <Plus className="h-4 w-4" /> 단계 추가
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {form.oemSteps.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  단계가 등록되어 있지 않습니다.
                </p>
              )}
              {form.oemSteps.map((s, i) => (
                <div key={i} className="border rounded-md p-4 space-y-4" data-testid={`oem-step-${i}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Step {i + 1}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => moveOemStep(i, -1)}
                        disabled={i === 0 || translateMut.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => moveOemStep(i, 1)}
                        disabled={i === form.oemSteps.length - 1 || translateMut.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOemStep(i)}
                        disabled={translateMut.isPending}
                        className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" /> 삭제
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">제목 (5개 언어)</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => void translateOemStepTitle(i)}
                        disabled={translateMut.isPending}
                        className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                      >
                        <Sparkles className="h-3 w-3" /> KO → 4개 언어
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      {LANGS.map((lang) => (
                        <div key={lang} className="space-y-1">
                          <Label className="text-xs uppercase tracking-wider">{LANG_LABEL[lang]}</Label>
                          <Input
                            value={s[langKey("title", lang) as keyof OemStep] as string}
                            onChange={(e) =>
                              updateOemStep(i, { [langKey("title", lang)]: e.target.value } as Partial<OemStep>)
                            }
                            placeholder={lang === "ko" ? "디자인" : ""}
                            data-testid={`oem-step-title-${i}-${lang}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">설명 (5개 언어)</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => void translateOemStepDesc(i)}
                        disabled={translateMut.isPending}
                        className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                      >
                        <Sparkles className="h-3 w-3" /> KO → 4개 언어
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      {LANGS.map((lang) => (
                        <div key={lang} className="space-y-1">
                          <Label className="text-xs uppercase tracking-wider">{LANG_LABEL[lang]}</Label>
                          <Textarea
                            rows={3}
                            value={s[langKey("description", lang) as keyof OemStep] as string}
                            onChange={(e) =>
                              updateOemStep(i, {
                                [langKey("description", lang)]: e.target.value,
                              } as Partial<OemStep>)
                            }
                            placeholder={lang === "ko" ? "단계 설명" : ""}
                            data-testid={`oem-step-desc-${i}-${lang}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CERTIFICATIONS */}
        <TabsContent value="cert" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Global Certifications — 헤더</CardTitle>
            </CardHeader>
            <CardContent>
              <LangTabs
                activeLang={activeLang}
                onChange={setActiveLang}
                filledFor={(l) => (form[langKey("certIntro", l)] as string).trim().length > 0}
              >
                {(lang) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>인증 섹션 소개 문구</Label>
                      {lang === "ko" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void translateCertIntro()}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                        >
                          <Sparkles className="h-3 w-3" /> 자동 번역
                        </Button>
                      )}
                    </div>
                    <Textarea
                      rows={3}
                      value={(form[langKey("certIntro", lang)] as string) ?? ""}
                      onChange={(e) => setField(langKey("certIntro", lang), e.target.value)}
                      placeholder="Global Certifications 섹션 소개 문구"
                      data-testid={`input-cert-intro-${lang}`}
                    />
                  </div>
                )}
              </LangTabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">인증 항목</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  ISO / CE / FDA 등 인증을 추가/삭제할 수 있습니다. 이미지(로고) 업로드 가능.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCertItem}
                disabled={translateMut.isPending}
                className="gap-2"
                data-testid="add-cert-item"
              >
                <Plus className="h-4 w-4" /> 인증 추가
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {form.certItems.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  인증이 등록되어 있지 않습니다.
                </p>
              )}
              {form.certItems.map((c, i) => (
                <div key={i} className="border rounded-md p-4 space-y-4" data-testid={`cert-item-${i}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1 md:col-span-2">
                      <Label>코드 (영문, 예: ISO 22716)</Label>
                      <Input
                        value={c.code}
                        onChange={(e) => updateCertItem(i, { code: e.target.value })}
                        placeholder="ISO 22716"
                        data-testid={`cert-code-${i}`}
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCertItem(i)}
                        disabled={translateMut.isPending}
                        className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" /> 삭제
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>인증 로고 (선택)</Label>
                    <ImageUploader
                      value={c.imageUrl ?? null}
                      onChange={(url) => updateCertItem(i, { imageUrl: url ?? null })}
                      previewClassName="h-24 w-24 rounded object-contain bg-muted border border-border"
                      testId={`upload-cert-${i}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>이름 (5개 언어)</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void translateCertName(i)}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                        >
                          <Sparkles className="h-3 w-3" /> KO → 4개 언어
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {LANGS.map((lang) => (
                          <div key={lang} className="grid grid-cols-[60px_1fr] items-center gap-2">
                            <Label className="text-xs uppercase tracking-wider">{LANG_LABEL[lang]}</Label>
                            <Input
                              value={c[langKey("name", lang) as keyof CertItem] as string}
                              onChange={(e) =>
                                updateCertItem(i, {
                                  [langKey("name", lang)]: e.target.value,
                                } as Partial<CertItem>)
                              }
                              data-testid={`cert-name-${i}-${lang}`}
                            />
                          </div>
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
                          onClick={() => void translateCertDesc(i)}
                          disabled={translateMut.isPending}
                          className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                        >
                          <Sparkles className="h-3 w-3" /> KO → 4개 언어
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {LANGS.map((lang) => (
                          <div key={lang} className="grid grid-cols-[60px_1fr] items-start gap-2">
                            <Label className="text-xs uppercase tracking-wider pt-2">{LANG_LABEL[lang]}</Label>
                            <Textarea
                              rows={2}
                              value={c[langKey("description", lang) as keyof CertItem] as string}
                              onChange={(e) =>
                                updateCertItem(i, {
                                  [langKey("description", lang)]: e.target.value,
                                } as Partial<CertItem>)
                              }
                              data-testid={`cert-desc-${i}-${lang}`}
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
        {LANGS.map((l) => (
          <TabsTrigger
            key={l}
            value={l}
            data-testid={`lang-tab-${l}`}
            className="relative"
          >
            {LANG_LABEL[l]}
            {filledFor(l) && (
              <span className="absolute top-1 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {LANGS.map((l) => (
        <TabsContent key={l} value={l} className="mt-4">
          {children(l)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
