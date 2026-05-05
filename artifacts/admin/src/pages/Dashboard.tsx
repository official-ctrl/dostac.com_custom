import { Link } from "wouter";
import {
  useAdminListProducts,
  useAdminListNotices,
  useAdminInquiriesSummary,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Megaphone, Inbox, ArrowRight, Plus } from "lucide-react";
import { getTr } from "@/lib/langs";

export default function Dashboard() {
  const { data: products } = useAdminListProducts();
  const { data: notices } = useAdminListNotices();
  const { data: summary } = useAdminInquiriesSummary();

  const publishedProducts = products?.filter((p) => p.published).length ?? 0;
  const publishedNotices = notices?.filter((n) => n.published).length ?? 0;

  return (
    <div className="px-8 py-8 space-y-8 max-w-6xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          DOSTAC 콘텐츠 관리 시스템에 오신 것을 환영합니다.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-stat-products">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">제품</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{products?.length ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">{publishedProducts}개 게시 중</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-notices">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">공지/소식</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{notices?.length ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">{publishedNotices}개 게시 중</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-inquiries-new">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">신규 문의</CardTitle>
            <Inbox className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {summary?.byStatus.new ?? "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">미확인</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-inquiries-total">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 문의</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary?.total ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              진행 {summary?.byStatus.in_progress ?? 0} · 완료 {summary?.byStatus.completed ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 문의</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">신규 5건</p>
            </div>
            <Link href="/inquiries">
              <Button size="sm" variant="ghost" className="gap-1" data-testid="link-view-all-inquiries">
                전체 보기 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary?.recent && summary.recent.length > 0 ? (
              summary.recent.slice(0, 5).map((inq) => (
                <Link key={inq.id} href={`/inquiries/${inq.id}`}>
                  <a
                    className="block rounded-md border border-border p-3 hover-elevate"
                    data-testid={`recent-inquiry-${inq.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground truncate">
                          {inq.company} · {inq.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {inq.message}
                        </p>
                      </div>
                      <Badge
                        variant={inq.status === "new" ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {inq.status}
                      </Badge>
                    </div>
                  </a>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                아직 문의가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <Link href="/products/new">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="quick-new-product">
                <Plus className="h-4 w-4" /> 신규 제품 등록
              </Button>
            </Link>
            <Link href="/notices/new">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="quick-new-notice">
                <Plus className="h-4 w-4" /> 신규 공지 등록
              </Button>
            </Link>
            <Link href="/inquiries">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="quick-view-inquiries">
                <Inbox className="h-4 w-4" /> 문의함 열기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {products && products.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>최근 등록된 제품</CardTitle>
            <Link href="/products">
              <Button size="sm" variant="ghost" className="gap-1">
                전체 보기 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.slice(0, 6).map((p) => {
              const ko = getTr(p.translations, "ko");
              return (
                <Link key={p.id} href={`/products/${p.id}`}>
                  <a className="block rounded-md border border-border p-3 hover-elevate">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {ko?.name ?? p.slug}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>
                      </div>
                      <Badge variant={p.published ? "default" : "outline"} className="shrink-0">
                        {p.published ? "게시" : "비공개"}
                      </Badge>
                    </div>
                  </a>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
