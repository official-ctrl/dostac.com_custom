import { useState } from "react";
import { useAdminTranslate } from "@workspace/api-client-react";
import { Loader2, Sparkles } from "lucide-react";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/langs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";
import { cn } from "@/lib/utils";

type FieldDef<K extends string> = {
  key: K;
  label: string;
  kind: "text" | "richtext";
  context?: string;
  placeholder?: string;
};

type TranslationRow<K extends string> = { lang: Lang } & Record<K, string>;

type Props<K extends string> = {
  fields: FieldDef<K>[];
  value: TranslationRow<K>[];
  onChange: (next: TranslationRow<K>[]) => void;
};

export function TranslationFields<K extends string>({ fields, value, onChange }: Props<K>) {
  const { toast } = useToast();
  const translateMut = useAdminTranslate();
  const [activeLang, setActiveLang] = useState<Lang>("ko");
  const [translatingFor, setTranslatingFor] = useState<Lang | "all" | null>(null);

  const getRow = (lang: Lang): TranslationRow<K> => {
    const existing = value.find((v) => v.lang === lang);
    if (existing) return existing;
    const empty = { lang } as TranslationRow<K>;
    for (const f of fields) {
      (empty as Record<string, string>)[f.key] = "";
    }
    return empty;
  };

  const setRow = (lang: Lang, patch: Partial<TranslationRow<K>>) => {
    const next = LANGS.map<TranslationRow<K>>((l) => {
      const cur = getRow(l);
      if (l === lang) return { ...cur, ...patch, lang } as TranslationRow<K>;
      return cur;
    });
    onChange(next);
  };

  const translateField = async (
    field: FieldDef<K>,
    targets: Lang[],
  ): Promise<void> => {
    const ko = getRow("ko");
    const sourceText = (ko as Record<string, string>)[field.key] ?? "";
    if (!sourceText.trim()) {
      toast({
        title: "한국어 원문이 없습니다",
        description: `"${field.label}" 필드의 한국어 내용을 먼저 입력하세요.`,
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await translateMut.mutateAsync({
        data: {
          sourceText,
          sourceLang: "ko",
          targetLangs: targets,
          context: field.context ?? field.label,
          format: field.kind === "richtext" ? "html" : "text",
        },
      });
      const next = LANGS.map<TranslationRow<K>>((l) => {
        const cur = getRow(l);
        const t = result.translations.find((x) => x.lang === l);
        if (!t || l === "ko") return cur;
        return { ...cur, [field.key]: t.text } as TranslationRow<K>;
      });
      onChange(next);
      toast({
        title: "번역 완료",
        description: `"${field.label}" — ${targets.length === 4 ? "전 언어" : targets.map((t) => LANG_LABEL[t]).join(", ")}`,
      });
    } catch (err) {
      toast({
        title: "번역 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const translateAllForLang = async (target: Lang): Promise<void> => {
    const ko = getRow("ko");
    setTranslatingFor(target);
    try {
      for (const f of fields) {
        const sourceText = (ko as Record<string, string>)[f.key] ?? "";
        if (!sourceText.trim()) continue;
        const result = await translateMut.mutateAsync({
          data: {
            sourceText,
            sourceLang: "ko",
            targetLangs: [target],
            context: f.context ?? f.label,
            format: f.kind === "richtext" ? "html" : "text",
          },
        });
        const t = result.translations[0];
        if (t) setRow(target, { [f.key]: t.text } as Partial<TranslationRow<K>>);
      }
      toast({
        title: "번역 완료",
        description: `${LANG_LABEL[target]} 모든 필드 번역됨`,
      });
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

  const translateAllLangsAllFields = async (): Promise<void> => {
    setTranslatingFor("all");
    try {
      const ko = getRow("ko");
      const targets: Lang[] = ["en", "ja", "zh", "vi"];
      // run sequentially per field across all targets
      let next: TranslationRow<K>[] = LANGS.map((l) => getRow(l));
      for (const f of fields) {
        const sourceText = (ko as Record<string, string>)[f.key] ?? "";
        if (!sourceText.trim()) continue;
        const result = await translateMut.mutateAsync({
          data: {
            sourceText,
            sourceLang: "ko",
            targetLangs: targets,
            context: f.context ?? f.label,
            format: f.kind === "richtext" ? "html" : "text",
          },
        });
        next = next.map((row) => {
          if (row.lang === "ko") return row;
          const t = result.translations.find((x) => x.lang === row.lang);
          if (!t) return row;
          return { ...row, [f.key]: t.text } as TranslationRow<K>;
        });
      }
      onChange(next);
      toast({ title: "전체 번역 완료", description: "모든 언어로 모든 필드를 번역했습니다." });
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

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">다국어 콘텐츠 / Translations</h3>
          <p className="text-xs text-muted-foreground">
            한국어로 입력 후 자동 번역 버튼을 눌러 4개 언어를 채우세요. 모든 필드는 수동 수정 가능합니다.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={() => void translateAllLangsAllFields()}
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
      </div>

      <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Lang)}>
        <TabsList className="m-3 grid grid-cols-5 w-[calc(100%-1.5rem)]">
          {LANGS.map((lang) => {
            const row = getRow(lang);
            const filled = fields.every(
              (f) => ((row as Record<string, string>)[f.key] ?? "").trim().length > 0,
            );
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
          const row = getRow(lang);
          const isKo = lang === "ko";
          return (
            <TabsContent key={lang} value={lang} className="px-4 pb-4 mt-0 space-y-4">
              {!isKo && (
                <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    {LANG_LABEL[lang]} 언어. 한국어 원문을 기반으로 자동 번역 후 직접 수정 가능합니다.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void translateAllForLang(lang)}
                    disabled={translatingFor !== null}
                    className="gap-2"
                    data-testid={`button-translate-lang-${lang}`}
                  >
                    {translatingFor === lang ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    KO → {LANG_LABEL[lang]} 자동 번역
                  </Button>
                </div>
              )}

              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      {field.label}
                      {isKo && <span className="text-destructive ml-0.5">*</span>}
                    </label>
                    {isKo && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => void translateField(field, ["en", "ja", "zh", "vi"])}
                        disabled={translateMut.isPending || translatingFor !== null}
                        className="h-7 gap-1.5 text-xs text-accent hover:text-accent"
                        data-testid={`button-translate-field-${field.key}`}
                      >
                        {translateMut.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        이 필드 자동 번역
                      </Button>
                    )}
                  </div>
                  {field.kind === "text" ? (
                    <Input
                      value={(row as Record<string, string>)[field.key] ?? ""}
                      onChange={(e) =>
                        setRow(lang, {
                          [field.key]: e.target.value,
                        } as Partial<TranslationRow<K>>)
                      }
                      placeholder={field.placeholder}
                      data-testid={`input-${field.key}-${lang}`}
                    />
                  ) : (
                    <RichTextEditor
                      value={(row as Record<string, string>)[field.key] ?? ""}
                      onChange={(html) =>
                        setRow(lang, {
                          [field.key]: html,
                        } as Partial<TranslationRow<K>>)
                      }
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
