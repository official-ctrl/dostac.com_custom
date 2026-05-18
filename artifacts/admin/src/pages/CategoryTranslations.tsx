import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListCategoryTranslations,
  useAdminSaveCategoryTranslations,
  useAdminListSubCategoryTranslations,
  useAdminSaveSubCategoryTranslations,
  useAdminDiscoverCategorySlugs,
  useAdminTranslate,
  getAdminListCategoryTranslationsQueryKey,
  getAdminListSubCategoryTranslationsQueryKey,
  type CategoryTranslationRow,
  type SubCategoryTranslationRow,
} from "@workspace/api-client-react";
import { Loader2, Plus, RefreshCw, Save, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/langs";

const TARGET_LANGS: Lang[] = ["en", "ja", "zh", "vi"];

type TranslationRow = CategoryTranslationRow | SubCategoryTranslationRow;

function emptyRow(slug = ""): TranslationRow {
  return { slug, nameKo: "", nameEn: "", nameJa: "", nameZh: "", nameVi: "" };
}

const NAME_KEY: Record<Lang, keyof TranslationRow> = {
  ko: "nameKo",
  en: "nameEn",
  ja: "nameJa",
  zh: "nameZh",
  vi: "nameVi",
};

interface SectionProps {
  title: string;
  rows: TranslationRow[];
  setRows: (fn: (prev: TranslationRow[]) => TranslationRow[]) => void;
  isBusy: boolean;
  onTranslateRow: (idx: number) => Promise<void>;
  onTranslateAll: () => Promise<void>;
  onSave: () => Promise<void>;
  onDiscover: () => void;
  translatingIdx: number | null;
  savePending: boolean;
  discoverLoading: boolean;
}

function TranslationSection({
  title,
  rows,
  setRows,
  isBusy,
  onTranslateRow,
  onTranslateAll,
  onSave,
  onDiscover,
  translatingIdx,
  savePending,
  discoverLoading,
}: SectionProps) {
  const update = (idx: number, field: keyof TranslationRow, value: string) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDiscover}
            disabled={isBusy || discoverLoading}
            className="gap-2"
          >
            {discoverLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            제품에서 슬러그 가져오기
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void onTranslateAll()}
            disabled={isBusy}
            className="gap-2"
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
          >
            {savePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            저장
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addRow}
            disabled={isBusy}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> 슬러그 추가
          </Button>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              항목이 없습니다. 슬러그 추가 또는 제품에서 슬러그 가져오기를 눌러 시작하세요.
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
                >
                  <Input
                    value={row.slug}
                    onChange={(e) => update(idx, "slug", e.target.value)}
                    placeholder="slug"
                    className="font-mono text-sm"
                  />
                  {LANGS.map((lang) => (
                    <Input
                      key={lang}
                      value={(row[NAME_KEY[lang]] as string) ?? ""}
                      onChange={(e) => update(idx, NAME_KEY[lang], e.target.value)}
                      placeholder={lang === "ko" ? "한국어 이름" : LANG_LABEL[lang]}
                    />
                  ))}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-accent hover:text-accent"
                      onClick={() => void onTranslateRow(idx)}
                      disabled={isBusy}
                      title="KO → 번역"
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
            <strong>슬러그</strong>는 DB에 저장된 값과 정확히 일치해야 합니다 (예:{" "}
            <code className="font-mono bg-muted px-1 rounded">skincare</code>,{" "}
            <code className="font-mono bg-muted px-1 rounded">sheet-mask</code>).
            번역이 없는 슬러그는 공개 사이트에서 슬러그 그대로 표시됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CategoryTranslations() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: catData, isLoading: catLoading } = useAdminListCategoryTranslations();
  const { data: subCatData, isLoading: subCatLoading } = useAdminListSubCategoryTranslations();
  const { data: discoverData, isLoading: discoverLoading, refetch: refetchDiscover } =
    useAdminDiscoverCategorySlugs({ query: { enabled: false, queryKey: [] } });

  const saveCatMut = useAdminSaveCategoryTranslations();
  const saveSubCatMut = useAdminSaveSubCategoryTranslations();
  const translateMut = useAdminTranslate();

  const [catRows, setCatRows] = useState<TranslationRow[]>([]);
  const [subCatRows, setSubCatRows] = useState<TranslationRow[]>([]);
  const [catTranslatingIdx, setCatTranslatingIdx] = useState<number | null>(null);
  const [subCatTranslatingIdx, setSubCatTranslatingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (catData) setCatRows(catData);
  }, [catData]);

  useEffect(() => {
    if (subCatData) setSubCatRows(subCatData);
  }, [subCatData]);

  const makeTranslateRow =
    (rows: TranslationRow[], setRows: (fn: (prev: TranslationRow[]) => TranslationRow[]) => void, setIdx: (i: number | null) => void) =>
    async (idx: number) => {
      const row = rows[idx];
      if (!row || !row.nameKo.trim()) {
        toast({ title: "한국어 이름이 없습니다", description: "먼저 한국어 이름을 입력하세요.", variant: "destructive" });
        return;
      }
      setIdx(idx);
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
        toast({ title: "번역 실패", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
      } finally {
        setIdx(null);
      }
    };

  const makeTranslateAll =
    (rows: TranslationRow[], setRows: (fn: (prev: TranslationRow[]) => TranslationRow[]) => void, setIdx: (i: number | null) => void) =>
    async () => {
      const toTranslate = rows.filter((r) => r.nameKo.trim());
      if (toTranslate.length === 0) {
        toast({ title: "한국어 이름이 없습니다", description: "번역할 한국어 이름을 먼저 입력하세요.", variant: "destructive" });
        return;
      }
      setIdx(-1);
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
        setRows(() => updated);
        toast({ title: "전체 번역 완료" });
      } catch (err) {
        toast({ title: "번역 실패", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
      } finally {
        setIdx(null);
      }
    };

  const makeSave =
    (rows: TranslationRow[], saveFn: (rows: TranslationRow[]) => Promise<TranslationRow[]>, invalidateKey: readonly unknown[], setRows: (fn: (prev: TranslationRow[]) => TranslationRow[]) => void) =>
    async () => {
      const slugs = rows.map((r) => r.slug.trim());
      if (slugs.some((s) => !s)) {
        toast({ title: "슬러그 필수", description: "모든 행의 슬러그를 입력하세요.", variant: "destructive" });
        return;
      }
      const unique = new Set(slugs);
      if (unique.size !== slugs.length) {
        toast({ title: "중복 슬러그", description: "슬러그가 중복됩니다.", variant: "destructive" });
        return;
      }
      try {
        const saved = await saveFn(rows.map((r) => ({ ...r, slug: r.slug.trim() })));
        setRows(() => saved);
        await qc.invalidateQueries({ queryKey: invalidateKey });
        toast({ title: "저장되었습니다" });
      } catch (err) {
        toast({ title: "저장 실패", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
      }
    };

  const discoverAndMerge = async (kind: "category" | "subCategory") => {
    let result: Awaited<ReturnType<typeof refetchDiscover>>;
    try {
      result = await refetchDiscover();
    } catch (err) {
      toast({ title: "슬러그 가져오기 실패", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
      return;
    }
    if (result.error) {
      toast({ title: "슬러그 가져오기 실패", description: result.error instanceof Error ? result.error.message : "Unknown error", variant: "destructive" });
      return;
    }
    const slugs: string[] = kind === "category"
      ? (result.data?.categories ?? [])
      : (result.data?.subCategories ?? []);

    if (kind === "category") {
      setCatRows((prev) => {
        const existing = new Set(prev.map((r) => r.slug));
        const newRows = slugs.filter((s) => !existing.has(s)).map((s) => emptyRow(s));
        return [...prev, ...newRows];
      });
    } else {
      setSubCatRows((prev) => {
        const existing = new Set(prev.map((r) => r.slug));
        const newRows = slugs.filter((s) => !existing.has(s)).map((s) => emptyRow(s));
        return [...prev, ...newRows];
      });
    }

    if (slugs.length > 0) {
      toast({ title: "슬러그를 가져왔습니다", description: `${slugs.length}개의 슬러그를 확인했습니다.` });
    } else {
      toast({ title: "새 슬러그 없음", description: "모든 슬러그가 이미 등록되어 있습니다." });
    }
  };

  const catBusy = saveCatMut.isPending || catTranslatingIdx !== null;
  const subCatBusy = saveSubCatMut.isPending || subCatTranslatingIdx !== null;

  if (catLoading || subCatLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-8 py-8 space-y-6 max-w-7xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">카테고리 번역 관리</h1>
        <p className="text-muted-foreground mt-1">
          카테고리 및 서브카테고리 슬러그별 5개 언어 표시 이름을 관리합니다.
          저장된 이름은 공개 사이트에 즉시 반영됩니다.
        </p>
      </header>

      <Tabs defaultValue="category">
        <TabsList>
          <TabsTrigger value="category">카테고리</TabsTrigger>
          <TabsTrigger value="subCategory">서브카테고리</TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="mt-6">
          <TranslationSection
            title="카테고리 목록"
            rows={catRows}
            setRows={setCatRows}
            isBusy={catBusy}
            onTranslateRow={makeTranslateRow(catRows, setCatRows, setCatTranslatingIdx)}
            onTranslateAll={makeTranslateAll(catRows, setCatRows, setCatTranslatingIdx)}
            onSave={makeSave(
              catRows,
              async (rows) => {
                const saved = await saveCatMut.mutateAsync({ data: rows as CategoryTranslationRow[] });
                return saved;
              },
              getAdminListCategoryTranslationsQueryKey(),
              setCatRows,
            )}
            onDiscover={() => void discoverAndMerge("category")}
            translatingIdx={catTranslatingIdx}
            savePending={saveCatMut.isPending}
            discoverLoading={discoverLoading}
          />
        </TabsContent>

        <TabsContent value="subCategory" className="mt-6">
          <TranslationSection
            title="서브카테고리 목록"
            rows={subCatRows}
            setRows={setSubCatRows}
            isBusy={subCatBusy}
            onTranslateRow={makeTranslateRow(subCatRows, setSubCatRows, setSubCatTranslatingIdx)}
            onTranslateAll={makeTranslateAll(subCatRows, setSubCatRows, setSubCatTranslatingIdx)}
            onSave={makeSave(
              subCatRows,
              async (rows) => {
                const saved = await saveSubCatMut.mutateAsync({ data: rows as SubCategoryTranslationRow[] });
                return saved;
              },
              getAdminListSubCategoryTranslationsQueryKey(),
              setSubCatRows,
            )}
            onDiscover={() => void discoverAndMerge("subCategory")}
            translatingIdx={subCatTranslatingIdx}
            savePending={saveSubCatMut.isPending}
            discoverLoading={discoverLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
