import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminGetNotice,
  useAdminCreateNotice,
  useAdminUpdateNotice,
  getAdminListNoticesQueryKey,
  getAdminGetNoticeQueryKey,
  type AdminNoticeInput,
  type NoticeTranslation,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TranslationFields } from "@/components/TranslationFields";
import { ImageUploader } from "@/components/ImageUploader";
import { LANGS } from "@/lib/langs";

const NOTICE_FIELDS = [
  { key: "title" as const, label: "제목", kind: "text" as const, context: "news article title" },
  { key: "excerpt" as const, label: "요약", kind: "text" as const, context: "short article summary" },
  { key: "body" as const, label: "본문 (HTML)", kind: "richtext" as const, context: "rich html news article body" },
];

const CATEGORY_SUGGESTIONS = ["company", "industry", "regulation", "press"];
const REGION_SUGGESTIONS = ["KR", "JP", "CN", "EU", "US", "GLOBAL"];

function emptyTranslations(): NoticeTranslation[] {
  return LANGS.map((lang) => ({ lang, title: "", excerpt: "", body: "" }));
}

function isoDateOnly(d: Date): string {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export default function NoticeEdit() {
  const params = useParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : null;
  const isNew = id === null;
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: existing, isLoading: isLoadingExisting } = useAdminGetNotice(
    id ?? 0,
    {
      query: {
        queryKey: getAdminGetNoticeQueryKey(id ?? 0),
        enabled: !isNew,
      },
    },
  );

  const createMut = useAdminCreateNotice();
  const updateMut = useAdminUpdateNotice();

  const [form, setForm] = useState<AdminNoticeInput>({
    slug: "",
    category: "company",
    region: "GLOBAL",
    thumbnailUrl: null,
    published: true,
    publishedAt: new Date().toISOString(),
    translations: emptyTranslations(),
  });

  useEffect(() => {
    if (existing) {
      const merged = LANGS.map((lang) => {
        const found = existing.translations.find((t) => t.lang === lang);
        return found ?? { lang, title: "", excerpt: "", body: "" };
      });
      setForm({
        slug: existing.slug,
        category: existing.category,
        region: existing.region,
        thumbnailUrl: existing.thumbnailUrl ?? null,
        published: existing.published,
        publishedAt: existing.publishedAt,
        translations: merged,
      });
    }
  }, [existing]);

  const update = <K extends keyof AdminNoticeInput>(key: K, value: AdminNoticeInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug.trim()) {
      toast({ title: "슬러그 필수", description: "URL 슬러그를 입력하세요.", variant: "destructive" });
      return;
    }
    const ko = form.translations.find((t) => t.lang === "ko");
    if (!ko?.title.trim()) {
      toast({
        title: "한국어 제목 필수",
        description: "KO 탭에서 제목을 입력하세요.",
        variant: "destructive",
      });
      return;
    }
    try {
      if (isNew) {
        const created = await createMut.mutateAsync({ data: form });
        await qc.invalidateQueries({ queryKey: getAdminListNoticesQueryKey() });
        toast({ title: "공지 등록 완료", description: ko.title });
        navigate(`/notices/${created.id}`);
      } else if (id !== null) {
        await updateMut.mutateAsync({ id, data: form });
        await qc.invalidateQueries({ queryKey: getAdminListNoticesQueryKey() });
        await qc.invalidateQueries({ queryKey: getAdminGetNoticeQueryKey(id) });
        toast({ title: "저장 완료", description: ko.title });
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
          <Link href="/notices">
            <Button variant="ghost" size="icon" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "신규 공지 등록" : "공지 편집"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isNew ? "5개 언어 콘텐츠를 입력하세요." : `ID #${id}`}
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
              placeholder="2025-eu-cosmetics-update"
              required
              data-testid="input-slug"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="publishedAt">게시일</Label>
            <Input
              id="publishedAt"
              type="date"
              value={isoDateOnly(new Date(form.publishedAt))}
              onChange={(e) => {
                const d = e.target.value ? new Date(`${e.target.value}T00:00:00`) : new Date();
                update("publishedAt", d.toISOString());
              }}
              data-testid="input-published-at"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">카테고리 *</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              list="notice-cat-suggestions"
              required
            />
            <datalist id="notice-cat-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="region">지역 *</Label>
            <Input
              id="region"
              value={form.region}
              onChange={(e) => update("region", e.target.value)}
              list="region-suggestions"
              required
            />
            <datalist id="region-suggestions">
              {REGION_SUGGESTIONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="thumbnailUrl">썸네일 이미지</Label>
            <Input
              id="thumbnailUrl"
              type="text"
              value={form.thumbnailUrl ?? ""}
              onChange={(e) => update("thumbnailUrl", e.target.value || null)}
              placeholder="이미지를 업로드하거나 URL을 직접 입력하세요"
            />
            <ImageUploader
              value={form.thumbnailUrl}
              onChange={(url) => update("thumbnailUrl", url)}
              previewClassName="h-24 w-40 rounded object-cover bg-muted border border-border"
              testId="upload-notice-thumb"
            />
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
        fields={NOTICE_FIELDS}
        value={form.translations as Array<NoticeTranslation>}
        onChange={(next) => update("translations", next as NoticeTranslation[])}
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
