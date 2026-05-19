import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  useAdminCreateProduct,
  useAdminUpsertProductsBySlug,
  useAdminTranslate,
  adminListProducts,
  getAdminListProductsQueryKey,
  type AdminProduct,
  type AdminProductInput,
  type Translation,
  type Lang,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ToastAction } from "@/components/ui/toast";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  FileSpreadsheet,
  PlayCircle,
  Download,
  SkipForward,
  ChevronDown,
  Trash2,
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

type RowStatus = "pending" | "translating" | "creating" | "done" | "error" | "skipped";

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
  isDuplicate?: boolean;
  isIntraBatchDuplicate?: boolean;
  isOverwrite?: boolean;
  originallyInvalid?: boolean;
  diffSummary?: string[];
};

function computeDiff(row: ParsedRow, existing: AdminProduct): string[] {
  const changed: string[] = [];
  const koTr = existing.translations.find((t) => t.lang === "ko");

  if (row.category !== existing.category) {
    changed.push(`category: ${existing.category} → ${row.category}`);
  }
  const existingSubCat = existing.subCategory ?? "";
  if (row.subCategory !== existingSubCat) {
    changed.push(`subCategory: ${existingSubCat || "(없음)"} → ${row.subCategory || "(없음)"}`);
  }

  const existingCerts = [...(existing.certs ?? [])].sort().join(",");
  const newCerts = [...row.certs].sort().join(",");
  if (existingCerts !== newCerts) {
    changed.push("certs 변경");
  }

  if (koTr) {
    if (row.name_ko !== (koTr.name ?? "")) changed.push("name_ko 변경");
    if (row.features_ko !== (koTr.features ?? "")) changed.push("features_ko 변경");
    if (row.material !== (koTr.material ?? "")) changed.push("material 변경");
  }

  return changed;
}

function validateRow(
  raw: RawRow,
  index: number,
  existingSlugs?: Set<string>,
  batchSlugs?: Set<string>,
  allowOverwrite?: boolean,
): ParsedRow {
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

  const slugValid = slug.length > 0 && SLUG_RE.test(slug);

  const isDbDuplicate = slugValid && existingSlugs != null ? existingSlugs.has(slug) : false;
  const isIntraFileDuplicate = slugValid && batchSlugs != null ? batchSlugs.has(slug) : false;

  if (isDbDuplicate && !allowOverwrite) errors.push("slug 중복");
  if (isIntraFileDuplicate) errors.push("slug 중복 (파일 내)");

  const isOverwrite = isDbDuplicate && !!allowOverwrite && !isIntraFileDuplicate;

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
    isDuplicate: (!allowOverwrite && isDbDuplicate) || isIntraFileDuplicate,
    isIntraBatchDuplicate: isIntraFileDuplicate,
    isOverwrite,
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
  skipped: <SkipForward className="h-4 w-4 text-amber-500" />,
};

const STATUS_LABEL: Record<RowStatus, string> = {
  pending: "대기",
  translating: "번역 중",
  creating: "저장 중",
  done: "완료",
  error: "오류",
  skipped: "건너뜀",
};

const TEMPLATE_HEADERS = ["slug", "category", "subCategory", "material", "name_ko", "features_ko", "certs"];

const TEMPLATE_EXAMPLE = [
  "moisture-cream",
  "skincare",
  "cream",
  "히알루론산, 세라마이드",
  "수분 크림",
  "보습력 강화\n피부 장벽 개선\n빠른 흡수력",
  "ISO22716,COSMOS",
];

