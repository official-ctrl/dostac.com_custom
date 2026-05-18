import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListCategoryTranslations,
  useAdminSaveCategoryTranslations,
  useAdminTranslate,
  getAdminListCategoryTranslationsQueryKey,
  type CategoryTranslationRow,
} from "@workspace/api-client-react";
import { Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/langs";

const TARGET_LANGS: Lang[] = ["en", "ja", "zh", "vi"];

function emptyRow(slug = ""): CategoryTranslationRow {
  return { slug, nameKo: "", nameEn: "", nameJa: "", nameZh: "", nameVi: "" };
}

const NAME_KEY: Record<Lang, keyof CategoryTranslationRow> = {
  ko: "nameKo",
  en: "nameEn",
  ja: "nameJa",
  zh: "nameZh",
  vi: "nameVi",
};

export default function CategoryTranslations() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useAdminListCategoryTranslations();
  const saveMut = useAdminSaveCategoryTranslations();
  const translateMut = useAdminTranslate();

  const [rows, setRows] = useState<CategoryTranslationRow[]>([]);
  const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const update = (idx: number, field: keyof CategoryTranslationRow, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx]!, [field]: value };
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
  };

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const translateRow = async (idx: number) => {
    const row = rows[idx];
    if (!row || !row.nameKo.trim()) {
      toast({
        title: "한국어 이름이 없습니다",
        description: "먼저 한국어 이름을 입력하세요.",
        variant: "destructive",
      });
      return;
    }
    setTranslatingIdx(idx);
    try {
      const result = await translateMut.mutateAsync({
        data: {
          sourceText: row.nameKo,
          sourceLang: "ko",
          targetLangs: TARGET_LANGS,
          context: "product category name",
          format: "text",
        },
      });
      setRows((prev) => {
        const next = [...prev];
        const updated = { ...next[idx]! };
        for (const t of result.translations) {
          if (t.lang === "ko") continue;
          updated[NAME_KEY[t.lang]] = t.text;
        }
        next[idx] = updated;
        return next;
      });
      toast({ title: "번역 완료" });
    } catch (err) {
      toast({
        title: "번역 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTranslatingIdx(null);
    }
  };

  const translateAll = async () => {
    const toTranslate = rows.filter((r) => r.nameKo.trim());
    if (toTranslate.length === 0) {
      toast({
        title: "한국어 이름이 없습니다",
        description: "번역할 한국어 이름을 먼저 입력하세요.",
        variant: "destructive",
      });
      return;
    }
    setTranslatingIdx(-1);
    try {
      const updated = [...rows];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row?.nameKo.trim()) continue;
        const result = await translateMut.mutateAsync({
          data: {
            sourceText: row.nameKo,
            sourceLang: "ko",
            targetLangs: TARGET_LANGS,
            context: "product category name",
            format: "text",
          },
        });
        const next = { ...updated[i]! };
        for (const t of result.translations) {
          if (t.lang === "ko") continue;
          next[NAME_KEY[t.lang]] = t.text;
        }
        updated[i] = next;
      }
      setRows(updated);
      toast({ title: "전체 번역 완료" });
    } catch (err) {
      toast({
        title: "번역 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setTranslatingIdx(null);
    }
  };

  const onSave = async () => {
    const slugs = rows.map((r) => r.slug.trim());
    if (slugs.some((s) => !s)) {
      toast({
        title: "슬러그 필수",
        description: "모든 행의 카테고리 슬러그를 입력하세요.",
        variant: "destructive",
      });
      return;
    }
    const unique = new Set(slugs);
    if (unique.size !== slugs.length) {
      toast({
        title: "중복 슬러그",
        description: "카테고리 슬러그가 중복됩니다.",
        variant: "destructive",
      });
      return;
    }
    try {
      const saved = await saveMut.mutateAsync({
        data: rows.map((r) => ({ ...r, slug: r.slug.trim() })),
      });
      setRows(saved);
      await qc.invalidateQueries({ queryKey: getAdminListCategoryTranslationsQueryKey() });
      toast({ title: "저장되었습니다" });
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

  const isBusy = saveMut.isPending || translatingIdx !== null;

  return (
    <div className="px-8 py-8 space-y-6 max-w-7xl">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">카테고리 번역 관리</h1>
          <p className="text-muted-foreground mt-1">
            제품 카테고리 슬러그별 5개 언어 표시 이름을 관리합니다.
            저장된 이름은 공개 사이트에 즉시 반영됩니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void translateAll()}
            disabled={isBusy}
            className="gap-2"
            data-testid="button-translate-all"
          >
            {translatingIdx === -1 ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            KO → 전체 번역
          </Button>
          <Button
            type="button"
            onClick={() => void onSave()}
            disabled={isBusy}
            className="gap-2"
            data-testid="button-save"
          >
            {saveMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            저장
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">카테고리 목록</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addRow}
            disabled={isBusy}
            className="gap-2"
            data-testid="button-add-row"
          >
            <Plus className="h-4 w-4" /> 카테고리 추가
          </Button>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              카테고리가 없습니다. 카테고리 추가를 눌러 시작하세요.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-[140px_1fr_1fr_1fr_1fr_1fr_80px] gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border">
                <span>슬러그</span>
                {LANGS.map((lang) => (
                  <span key={lang}>{LANG_LABEL[lang]}</span>
                ))}
                <span />
              </div>
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[140px_1fr_1fr_1fr_1fr_1fr_80px] gap-2 items-center"
                  data-testid={`category-row-${idx}`}
                >
                  <div className="space-y-1">
                    <Input
                      value={row.slug}
                      onChange={(e) => update(idx, "slug", e.target.value)}
                      placeholder="skincare"
                      className="font-mono text-sm"
                      data-testid={`input-slug-${idx}`}
                    />
                  </div>
                  {LANGS.map((lang) => (
                    <Input
                      key={lang}
                      value={(row[NAME_KEY[lang]] as string) ?? ""}
                      onChange={(e) => update(idx, NAME_KEY[lang], e.target.value)}
                      placeholder={lang === "ko" ? "한국어 이름" : LANG_LABEL[lang]}
                      data-testid={`input-name-${lang}-${idx}`}
                    />
                  ))}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-accent hover:text-accent"
                      onClick={() => void translateRow(idx)}
                      disabled={isBusy}
                      title="KO → 번역"
                      data-testid={`button-translate-${idx}`}
                    >
                      {translatingIdx === idx ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeRow(idx)}
                      disabled={isBusy}
                      title="삭제"
                      data-testid={`button-remove-${idx}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>슬러그</strong>는 DB에 저장된 카테고리 값과 정확히 일치해야 합니다 (예:{" "}
            <code className="font-mono bg-muted px-1 rounded">skincare</code>,{" "}
            <code className="font-mono bg-muted px-1 rounded">wipes</code>).
            번역이 없는 슬러그는 공개 사이트에서 슬러그 그대로 표시됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
