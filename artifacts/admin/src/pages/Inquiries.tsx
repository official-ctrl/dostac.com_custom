import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useAdminListInquiries, useAdminListProducts } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search as SearchIcon, ArrowRight, Info } from "lucide-react";

const STATUSES = [
  { value: "all", label: "전체" },
  { value: "new", label: "신규" },
  { value: "in_progress", label: "진행 중" },
  { value: "completed", label: "완료" },
];

const INQUIRY_TYPES = [
  { value: "all", label: "전체 유형" },
  { value: "oem", label: "OEM" },
  { value: "odm", label: "ODM" },
  { value: "sample", label: "Sample" },
  { value: "other", label: "기타" },
];

const STATUS_BADGE: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  new: { label: "신규", variant: "default" },
  in_progress: { label: "진행", variant: "secondary" },
  completed: { label: "완료", variant: "outline" },
};

const INQUIRY_TYPE_LABEL: Record<string, string> = {
  oem: "OEM",
  odm: "ODM",
  sample: "Sample",
  other: "기타",
};

const ALL_PRODUCTS_VALUE = "__all__";

export default function Inquiries() {
  const searchString = useSearch();
  const [, navigate] = useLocation();

  const initialParams = new URLSearchParams(searchString);
  const [status, setStatus] = useState<string>(
    () => new URLSearchParams(searchString).get("status") ?? "all",
  );
  const [inquiryType, setInquiryType] = useState<string>(
    () => new URLSearchParams(searchString).get("type") ?? "all",
  );
  const [productSlug, setProductSlug] = useState<string>(
    () => new URLSearchParams(searchString).get("product") ?? ALL_PRODUCTS_VALUE,
  );
  const [search, setSearch] = useState(
    () => new URLSearchParams(searchString).get("q") ?? "",
  );

  const hasRestoredFilter = useRef(
    (initialParams.get("status") != null && initialParams.get("status") !== "all") ||
    (initialParams.get("type") != null && initialParams.get("type") !== "all") ||
    (initialParams.get("product") != null && initialParams.get("product") !== ALL_PRODUCTS_VALUE) ||
    (initialParams.get("q") != null && initialParams.get("q") !== ""),
  );
  const [showFilterNotice, setShowFilterNotice] = useState(hasRestoredFilter.current);

  useEffect(() => {
    if (!hasRestoredFilter.current) return;
    const timer = setTimeout(() => setShowFilterNotice(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (inquiryType !== "all") params.set("type", inquiryType);
    if (productSlug !== ALL_PRODUCTS_VALUE) params.set("product", productSlug);
    if (search.trim()) params.set("q", search.trim());
    const qs = params.toString();
    navigate(qs ? `/inquiries?${qs}` : "/inquiries", { replace: true });
  }, [status, inquiryType, productSlug, search, navigate]);

  const { data: products } = useAdminListProducts();

  const apiParams = useMemo(() => {
    const p: { status?: "new" | "in_progress" | "completed"; productSlug?: string } = {};
    if (status !== "all") p.status = status as "new" | "in_progress" | "completed";
    if (productSlug !== ALL_PRODUCTS_VALUE) p.productSlug = productSlug;
    return Object.keys(p).length > 0 ? p : undefined;
  }, [status, productSlug]);

  const { data: inquiries, isLoading } = useAdminListInquiries(apiParams);

  const filtered = useMemo(() => {
    if (!inquiries) return [];
    let result = inquiries;
    if (inquiryType !== "all") {
      result = result.filter((i) => i.inquiryType === inquiryType);
    }
    const q = search.trim().toLowerCase();
    if (!q) return result;
    return result.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q) ||
        (i.productInterest ?? "").toLowerCase().includes(q) ||
        (i.inquiryType ?? "").toLowerCase().includes(q) ||
        (i.material ?? "").toLowerCase().includes(q),
    );
  }, [inquiries, search, inquiryType]);

  return (
    <div className="px-8 py-8 space-y-6 max-w-7xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">문의함</h1>
        <p className="text-muted-foreground mt-1">
          공개 사이트에서 접수된 문의 목록입니다.
        </p>
      </header>

      <Card className="p-4 space-y-4">
        {showFilterNotice && (
          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 transition-opacity duration-300">
            <Info className="h-4 w-4 shrink-0" />
            이전 필터가 복원되었습니다.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="이름·이메일·회사·제품·유형·메시지 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-inquiries"
            />
          </div>
          <div className="flex gap-1">
            {STATUSES.map((s) => (
              <Button
                key={s.value}
                variant={status === s.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(s.value)}
                data-testid={`filter-status-${s.value}`}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1">
            {INQUIRY_TYPES.map((t) => (
              <Button
                key={t.value}
                variant={inquiryType === t.value ? "secondary" : "outline"}
                size="sm"
                onClick={() => setInquiryType(t.value)}
                data-testid={`filter-type-${t.value}`}
              >
                {t.label}
              </Button>
            ))}
          </div>

          {products && products.length > 0 && (
            <Select value={productSlug} onValueChange={setProductSlug}>
              <SelectTrigger
                className="w-[220px] h-8 text-sm"
                data-testid="filter-product-slug"
              >
                <SelectValue placeholder="제품별 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PRODUCTS_VALUE}>전체 제품</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.slug} value={p.slug}>
                    {p.translations.find((t) => t.lang === "ko")?.name || p.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-12 text-center">로딩 중…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">문의가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-2 font-medium">상태</th>
                  <th className="px-4 py-2 font-medium">담당자 / 이메일</th>
                  <th className="px-4 py-2 font-medium">회사</th>
                  <th className="px-4 py-2 font-medium">유형 / 제품 / 소재</th>
                  <th className="px-4 py-2 font-medium">메시지</th>
                  <th className="px-4 py-2 font-medium">접수일</th>
                  <th className="px-4 py-2 font-medium text-right">상세</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const sb =
                    STATUS_BADGE[i.status] ?? { label: i.status, variant: "outline" as const };
                  const typeLabel = i.inquiryType
                    ? INQUIRY_TYPE_LABEL[i.inquiryType] ?? i.inquiryType
                    : "—";
                  return (
                    <tr
                      key={i.id}
                      className="border-b border-border last:border-0 hover:bg-muted/40"
                      data-testid={`inquiry-row-${i.id}`}
                    >
                      <td className="px-4 py-3">
                        <Badge variant={sb.variant}>{sb.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{i.name}</div>
                        <div className="text-xs text-muted-foreground">{i.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{i.company || "—"}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-muted-foreground">{typeLabel}</div>
                        {i.productSlug && (
                          <div
                            className="text-foreground/70 mt-0.5 max-w-[140px] truncate font-mono text-[11px]"
                            title={i.productSlug}
                          >
                            {i.productSlug}
                          </div>
                        )}
                        {i.productInterest && (
                          <div
                            className="text-foreground/70 mt-0.5 max-w-[140px] truncate"
                            title={i.productInterest}
                          >
                            {i.productInterest}
                          </div>
                        )}
                        {i.material && (
                          <div
                            className="text-foreground/50 mt-0.5 max-w-[140px] truncate"
                            title={i.material}
                          >
                            {i.material}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[260px] truncate">
                        {i.message}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(i.createdAt).toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/inquiries/${i.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            보기 <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
