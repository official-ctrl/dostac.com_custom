import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  useAdminCreateProduct,
  useAdminTranslate,
  getAdminListProductsQueryKey,
  type AdminProductInput,
  type Translation,
  type Lang,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  FileSpreadsheet,
  PlayCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LANGS } from "@/lib/langs";
import { cn } from "@/lib/utils";

const TARGET_LANGS: Lang[] = ["en", "ja", "zh", "vi"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type RawRow = {
  slug?: string;
  category?: string;
  subCategory?: string;
  material?: string;
  name_ko?: string;
  features_ko?: string;
  certs?: string;
};

type RowStatus = "pending" | "translating" | "creating" | "done" | "error";

type ParsedRow = {
  index: number;
  slug: string;
  category: string;
  subCategory: string;
  material: string;
  name_ko: string;
  features_ko: string;
  certs: string[];
  errors: string[];
  status: RowStatus;
  errorMsg?: string;
};

function validateRow(raw: RawRow, index: number): ParsedRow {
  const slug = (raw.slug ?? "").trim();
  const category = (raw.category ?? "").trim();
  const name_ko = (raw.name_ko ?? "").trim();
  const subCategory = (raw.subCategory ?? "").trim();
  const material = (raw.material ?? "").trim();
  const features_ko = (raw.features_ko ?? "").trim();
  const certsRaw = (raw.certs ?? "").trim();
  const certs = certsRaw
    ? certsRaw
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const errors: string[] = [];
  if (!slug) errors.push("slug 필수");
  else if (!SLUG_RE.test(slug)) errors.push("slug는 영문소문자·숫자·하이픈만 허용");
  if (!category) errors.push("category 필수");
  if (!name_ko) errors.push("name_ko 필수");

  return {
    index,
    slug,
    category,
    subCategory,
    material,
    name_ko,
    features_ko,
    certs,
    errors,
    status: "pending",
  };
}

function parseCSV(text: string): RawRow[] {
  const result = Papa.parse<RawRow>(text.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data;
}

function parseExcel(buffer: ArrayBuffer): RawRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
}

function emptyTranslations(): Translation[] {
  return LANGS.map((lang) => ({
    lang,
    name: "",
    headline: "",
    valueProp: "",
    body: "",
    features: "",
    material: "",
  }));
}

const STATUS_ICON: Record<RowStatus, React.ReactNode> = {
  pending: <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 inline-block" />,
  translating: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  creating: <Loader2 className="h-4 w-4 animate-spin text-amber-500" />,
  done: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
};

const STATUS_LABEL: Record<RowStatus, string> = {
  pending: "대기",
  translating: "번역 중",
  creating: "저장 중",
  done: "완료",
  error: "오류",
};

export default function ProductImport() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const createMut = useAdminCreateProduct();
  const translateMut = useAdminTranslate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ done: number; errors: number } | null>(null);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);
  const doneCount = rows.filter((r) => r.status === "done").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const finishedCount = doneCount + errorCount;
  const totalImportable = validRows.length;
  const progress = totalImportable > 0 ? Math.round((finishedCount / totalImportable) * 100) : 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setRows([]);
    setImportResult(null);

    try {
      const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
      let rawRows: RawRow[] = [];

      if (isExcel) {
        const buffer = await file.arrayBuffer();
        rawRows = parseExcel(buffer);
      } else {
        const text = await file.text();
        rawRows = parseCSV(text);
      }

      if (rawRows.length === 0) {
        toast({
          title: "파일이 비어 있습니다",
          description: "데이터 행이 없습니다. 파일을 확인해 주세요.",
          variant: "destructive",
        });
        return;
      }

      const parsed = rawRows.map((raw, i) => validateRow(raw, i));
      setRows(parsed);
    } catch (err) {
      toast({
        title: "파일 파싱 실패",
        description:
          err instanceof Error ? err.message : "파일 형식을 읽을 수 없습니다. CSV 또는 Excel 파일인지 확인하세요.",
        variant: "destructive",
      });
    }
  };

  const updateRowStatus = (index: number, patch: Partial<ParsedRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.index === index ? { ...r, ...patch } : r)),
    );
  };

  const runImport = async () => {
    if (validRows.length === 0) return;
    setIsImporting(true);
    setImportResult(null);

    let localDone = 0;
    let localErrors = 0;

    for (const row of validRows) {
      updateRowStatus(row.index, { status: "translating" });

      let translations = emptyTranslations();

      const koIdx = translations.findIndex((t) => t.lang === "ko");
      if (koIdx >= 0) {
        translations[koIdx] = {
          ...translations[koIdx]!,
          name: row.name_ko,
          features: row.features_ko,
          material: row.material,
        };
      }

      let translateFailed = false;
      try {
        const fieldsToTranslate: Array<{
          key: keyof Translation;
          text: string;
          context: string;
          format: "text";
        }> = [];

        if (row.name_ko.trim()) {
          fieldsToTranslate.push({
            key: "name",
            text: row.name_ko,
            context: "cosmetic product name",
            format: "text",
          });
        }
        if (row.features_ko.trim()) {
          fieldsToTranslate.push({
            key: "features",
            text: row.features_ko,
            context:
              "Newline-separated list of short B2B product feature bullets. Output MUST be plain text with one feature per line (\\n separated). Do NOT add numbering, hyphens, bullets (•/-), or extra blank lines. Preserve the same number of lines as the input.",
            format: "text",
          });
        }
        if (row.material.trim()) {
          fieldsToTranslate.push({
            key: "material",
            text: row.material,
            context: "product material description for cosmetic/personal care OEM product",
            format: "text",
          });
        }

        for (const field of fieldsToTranslate) {
          const result = await translateMut.mutateAsync({
            data: {
              sourceText: field.text,
              sourceLang: "ko",
              targetLangs: TARGET_LANGS,
              context: field.context,
              format: field.format,
            },
          });
          translations = translations.map((t) => {
            if (t.lang === "ko") return t;
            const tr = result.translations.find((x) => x.lang === t.lang);
            if (!tr) return t;
            return { ...t, [field.key]: tr.text };
          });
        }
      } catch {
        translateFailed = true;
        updateRowStatus(row.index, {
          status: "error",
          errorMsg: "번역 실패 — 한국어로만 저장 시도",
        });
      }

      updateRowStatus(row.index, { status: "creating" });

      try {
        const payload: AdminProductInput = {
          slug: row.slug,
          category: row.category,
          subCategory: row.subCategory,
          sortOrder: 100,
          imageUrl: null,
          published: true,
          certs: row.certs,
          translations,
        };
        await createMut.mutateAsync({ data: payload });
        updateRowStatus(row.index, {
          status: "done",
          errorMsg: translateFailed ? "번역 실패 (한국어만 저장됨)" : undefined,
        });
        localDone++;
      } catch (err) {
        updateRowStatus(row.index, {
          status: "error",
          errorMsg: err instanceof Error ? err.message : "저장 실패",
        });
        localErrors++;
      }
    }

    await qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
    setIsImporting(false);
    setImportResult({ done: localDone, errors: localErrors });

    toast({
      title: "가져오기 완료",
      description: `${localDone}개 성공, ${localErrors}개 오류`,
    });
  };

  const canImport = validRows.length > 0 && !isImporting;

  return (
    <div className="px-8 py-8 space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/products">
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">제품 일괄 가져오기</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            CSV 또는 Excel 파일로 제품을 한꺼번에 등록하고 자동 번역합니다.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">파일 업로드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted/40 border border-border p-4 space-y-2">
            <p className="text-sm font-medium">필수 컬럼</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
              {[
                { col: "slug", desc: "URL 슬러그 (영문소문자·숫자·하이픈)" },
                { col: "category", desc: "카테고리 (예: skincare)" },
                { col: "name_ko", desc: "제품명 (한국어)" },
                { col: "subCategory", desc: "서브카테고리 (선택)" },
                { col: "material", desc: "소재 (선택, 한국어)" },
                { col: "features_ko", desc: "주요 특징 (선택, 줄바꿈 구분)" },
                { col: "certs", desc: "인증 (선택, 쉼표 구분)" },
              ].map(({ col, desc }) => (
                <div key={col} className="space-y-0.5">
                  <code className="bg-muted rounded px-1 py-0.5 text-[11px] text-foreground">
                    {col}
                  </code>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground/50" />
            <div className="text-center">
              <p className="text-sm font-medium">
                {fileName ?? "CSV 또는 Excel 파일을 선택하세요"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">.csv, .xlsx, .xls 지원</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              파일 선택
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
            />
          </div>

          {rows.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                총 <strong className="text-foreground">{rows.length}</strong>개 행 파싱됨 —{" "}
                <span className="text-green-600">{validRows.length}개 유효</span>
                {invalidRows.length > 0 && (
                  <>
                    {", "}
                    <span className="text-destructive">{invalidRows.length}개 오류</span>
                  </>
                )}
              </span>
              <Button
                onClick={() => void runImport()}
                disabled={!canImport}
                className="gap-2"
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                {isImporting ? "가져오는 중…" : `${validRows.length}개 가져오기`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {(isImporting || importResult !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {importResult !== null ? "가져오기 결과" : "가져오기 진행 중"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={importResult !== null ? 100 : progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {importResult !== null
                  ? `${totalImportable} / ${totalImportable} 처리됨`
                  : `${finishedCount} / ${totalImportable} 처리됨`}
              </span>
              <span>
                <span className="text-green-600">
                  {importResult !== null ? importResult.done : doneCount}개 완료
                </span>
                {(importResult !== null ? importResult.errors : errorCount) > 0 && (
                  <>
                    {" · "}
                    <span className="text-destructive">
                      {importResult !== null ? importResult.errors : errorCount}개 오류
                    </span>
                  </>
                )}
              </span>
            </div>
            {importResult !== null && (
              <p className="text-sm text-green-600 font-medium">가져오기 완료!</p>
            )}
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">미리보기</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-8">
                      #
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      상태
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      slug
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      category
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      name_ko
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      certs
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      오류
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const hasError = row.errors.length > 0 || row.status === "error";
                    return (
                      <tr
                        key={row.index}
                        className={cn(
                          "border-b border-border last:border-0",
                          hasError && row.errors.length > 0
                            ? "bg-destructive/5"
                            : row.status === "done"
                              ? "bg-green-500/5"
                              : row.status === "error"
                                ? "bg-destructive/5"
                                : "",
                        )}
                      >
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">
                          {row.index + 1}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {STATUS_ICON[row.status]}
                            <span
                              className={cn(
                                "text-xs",
                                row.status === "done"
                                  ? "text-green-600"
                                  : row.status === "error"
                                    ? "text-destructive"
                                    : row.status === "translating"
                                      ? "text-blue-500"
                                      : row.status === "creating"
                                        ? "text-amber-500"
                                        : "text-muted-foreground",
                              )}
                            >
                              {STATUS_LABEL[row.status]}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <code className="text-xs bg-muted rounded px-1 py-0.5">
                            {row.slug || <span className="text-muted-foreground italic">없음</span>}
                          </code>
                        </td>
                        <td className="px-4 py-2.5 text-xs">{row.category || "—"}</td>
                        <td className="px-4 py-2.5 text-xs max-w-[200px] truncate">
                          {row.name_ko || "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {row.certs.length > 0
                              ? row.certs.map((c) => (
                                  <span
                                    key={c}
                                    className="text-[10px] bg-accent/10 text-accent rounded-full px-2 py-0.5"
                                  >
                                    {c}
                                  </span>
                                ))
                              : <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          {row.errors.length > 0 ? (
                            <div className="flex items-start gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                              <ul className="text-xs text-destructive space-y-0.5">
                                {row.errors.map((e) => (
                                  <li key={e}>{e}</li>
                                ))}
                              </ul>
                            </div>
                          ) : row.status === "error" && row.errorMsg ? (
                            <div className="flex items-start gap-1.5">
                              <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                              <span className="text-xs text-destructive">{row.errorMsg}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-green-600">✓</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {importResult !== null && importResult.done > 0 && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setRows([]);
              setFileName(null);
              setImportResult(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            다시 가져오기
          </Button>
          <Button onClick={() => void navigate("/products")}>제품 목록으로</Button>
        </div>
      )}
    </div>
  );
}
