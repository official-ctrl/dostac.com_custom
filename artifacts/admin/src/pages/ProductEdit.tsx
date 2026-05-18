import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminGetProduct,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  getAdminListProductsQueryKey,
  getAdminGetProductQueryKey,
  type AdminProductInput,
  type Translation,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, ArrowLeft, Loader2, Plus, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TranslationFields } from "@/components/TranslationFields";
import { ImageUploader } from "@/components/ImageUploader";
import { LANGS } from "@/lib/langs";

const PRODUCT_FIELDS = [
  { key: "name" as const, label: "제품명", kind: "text" as const, context: "cosmetic product name" },
  {
    key: "valueProp" as const,
    label: "Value Proposition (한 줄 B2B 강점)",
    kind: "text" as const,
    context: "B2B value proposition tagline (OEM/ODM, MOQ, certs)",
    placeholder: "예: Korean OEM/ODM · MOQ 협의 가능 · 글로벌 인증 완비",
  },
  { key: "headline" as const, label: "한 줄 설명", kind: "text" as const, context: "marketing tagline" },
  { key: "body" as const, label: "상세 설명 (HTML)", kind: "richtext" as const, context: "rich html marketing body" },
  {
    key: "features" as const,
    label: "주요 특징 (한 줄에 하나씩)",
    kind: "textarea" as const,
    context:
      "Newline-separated list of short B2B product feature bullets. Output MUST be plain text with one feature per line (\\n separated). Do NOT add numbering, hyphens, bullets (•/-), or extra blank lines. Preserve the same number of lines as the input.",
    placeholder: "Private Label / Full ODM 모두 지원\n샘플 2주 · 양산 6주 표준 리드타임\n...",
    helpText: "줄바꿈으로 구분 — 공개 페이지에서 불릿 리스트로 표시됩니다.",
  },
  {
    key: "material" as const,
    label: "소재 / 재료",
    kind: "textarea" as const,
    context: "product material description for cosmetic/personal care OEM product",
    placeholder: "예: 100% Organic Cotton, Spunlace Nonwoven",
    helpText: "소재 정보 — 제품 상세 페이지에 표시됩니다.",
  },
];

const CATEGORY_SUGGESTIONS = ["skincare", "suncare", "haircare", "bodycare", "makeup", "wellness"];
const CERT_SUGGESTIONS = ["ISO 22716", "CGMP", "CE", "FDA", "Halal", "Vegan", "EWG Green"];

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