function downloadTemplate() {
  const csvRow = (values: string[]) =>
    values.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");

  const csv = [csvRow(TEMPLATE_HEADERS), csvRow(TEMPLATE_EXAMPLE)].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCorrectedRows(correctedRows: ParsedRow[]) {
  const csvRow = (values: string[]) =>
    values.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");

  const dataRows = correctedRows.map((row) =>
    csvRow([
      row.slug,
      row.category,
      row.subCategory,
      row.material,
      row.name_ko,
      row.features_ko,
      row.certs.join(","),
    ]),
  );

  const csv = [csvRow(TEMPLATE_HEADERS), ...dataRows].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product_import_corrected.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadErrorRows(invalidRows: ParsedRow[]) {
  const ERROR_HEADERS = [...TEMPLATE_HEADERS, "_errors"];
  const csvRow = (values: string[]) =>
    values.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");

  const dataRows = invalidRows.map((row) =>
    csvRow([
      row.slug,
      row.category,
      row.subCategory,
      row.material,
      row.name_ko,
      row.features_ko,
      row.certs.join(","),
      row.errors.join(" / "),
    ]),
  );

  const csv = [csvRow(ERROR_HEADERS), ...dataRows].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product_import_errors.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProductImport() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const createMut = useAdminCreateProduct();
  const upsertMut = useAdminUpsertProductsBySlug();
  const translateMut = useAdminTranslate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [showExample, setShowExample] = useState(false);
  const [existingSlugs, setExistingSlugs] = useState<Set<string>>(new Set());
  const [existingProductMap, setExistingProductMap] = useState<Map<string, AdminProduct>>(new Map());
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    done: number;
    skipped: number;
    errors: number;
  } | null>(null);
  const [highlightedError, setHighlightedError] = useState<string | null>(null);
  const [removedRows, setRemovedRows] = useState<ParsedRow[]>([]);
  const [allowOverwrite, setAllowOverwrite] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [correctedDownloaded, setCorrectedDownloaded] = useState(false);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);
  const duplicateRows = invalidRows.filter((r) => r.isDuplicate);
  const intraBatchDuplicateRows = duplicateRows.filter((r) => r.isIntraBatchDuplicate);
  const dbDuplicateRows = duplicateRows.filter((r) => !r.isIntraBatchDuplicate);
  const overwriteRows = validRows.filter((r) => r.isOverwrite);

  const handleAllowOverwriteChange = useCallback(
    (checked: boolean) => {
      setAllowOverwrite(checked);
      setPendingConfirm(false);
      if (rows.length === 0) return;
      const slugFreq = new Map<string, number>();
      for (const r of rows) {
        if (r.slug) slugFreq.set(r.slug, (slugFreq.get(r.slug) ?? 0) + 1);
      }
      const intraBatchDupes = new Set(
        [...slugFreq.entries()].filter(([, n]) => n > 1).map(([s]) => s),
      );
      setRows((prev) =>
        prev.map((r) => {
          const raw: RawRow = {
            slug: r.slug,
            category: r.category,
            name_ko: r.name_ko,
            subCategory: r.subCategory,
            material: r.material,
            features_ko: r.features_ko,
            certs: r.certs.join(","),
          };
          const revalidated = validateRow(raw, r.index, existingSlugs, intraBatchDupes, checked);
          return { ...revalidated, status: r.status, originallyInvalid: r.originallyInvalid };
        }),
      );
    },
    [rows, existingSlugs],
  );

  const errorCounts = invalidRows.reduce<Map<string, number>>((acc, row) => {
    for (const err of row.errors) {
      acc.set(err, (acc.get(err) ?? 0) + 1);
    }
    return acc;
  }, new Map());

  const handleErrorSummaryClick = useCallback(
    (errMsg: string) => {
      if (highlightedError === errMsg) {
        setHighlightedError(null);
        return;
      }
      setHighlightedError(errMsg);
      const firstAffected = invalidRows.find((r) => r.errors.includes(errMsg));
      if (firstAffected == null) return;
      const el = document.getElementById(`import-row-${firstAffected.index}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [highlightedError, invalidRows],
  );

  const originallyInvalidRows = rows.filter((r) => r.originallyInvalid);
  const correctedRows = originallyInvalidRows.filter((r) => r.errors.length === 0);
  const allCorrected =
    originallyInvalidRows.length > 0 && correctedRows.length === originallyInvalidRows.length;

  const doneCount = rows.filter((r) => r.status === "done").length;
  const skippedCount = rows.filter((r) => r.status === "skipped").length;
  const errorCount = rows.filter((r) => r.status === "error").length;
  const finishedCount = doneCount + skippedCount + errorCount;
  const totalToProcess = validRows.length;
  const progress = totalToProcess > 0 ? Math.round((finishedCount / totalToProcess) * 100) : 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setRows([]);
    setRemovedRows([]);
    setImportResult(null);
    setCorrectedDownloaded(false);

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

      // Fetch existing slugs first so we can mark duplicates during validation
      let slugSet = new Set<string>();
      let productMap = new Map<string, AdminProduct>();
      try {
        const existing = await adminListProducts();
        productMap = new Map(existing.map((p) => [p.slug, p]));
        slugSet = new Set(productMap.keys());
        setExistingSlugs(slugSet);
        setExistingProductMap(productMap);
      } catch {
        toast({
          title: "슬러그 중복 확인 실패",
          description: "기존 제품 슬러그를 불러오지 못했습니다. 중복 감지 없이 진행합니다.",
          variant: "destructive",
        });
        setExistingSlugs(new Set());
        setExistingProductMap(new Map());
      }

      // Build intra-file duplicate slug set: any slug that appears more than once in this batch
      const slugFreq = new Map<string, number>();
      for (const raw of rawRows) {
        const s = (raw.slug ?? "").trim();
        if (s) slugFreq.set(s, (slugFreq.get(s) ?? 0) + 1);
      }
      const intraBatchDupes = new Set(
        [...slugFreq.entries()].filter(([, n]) => n > 1).map(([s]) => s),
      );

      const parsed = rawRows.map((raw, i) => {
        const row = validateRow(raw, i, slugSet, intraBatchDupes, allowOverwrite);
        return { ...row, originallyInvalid: row.errors.length > 0 };
      });
      setRows(parsed);
      const hasInvalid = parsed.some((r) => r.errors.length > 0);
      if (hasInvalid) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            errorSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });
      }
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

  const handleRestoreRow = useCallback((row: ParsedRow) => {
    setRemovedRows((prev) => prev.filter((r) => r.index !== row.index));
    setRows((prev) => {
      const restored = [...prev, row];
      restored.sort((a, b) => a.index - b.index);
      return restored;
    });
  }, []);

  const handleRemoveAllInvalid = useCallback(() => {
    const toRemove = rows.filter((r) => r.errors.length > 0);
    setRows((prev) => prev.filter((r) => r.errors.length === 0));
    setRemovedRows((prev) => [...prev, ...toRemove]);
  }, [rows]);

  const handleRemoveAllDuplicates = useCallback(() => {
    const toRemove = rows.filter((r) => r.isDuplicate);
    setRows((prev) => prev.filter((r) => !r.isDuplicate));
    setRemovedRows((prev) => [...prev, ...toRemove]);
  }, [rows]);

  const handleRemoveRow = (rowIndex: number) => {
    const row = rows.find((r) => r.index === rowIndex);
    if (!row) return;
    setRows((prev) => prev.filter((r) => r.index !== rowIndex));
    setRemovedRows((prev) => [...prev, row]);
    toast({
      description: `행 #${rowIndex + 1} 삭제됨`,
      action: (
        <ToastAction altText="되돌리기" onClick={() => handleRestoreRow(row)}>
          되돌리기
        </ToastAction>
      ),
    });
  };

  const handleFieldEdit = (
    rowIndex: number,
    field: "slug" | "category" | "name_ko" | "certs",
    value: string,
  ) => {
    setRows((prev) => {
      // Build the prospective row data with the edit applied
      const prospective = prev.map((r) => {
        if (r.index !== rowIndex) return r;
        return {
          ...r,
          slug: field === "slug" ? value.trim() : r.slug,
          category: field === "category" ? value : r.category,
          name_ko: field === "name_ko" ? value : r.name_ko,
          certs: field === "certs" ? value.split(",").map((c) => c.trim()).filter(Boolean) : r.certs,
        };
      });

      // Recompute intra-file duplicate slugs across the whole updated batch
      const slugFreq = new Map<string, number>();
      for (const r of prospective) {
        if (r.slug) slugFreq.set(r.slug, (slugFreq.get(r.slug) ?? 0) + 1);
      }
      const intraBatchDupes = new Set(
        [...slugFreq.entries()].filter(([, n]) => n > 1).map(([s]) => s),
      );

      // Re-validate every row so that both the edited row and any affected siblings update
      return prospective.map((r) => {
        const raw: RawRow = {
          slug: r.slug,
          category: r.category,
          name_ko: r.name_ko,
          subCategory: r.subCategory,
          material: r.material,
          features_ko: r.features_ko,
          certs: r.certs.join(","),
        };
        const revalidated = validateRow(raw, r.index, existingSlugs, intraBatchDupes, allowOverwrite);
        return { ...revalidated, status: r.status, originallyInvalid: r.originallyInvalid };
      });
    });
  };

  const handleReimportCorrected = useCallback(() => {
    if (correctedRows.length === 0) return;

    const slugFreq = new Map<string, number>();
    for (const r of correctedRows) {
      if (r.slug) slugFreq.set(r.slug, (slugFreq.get(r.slug) ?? 0) + 1);
    }
    const intraBatchDupes = new Set(
      [...slugFreq.entries()].filter(([, n]) => n > 1).map(([s]) => s),
    );

    const fresh = correctedRows.map((r, i) => {
      const raw: RawRow = {
        slug: r.slug,
        category: r.category,
        subCategory: r.subCategory,
        material: r.material,
        name_ko: r.name_ko,
        features_ko: r.features_ko,
        certs: r.certs.join(","),
      };
      const validated = validateRow(raw, i, existingSlugs, intraBatchDupes, allowOverwrite);
      return { ...validated, originallyInvalid: validated.errors.length > 0 };
    });

    setRows(fresh);
    setRemovedRows([]);
    setImportResult(null);
    setHighlightedError(null);
    setFileName(`수정된 행 (${correctedRows.length}개)`);
    setCorrectedDownloaded(false);
  }, [correctedRows, existingSlugs, allowOverwrite]);

  const runImport = async () => {
    if (validRows.length === 0) return;
    setIsImporting(true);
    setPendingConfirm(false);
    setImportResult(null);

    // Re-fetch existing slugs immediately before processing to catch any
    // products created by another admin between file upload and import click.
    let freshSlugs = existingSlugs;
    let freshProductMap = existingProductMap;
    try {
      const freshProducts = await adminListProducts();
      freshProductMap = new Map(freshProducts.map((p) => [p.slug, p]));
      freshSlugs = new Set(freshProductMap.keys());
      setExistingSlugs(freshSlugs);
      setExistingProductMap(freshProductMap);
    } catch {
      // Non-fatal: proceed with the cached slug set; the DB constraint will
      // still catch true conflicts and surface them as row errors.
      toast({
        title: "슬러그 재확인 실패",
        description: "최신 슬러그 목록을 불러오지 못했습니다. 기존 목록으로 진행합니다.",
        variant: "destructive",
      });
    }

    // Synchronously compute which valid rows now conflict with the fresh slug
    // list (i.e. a product was created by another admin since file upload).
    // We use the closure value of `validRows` (derived from render-time `rows`)
    // so this is a deterministic, synchronous pass — no state-updater side
    // effects needed here.
    const lateConflictIndexes = new Set(
      validRows
        .filter((r) => freshSlugs.has(r.slug) && !r.isOverwrite)
        .map((r) => r.index),
    );

    if (lateConflictIndexes.size > 0) {
      // Mark conflicting rows in state for UI feedback.
      setRows((prev) =>
        prev.map((r) => {
          if (!lateConflictIndexes.has(r.index)) return r;
          return {
            ...r,
            isDuplicate: true,
            errors: [...r.errors, "slug 중복 (가져오기 직전 추가됨)"],
            status: "skipped" as RowStatus,
            errorMsg: "가져오는 사이 다른 관리자가 같은 슬러그로 제품을 등록했습니다.",
          };
        }),
      );
      toast({
        title: `슬러그 충돌 감지 — ${lateConflictIndexes.size}개 행 건너뜀`,
        description: `가져오기 직전에 ${lateConflictIndexes.size}개 슬러그가 이미 등록되어 있어 해당 행을 건너뜁니다. 나머지 행은 계속 가져옵니다.`,
        variant: "destructive",
      });
    }

    // Use fresh product map for overwrite lookups throughout the loop.
    const productMapForLoop = freshProductMap;

    // Filter out late-conflict rows — process only the remaining valid rows.
    const rowsToProcess = validRows.filter((r) => !lateConflictIndexes.has(r.index));

    let localDone = 0;
    let localSkipped = lateConflictIndexes.size;
    let localErrors = 0;

    if (rowsToProcess.length === 0) {
      setIsImporting(false);
      setImportResult({ done: localDone, skipped: localSkipped, errors: localErrors });
      toast({
        title: "가져오기 완료",
        description: `${localSkipped}개 슬러그 충돌로 건너뜀`,
      });
      return;
    }

    for (const row of rowsToProcess) {
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

        let diffSummary: string[] | undefined;
        if (row.isOverwrite) {
          const existingProduct = productMapForLoop.get(row.slug);
          if (existingProduct == null) throw new Error("기존 제품을 찾을 수 없습니다");
          diffSummary = computeDiff(row, existingProduct);
          await upsertMut.mutateAsync({ data: [payload] });
        } else {
          await createMut.mutateAsync({ data: payload });
        }

        updateRowStatus(row.index, {
          status: "done",
          errorMsg: translateFailed ? "번역 실패 (한국어만 저장됨)" : undefined,
          diffSummary,
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
    setImportResult({ done: localDone, skipped: localSkipped, errors: localErrors });

    const parts: string[] = [];
    if (localDone > 0) parts.push(`${localDone}개 성공`);
    if (localSkipped > 0) parts.push(`${localSkipped}개 중복 건너뜀`);
    if (localErrors > 0) parts.push(`${localErrors}개 오류`);
    toast({
      title: "가져오기 완료",
      description: parts.join(", "),
    });
  };

  const handleImportClick = () => {
    if (!canImport) return;
    if (overwriteRows.length > 0 && !pendingConfirm) {
      setPendingConfirm(true);
      return;
    }
    void runImport();
  };

  const canImport =
    rows.length > 0 && invalidRows.length === 0 && !isImporting && validRows.length > 0;

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
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">파일 업로드</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4" />
            템플릿 다운로드
          </Button>
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

          <div className="rounded-md border border-border overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium bg-muted/30 hover:bg-muted/50 transition-colors"
              onClick={() => setShowExample((v) => !v)}
            >
              <span>예시 보기</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  showExample && "rotate-180",
                )}
              />
            </button>

            {showExample && (
              <div className="border-t border-border">
                <div className="divide-y divide-border text-xs">
                  {[
                    { key: "slug", hint: null, value: TEMPLATE_EXAMPLE[0], render: "code" as const },
                    { key: "category", hint: null, value: TEMPLATE_EXAMPLE[1], render: "text" as const },
                    { key: "subCategory", hint: null, value: TEMPLATE_EXAMPLE[2], render: "text" as const },
                    { key: "material", hint: null, value: TEMPLATE_EXAMPLE[3], render: "text" as const },
                    { key: "name_ko", hint: null, value: TEMPLATE_EXAMPLE[4], render: "text" as const },
                    { key: "features_ko", hint: "줄바꿈으로 구분", value: TEMPLATE_EXAMPLE[5] ?? "", render: "lines" as const },
                    { key: "certs", hint: "쉼표로 구분", value: TEMPLATE_EXAMPLE[6] ?? "", render: "tags" as const },
                  ].map(({ key, hint, value, render }) => (
                    <div key={key} className="flex items-start gap-3 px-4 py-2.5 bg-muted/10">
                      <div className="w-36 shrink-0 flex items-center gap-1.5 pt-0.5">
                        <code className="bg-muted rounded px-1 py-0.5 text-[11px] text-foreground">
                          {key}
                        </code>
                        {hint && (
                          <span className="text-[10px] text-accent/80 bg-accent/10 rounded px-1 py-0.5 whitespace-nowrap">
                            {hint}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-foreground">
                        {render === "code" && (
                          <code className="bg-muted rounded px-1 py-0.5 text-[11px]">{value}</code>
                        )}
                        {render === "text" && <span>{value}</span>}
                        {render === "lines" && (
                          <ul className="space-y-0.5">
                            {value.split("\n").map((line, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-muted-foreground mt-0.5">·</span>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {render === "tags" && (
                          <div className="flex flex-wrap gap-1">
                            {value.split(",").map((cert) => (
                              <span
                                key={cert}
                                className="text-[10px] bg-accent/10 text-accent rounded-full px-2 py-0.5 whitespace-nowrap"
                              >
                                {cert.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm gap-3">
                <span className="text-muted-foreground shrink-0">
                  총 <strong className="text-foreground">{rows.length}</strong>개 행 파싱됨 —{" "}
                  <span className="text-green-600">{validRows.length}개 가져올 예정</span>
                  {invalidRows.length > 0 && (
                    <>
                      {", "}
                      <span className="text-destructive">{invalidRows.length}개 오류</span>
                      {duplicateRows.length > 0 && (
                        <span className="text-destructive">
                          {" "}(슬러그 중복 {duplicateRows.length}개 포함)
                        </span>
                      )}
                    </>
                  )}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Switch
                      checked={allowOverwrite}
                      onCheckedChange={handleAllowOverwriteChange}
                      disabled={isImporting}
                      id="allow-overwrite-toggle"
                    />
                    <span className="text-xs font-medium text-muted-foreground">덮어쓰기 허용</span>
                  </label>
                  {allCorrected && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 border-green-500/50 text-green-700 hover:bg-green-500/5 hover:text-green-800"
                        onClick={() => {
                          downloadCorrectedRows(correctedRows);
                          setCorrectedDownloaded(true);
                        }}
                      >
                        <Download className="h-4 w-4" />
                        수정된 파일 다운로드
                      </Button>
                      {correctedDownloaded && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2 border-blue-500/50 text-blue-700 hover:bg-blue-500/5 hover:text-blue-800"
                          onClick={handleReimportCorrected}
                          disabled={isImporting}
                        >
                          <Upload className="h-4 w-4" />
                          수정된 행 바로 가져오기
                        </Button>
                      )}
                    </>
                  )}
                  {invalidRows.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                      onClick={() => downloadErrorRows(invalidRows)}
                    >
                      <Download className="h-4 w-4" />
                      오류 행만 내보내기
                    </Button>
                  )}

                  <Button
                    onClick={handleImportClick}
                    disabled={!canImport}
                    className="gap-2"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                    {isImporting
                      ? "가져오는 중…"
                      : `${validRows.length}개 가져오기`}
                  </Button>
                </div>
              </div>

              {originallyInvalidRows.length > 0 && !allCorrected && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 font-medium text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {correctedRows.length} / {originallyInvalidRows.length} 오류 수정됨
                  </span>
                  {originallyInvalidRows.length - correctedRows.length > 0 && (
                    <span className="text-muted-foreground">
                      — {originallyInvalidRows.length - correctedRows.length}개 남음
                    </span>
                  )}
                </div>
              )}

              {invalidRows.length > 0 && errorCounts.size > 0 && (
                <div ref={errorSummaryRef} className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-destructive">오류 유형별 요약 — 클릭하면 해당 행으로 이동</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isImporting}
                      onClick={handleRemoveAllInvalid}
                      className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive shrink-0 h-7 text-xs px-2.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      오류 행 전체 삭제
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {Array.from(errorCounts.entries()).map(([errMsg, count]) => {
                      const isActive = highlightedError === errMsg;
                      return (
                        <button
                          key={errMsg}
                          type="button"
                          onClick={() => handleErrorSummaryClick(errMsg)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            isActive
                              ? "border-destructive bg-destructive text-white"
                              : "border-destructive/40 bg-background text-destructive hover:bg-destructive/10",
                          )}
                        >
                          {errMsg}
                          <span
                            className={cn(
                              "inline-flex items-center justify-center rounded-full w-4 h-4 text-[10px] font-bold",
                              isActive ? "bg-white/20 text-white" : "bg-destructive/10 text-destructive",
                            )}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                    {highlightedError !== null && (
                      <button
                        type="button"
                        onClick={() => setHighlightedError(null)}
                        className="inline-flex items-center gap-1 rounded-full border border-muted-foreground/30 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <span aria-hidden="true">×</span>
                        해제
                      </button>
                    )}
                  </div>
                </div>
              )}

              {duplicateRows.length > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 font-medium">
                        슬러그 중복 — 가져오기를 진행할 수 없습니다
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {dbDuplicateRows.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isImporting}
                          onClick={() => handleAllowOverwriteChange(true)}
                          className="gap-1.5 border-amber-400/60 text-amber-800 hover:bg-amber-100 hover:text-amber-900 h-7 text-xs px-2.5"
                        >
                          덮어쓰기 허용
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isImporting}
                        onClick={handleRemoveAllDuplicates}
                        className="gap-1.5 border-amber-400/60 text-amber-800 hover:bg-amber-100 hover:text-amber-900 h-7 text-xs px-2.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        중복 행 전체 삭제
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-amber-700 pl-6">
                    {intraBatchDuplicateRows.length > 0 && dbDuplicateRows.length > 0
                      ? `아래 ${duplicateRows.length}개 슬러그 중 ${intraBatchDuplicateRows.length}개는 파일 내에서, ${dbDuplicateRows.length}개는 이미 등록된 제품과 충돌합니다.`
                      : intraBatchDuplicateRows.length > 0
                        ? `아래 ${intraBatchDuplicateRows.length}개 슬러그가 이 파일 안에서 중복됩니다.`
                        : `아래 ${dbDuplicateRows.length}개 슬러그가 이미 등록된 제품과 충돌합니다.`}
                    {" "}슬러그를 다른 값으로 변경하거나 해당 행을 삭제하세요.
                    {dbDuplicateRows.length > 0 && " 또는 \"덮어쓰기 허용\"을 켜서 기존 제품을 교체할 수 있습니다."}
                  </p>
                  <ul className="pl-6 space-y-1.5">
                    {duplicateRows.map((row) => {
                      const productId = row.isIntraBatchDuplicate ? undefined : existingProductMap.get(row.slug)?.id;
                      return (
                        <li key={`${row.slug}-${row.index}`} className="flex items-center gap-2 text-xs">
                          <code className="bg-amber-100 text-amber-800 border border-amber-200 rounded px-1.5 py-0.5 text-[11px] font-mono">
                            {row.slug}
                          </code>
                          {row.isIntraBatchDuplicate ? (
                            <span className="text-amber-700">파일 내 중복 (행 #{row.index + 1})</span>
                          ) : productId != null ? (
                            <Link
                              href={`/products/${productId}`}
                              className="text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium"
                            >
                              기존 제품 편집하기 →
                            </Link>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {overwriteRows.length > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 font-medium">
                      덮어쓰기 허용 — 아래 {overwriteRows.length}개 제품의 기존 데이터가 교체됩니다
                    </p>
                  </div>
                  <ul className="pl-6 space-y-1.5">
                    {overwriteRows.map((row) => {
                      const productId = existingProductMap.get(row.slug)?.id;
                      return (
                        <li key={row.slug} className="flex items-center gap-2 text-xs">
                          <code className="bg-amber-100 text-amber-800 border border-amber-200 rounded px-1.5 py-0.5 text-[11px] font-mono">
                            {row.slug}
                          </code>
                          {productId != null && (
                            <Link
                              href={`/products/${productId}`}
                              className="text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium"
                            >
                              현재 내용 보기 →
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {pendingConfirm && overwriteRows.length > 0 && (
                <div className="rounded-md border-2 border-amber-400 bg-amber-50 px-4 py-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-amber-900">
                        기존 제품 {overwriteRows.length}개를 교체합니다. 계속하시겠습니까?
                      </p>
                      <p className="text-xs text-amber-700">
                        덮어쓰기는 되돌릴 수 없습니다. 이미지, 번역, 정렬 순서 등 기존 내용이 모두 파일의 데이터로 대체됩니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-8">
                    <Button
                      size="sm"
                      className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => void runImport()}
                    >
                      <PlayCircle className="h-4 w-4" />
                      교체 후 가져오기
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingConfirm(false)}
                      className="border-amber-400/60 text-amber-800 hover:bg-amber-100"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
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
                  ? `${totalToProcess} / ${totalToProcess} 처리됨`
                  : `${finishedCount} / ${totalToProcess} 처리됨`}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-600">
                  {importResult !== null ? importResult.done : doneCount}개 완료
                </span>
                {(importResult !== null ? importResult.skipped : skippedCount) > 0 && (
                  <>
                    {" · "}
                    <span className="text-amber-600">
                      {importResult !== null ? importResult.skipped : skippedCount}개 건너뜀
                    </span>
                  </>
                )}
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
                    <th className="px-4 py-2.5 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const hasValidationError = row.errors.length > 0;
                    const isHighlighted =
                      highlightedError !== null && row.errors.includes(highlightedError);
                    return (
                      <tr
                        key={row.index}
                        id={`import-row-${row.index}`}
                        className={cn(
                          "border-b border-border last:border-0 transition-colors",
                          isHighlighted
                            ? "ring-2 ring-inset ring-destructive bg-destructive/10"
                            : hasValidationError
                              ? "bg-destructive/5"
                              : row.isOverwrite && row.status === "pending"
                                ? "bg-amber-500/5"
                                : row.status === "done"
                                  ? "bg-green-500/5"
                                  : row.status === "error"
                                    ? "bg-destructive/5"
                                    : row.status === "skipped"
                                      ? "bg-amber-500/5"
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
                                    : row.status === "skipped"
                                      ? "text-amber-500"
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
                          {hasValidationError && row.status === "pending" ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={row.slug}
                                onChange={(e) =>
                                  handleFieldEdit(row.index, "slug", e.target.value)
                                }
                                placeholder="slug"
                                className={cn(
                                  "w-full text-xs font-mono rounded border px-1.5 py-1 bg-background focus:outline-none focus:ring-1",
                                  row.isDuplicate
                                    ? "border-amber-400 focus:ring-amber-400"
                                    : row.errors.some((e) => e.includes("slug"))
                                      ? "border-destructive focus:ring-destructive"
                                      : "border-border focus:ring-ring",
                                )}
                              />
                              {row.isDuplicate && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="inline-flex items-center gap-1 text-[10px] rounded px-1.5 py-0.5 bg-amber-100 text-amber-800 font-medium">
                                    <AlertTriangle className="h-3 w-3" />
                                    {row.isIntraBatchDuplicate ? "파일 내 중복" : "중복 슬러그"}
                                  </span>
                                  {!row.isIntraBatchDuplicate && existingProductMap.get(row.slug)?.id != null && (
                                    <Link
                                      href={`/products/${existingProductMap.get(row.slug)?.id}`}
                                      className="text-[10px] text-amber-700 underline underline-offset-2 hover:text-amber-900 whitespace-nowrap"
                                    >
                                      편집하기 →
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <code
                                className={cn(
                                  "text-xs rounded px-1 py-0.5",
                                  row.isDuplicate
                                    ? "bg-amber-100 text-amber-800"
                                    : row.isOverwrite
                                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                                      : "bg-muted",
                                )}
                              >
                                {row.slug || <span className="text-muted-foreground italic">없음</span>}
                              </code>
                              {row.isOverwrite && row.status === "pending" && (
                                <div>
                                  <span className="inline-flex items-center gap-1 text-[10px] rounded px-1.5 py-0.5 bg-amber-100 text-amber-800 font-medium">
                                    <AlertTriangle className="h-3 w-3" />
                                    기존 제품 교체됨
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs">
                          {hasValidationError && row.status === "pending" ? (
                            <input
                              type="text"
                              value={row.category}
                              onChange={(e) =>
                                handleFieldEdit(row.index, "category", e.target.value)
                              }
                              placeholder="category"
                              className={cn(
                                "w-full text-xs rounded border px-1.5 py-1 bg-background focus:outline-none focus:ring-1",
                                row.errors.some((e) => e.includes("category"))
                                  ? "border-destructive focus:ring-destructive"
                                  : "border-border focus:ring-ring",
                              )}
                            />
                          ) : (
                            row.category || "—"
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs max-w-[200px]">
                          {hasValidationError && row.status === "pending" ? (
                            <input
                              type="text"
                              value={row.name_ko}
                              onChange={(e) =>
                                handleFieldEdit(row.index, "name_ko", e.target.value)
                              }
                              placeholder="name_ko"
                              className={cn(
                                "w-full text-xs rounded border px-1.5 py-1 bg-background focus:outline-none focus:ring-1",
                                row.errors.some((e) => e.includes("name_ko"))
                                  ? "border-destructive focus:ring-destructive"
                                  : "border-border focus:ring-ring",
                              )}
                            />
                          ) : (
                            <span className="truncate block">{row.name_ko || "—"}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {hasValidationError && row.status === "pending" ? (
                            <input
                              type="text"
                              value={row.certs.join(",")}
                              onChange={(e) =>
                                handleFieldEdit(row.index, "certs", e.target.value)
                              }
                              placeholder="ISO22716,COSMOS"
                              className="w-full text-xs rounded border border-border px-1.5 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          ) : (
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
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {hasValidationError ? (
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
                          ) : row.status === "skipped" ? (
                            <div className="flex items-start gap-1.5">
                              <SkipForward className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-amber-600">{row.errorMsg ?? "건너뜀"}</span>
                            </div>
                          ) : row.status === "done" && row.isOverwrite && row.diffSummary ? (
                            <div className="space-y-1">
                              <span className="text-xs text-green-600 font-medium">✓ 교체됨</span>
                              {row.diffSummary.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {row.diffSummary.map((d) => (
                                    <span
                                      key={d}
                                      className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5"
                                    >
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">변경 없음</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-green-600">✓</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            type="button"
                            disabled={isImporting}
                            onClick={() => handleRemoveRow(row.index)}
                            className="text-muted-foreground/40 hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="행 삭제"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
              setRemovedRows([]);
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
