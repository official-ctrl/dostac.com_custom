import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useAdminListInquiries } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight } from "lucide-react";

const STATUSES = [
  { value: "all", label: "전체" },
  { value: "new", label: "신규" },
  { value: "in_progress", label: "진행 중" },
  { value: "completed", label: "완료" },
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

export default function Inquiries() {
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data: inquiries, isLoading } = useAdminListInquiries(
    status === "all"
      ? undefined
      : { status: status as "new" | "in_progress" | "completed" },
  );

  const filtered = useMemo(() => {
    if (!inquiries) return [];
    const q = search.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q),
    );
  }, [inquiries, search]);

  return (
    <div className="px-8 py-8 space-y-6 max-w-7xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">문의함</h1>
        <p className="text-muted-foreground mt-1">
          공개 사이트에서 접수된 문의 목록입니다.
        </p>
      </header>

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="이름·이메일·회사·메시지 검색"
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
                  <th className="px-4 py-2 font-medium">유형</th>
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
                      <td className="px-4 py-3 text-muted-foreground text-xs">{typeLabel}</td>
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
