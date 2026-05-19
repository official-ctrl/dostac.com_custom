import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminGetInquiry,
  useAdminUpdateInquiry,
  useAdminListProducts,
  getAdminGetInquiryQueryKey,
  getAdminListInquiriesQueryKey,
  getAdminInquiriesSummaryQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save, Mail, Building2, Tag, MessageSquare, Globe, Package, Layers, Wrench, ShoppingBag, FlaskConical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "new", label: "신규 (New)" },
  { value: "in_progress", label: "진행 중 (In Progress)" },
  { value: "completed", label: "완료 (Completed)" },
];

const INQUIRY_TYPE_LABEL: Record<string, string> = {
  oem: "OEM",
  odm: "ODM",
  sample: "Sample",
  other: "기타 (Other)",
};


export default function InquiryDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: inquiry, isLoading } = useAdminGetInquiry(id);
  const updateMut = useAdminUpdateInquiry();
  const { data: products } = useAdminListProducts();

  const [status, setStatus] = useState<string>("new");
  const [adminNote, setAdminNote] = useState<string>("");

  useEffect(() => {
    if (inquiry) {
      setStatus(inquiry.status);
      setAdminNote(inquiry.adminNote ?? "");
    }
  }, [inquiry]);

  const onSave = async () => {
    try {
      await updateMut.mutateAsync({
        id,
        data: {
          status: status as "new" | "in_progress" | "completed",
          adminNote,
        },
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: getAdminGetInquiryQueryKey(id) }),
        qc.invalidateQueries({ queryKey: getAdminListInquiriesQueryKey() }),
        qc.invalidateQueries({ queryKey: getAdminInquiriesSummaryQueryKey() }),
      ]);
      toast({ title: "저장 완료", description: "문의 상태가 업데이트 되었습니다." });
    } catch (err) {
      toast({
        title: "저장 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !inquiry) {
    return (
      <div className="px-8 py-8 max-w-4xl">
        <p className="text-sm text-muted-foreground">로딩 중…</p>
      </div>
    );
  }

  const typeLabel = inquiry.inquiryType
    ? INQUIRY_TYPE_LABEL[inquiry.inquiryType] ?? inquiry.inquiryType
    : "—";

  const linkedProduct = inquiry.productSlug && products
    ? products.find((p) => p.slug === inquiry.productSlug) ?? null
    : null;

  const linkedProductInterest = (() => {
    if (!inquiry.productInterest || !products) return null;
    const query = inquiry.productInterest.trim().toLowerCase();
    const matches = products.filter((p) =>
      p.translations.some((t) => t.name.trim().toLowerCase() === query)
    );
    return matches.length === 1 ? matches[0] : null;
  })();

  return (
    <div className="px-8 py-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/inquiries">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{inquiry.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            #{inquiry.id} · 접수: {new Date(inquiry.createdAt).toLocaleString("ko-KR")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">문의 상세</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow icon={Mail} label="이메일">
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-accent hover:underline break-all"
                    data-testid="link-email"
                  >
                    {inquiry.email}
                  </a>
                </InfoRow>
                <InfoRow icon={Building2} label="회사" value={inquiry.company || "—"} />
                <InfoRow icon={Tag} label="문의 유형">
                  {inquiry.inquiryType ? (
                    <Badge variant="secondary" data-testid="badge-inquiry-type">
                      {typeLabel}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </InfoRow>
                {inquiry.whatsapp && (
                  <InfoRow icon={MessageSquare} label="WhatsApp" value={inquiry.whatsapp} />
                )}
                {inquiry.country && (
                  <InfoRow icon={Globe} label="국가" value={inquiry.country} />
                )}
                {inquiry.productInterest && (
                  <InfoRow icon={Package} label="관심 제품">
                    <Link
                      href={
                        linkedProductInterest
                          ? `/products/${linkedProductInterest.id}`
                          : `/products?q=${encodeURIComponent(inquiry.productInterest)}`
                      }
                      className="text-accent hover:underline"
                      data-testid="link-product-interest"
                    >
                      {inquiry.productInterest}
                    </Link>
                  </InfoRow>
                )}
                {inquiry.material && (
                  <InfoRow icon={FlaskConical} label="성분/소재" value={inquiry.material} />
                )}
                {inquiry.quantity && (
                  <InfoRow icon={Layers} label="예상 수량" value={inquiry.quantity} />
                )}
                {inquiry.customization && (
                  <InfoRow icon={Wrench} label="맞춤 요청" value={inquiry.customization} />
                )}
              </div>

              {inquiry.productSlug && (
                <div
                  className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3"
                  data-testid="product-context-banner"
                >
                  <ShoppingBag className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide leading-none mb-0.5">
                      문의 제품
                    </p>
                    {linkedProduct ? (
                      <Link
                        href={`/products/${linkedProduct.id}`}
                        className="text-sm font-semibold text-blue-900 truncate hover:underline"
                        data-testid="text-parsed-product"
                      >
                        {linkedProduct.translations.find((t) => t.lang === "ko")?.name ?? inquiry.productSlug}
                      </Link>
                    ) : (
                      <p
                        className="text-sm font-semibold text-blue-900 truncate"
                        data-testid="text-parsed-product"
                      >
                        {inquiry.productSlug}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  메시지
                </Label>
                <p
                  className="mt-2 text-sm text-foreground whitespace-pre-wrap leading-relaxed"
                  data-testid="text-message"
                >
                  {inquiry.message}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">상태 및 메모</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">상태</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adminNote">내부 메모</Label>
                <Textarea
                  id="adminNote"
                  rows={6}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="대응 진행 상황, 견적 메모 등"
                  data-testid="input-admin-note"
                />
              </div>
              <Button
                onClick={() => void onSave()}
                disabled={updateMut.isPending}
                className="w-full gap-2"
                data-testid="button-save-inquiry"
              >
                {updateMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                저장
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">빠른 응답</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href={`mailto:${inquiry.email}?subject=Re: DOSTAC inquiry${
                  inquiry.company ? ` from ${encodeURIComponent(inquiry.company)}` : ""
                }`}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  data-testid="button-email-reply"
                >
                  <Mail className="h-4 w-4" /> 이메일 답장
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground truncate">{children ?? value}</div>
      </div>
    </div>
  );
}