export default function ProductEdit() {
  const params = useParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : null;
  const isNew = id === null;
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: existing, isLoading: isLoadingExisting } = useAdminGetProduct(
    id ?? 0,
    {
      query: {
        queryKey: getAdminGetProductQueryKey(id ?? 0),
        enabled: !isNew,
      },
    },
  );

  const createMut = useAdminCreateProduct();
  const updateMut = useAdminUpdateProduct();

  const [form, setForm] = useState<AdminProductInput>({
    slug: "",
    category: "skincare",
    subCategory: "",
    sortOrder: 100,
    imageUrl: null,
    published: true,
    certs: [],
    translations: emptyTranslations(),
  });

  const [certInput, setCertInput] = useState("");

  useEffect(() => {
    if (existing) {
      const merged = LANGS.map((lang) => {
        const found = existing.translations.find((t) => t.lang === lang);
        return (
          found ?? {
            lang,
            name: "",
            headline: "",
            valueProp: "",
            body: "",
            features: "",
            material: "",
          }
        );
      });
      setForm({
        slug: existing.slug,
        category: existing.category,
        subCategory: existing.subCategory ?? "",
        sortOrder: existing.sortOrder,
        imageUrl: existing.imageUrl ?? null,
        published: existing.published,
        certs: existing.certs ?? [],
        translations: merged,
      });
    }
  }, [existing]);

  const update = <K extends keyof AdminProductInput>(key: K, value: AdminProductInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addCert = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (form.certs.includes(v)) return;
    update("certs", [...form.certs, v]);
    setCertInput("");
  };

  const removeCert = (idx: number) => {
    update(
      "certs",
      form.certs.filter((_, i) => i !== idx),
    );
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug.trim()) {
      toast({ title: "슬러그 필수", description: "URL 슬러그를 입력하세요.", variant: "destructive" });
      return;
    }
    const ko = form.translations.find((t) => t.lang === "ko");
    if (!ko?.name.trim()) {
      toast({ title: "한국어 제품명 필수", description: "KO 탭에서 제품명을 입력하세요.", variant: "destructive" });
      return;
    }
    try {
      if (isNew) {
        const created = await createMut.mutateAsync({ data: form });
        await qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        toast({ title: "제품 등록 완료", description: ko.name });
        if (!form.imageUrl) {
          toast({
            title: "이미지 없음",
            description: "제품 이미지가 없습니다 — 웹사이트에서 플레이스홀더 이미지가 표시됩니다.",
          });
        }
        navigate(`/products/${created.id}`);
      } else if (id !== null) {
        await updateMut.mutateAsync({ id, data: form });
        await qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        await qc.invalidateQueries({ queryKey: getAdminGetProductQueryKey(id) });
        toast({ title: "저장 완료", description: ko.name });
        if (!form.imageUrl) {
          toast({
            title: "이미지 없음",
            description: "제품 이미지가 없습니다 — 웹사이트에서 플레이스홀더 이미지가 표시됩니다.",
          });
        }
      }
    } catch (err) {
      toast({
        title: "저장 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  if (!isNew && isLoadingExisting) {
    return (
      <div className="px-8 py-8 max-w-5xl">
        <p className="text-sm text-muted-foreground">로딩 중…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="px-8 py-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="ghost" size="icon" type="button" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "신규 제품 등록" : "제품 편집"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isNew ? "5개 언어 콘텐츠와 이미지·카테고리를 입력하세요." : `ID #${id}`}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isSaving} className="gap-2" data-testid="button-save">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          저장
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="slug">URL 슬러그 *</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="hydra-snail-essence"
              required
              data-testid="input-slug"
            />
            <p className="text-xs text-muted-foreground">
              영문 소문자/숫자/하이픈만 사용. URL: /products/{form.slug || "..."}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">카테고리 *</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              list="category-suggestions"
              required
              data-testid="input-category"
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subCategory">서브카테고리 (선택)</Label>
            <Input
              id="subCategory"
              value={form.subCategory}
              onChange={(e) => update("subCategory", e.target.value)}
              placeholder="예: Baby Wipes, Round Cotton Pad"
              data-testid="input-sub-category"
            />
            <p className="text-xs text-muted-foreground">카테고리 내 세분류 — 제품 필터링에 사용됩니다.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">정렬 순서</Label>
            <Input
              id="sortOrder"
              type="number"
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value) || 0)}
              data-testid="input-sort-order"
            />
            <p className="text-xs text-muted-foreground">낮은 숫자가 먼저 표시됩니다.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">대표 이미지</Label>
            <Input
              id="imageUrl"
              type="text"
              value={form.imageUrl ?? ""}
              onChange={(e) => update("imageUrl", e.target.value || null)}
              placeholder="이미지를 업로드하거나 URL을 직접 입력하세요"
              data-testid="input-image-url"
            />
            <ImageUploader
              value={form.imageUrl}
              onChange={(url) => update("imageUrl", url)}
              previewClassName="h-24 w-24 rounded object-cover bg-muted border border-border"
              testId="upload-product-image"
            />
            {!form.imageUrl && (
              <p className="flex items-center gap-1.5 text-xs text-amber-600 mt-1" data-testid="warning-no-image">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                이미지가 없습니다 — 웹사이트에서 플레이스홀더가 표시됩니다.
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2 pt-2 border-t border-border">
            <Label htmlFor="cert-input">인증 / 마크 (Certifications)</Label>
            <p className="text-xs text-muted-foreground">
              모든 언어 공통 — 추가 후 Enter 또는 + 버튼. 공개 페이지 우측 컬럼에 칩으로 표시됩니다.
            </p>
            <div className="flex flex-wrap gap-2 min-h-[2rem]">
              {form.certs.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  아직 추가된 인증이 없습니다.
                </span>
              ) : (
                form.certs.map((c, i) => (
                  <span
                    key={`${c}-${i}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/30 px-3 py-1 text-xs font-medium text-accent"
                    data-testid={`cert-chip-${i}`}
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => removeCert(i)}
                      className="hover:text-destructive"
                      aria-label={`${c} 삭제`}
                      data-testid={`cert-remove-${i}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="cert-input"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCert(certInput);
                  }
                }}
                placeholder="예: ISO 22716"
                list="cert-suggestions"
                data-testid="input-cert"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => addCert(certInput)}
                data-testid="button-add-cert"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <datalist id="cert-suggestions">
                {CERT_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex items-center gap-3 md:col-span-2 pt-2 border-t border-border">
            <Switch
              id="published"
              checked={form.published}
              onCheckedChange={(v) => update("published", v)}
              data-testid="switch-published"
            />
            <Label htmlFor="published" className="cursor-pointer">
              {form.published ? "게시 중 — 공개 사이트에 표시됨" : "비공개 — 임시저장"}
            </Label>
          </div>
        </CardContent>
      </Card>

      <TranslationFields
        fields={PRODUCT_FIELDS}
        value={form.translations as Array<Translation>}
        onChange={(next) => update("translations", next as Translation[])}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          저장
        </Button>
      </div>
    </form>
  );
}
