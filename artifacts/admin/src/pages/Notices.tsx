import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useSearch } from "wouter";
import {
  useAdminListNotices,
  useAdminDeleteNotice,
  getAdminListNoticesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { getTr } from "@/lib/langs";

export default function Notices() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: notices, isLoading } = useAdminListNotices();
  const deleteMut = useAdminDeleteNotice();

  const searchString = useSearch();

  const initialParams = new URLSearchParams(searchString);
  const [search, setSearch] = useState(
    () => new URLSearchParams(searchString).get("q") ?? "",
  );
  const [activeCat, setActiveCat] = useState<string>(
    () => new URLSearchParams(searchString).get("cat") ?? "all",
  );

  const hasRestoredFilter = useRef(
    (initialParams.get("cat") != null && initialParams.get("cat") !== "all") ||
    (initialParams.get("q") != null && initialParams.get("q") !== ""),
  );
  const [showFilterNotice, setShowFilterNotice] = useState(hasRestoredFilter.current);

  useEffect(() => {
    if (!hasRestoredFilter.current) return;
    const timer = setTimeout(() => setShowFilterNotice(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const [pendingDelete, setPendingDelete] = useState<{ id: number; title: string } | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    notices?.forEach((n) => set.add(n.category));
    return ["all", ...Array.from(set).sort()];
  }, [notices]);

  const filtered = useMemo(() => {
    if (!notices) return [];
    const q = search.trim().toLowerCase();
    return notices.filter((n) => {
      if (activeCat !== "all" && n.category !== activeCat) return false;
      if (!q) return true;
      const ko = getTr(n.translations, "ko");
      return (
        n.slug.toLowerCase().includes(q) ||
        (ko?.title?.toLowerCase().includes(q) ?? false) ||
        (ko?.excerpt?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [notices, activeCat, search]);

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMut.mutateAsync({ id: pendingDelete.id });
      await qc.invalidateQueries({ queryKey: getAdminListNoticesQueryKey() });
      toast({ title: "삭제됨", description: pendingDelete.title });
      setPendingDelete(null);
    } catch (err) {
      toast({
        title: "삭제 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-8 py-8 space-y-6 max-w-7xl">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">공지/소식 관리</h1>
          <p className="text-muted-foreground mt-1">
            공지사항·산업 동향·언론 보도를 5개 언어로 게시합니다.
          </p>
        </div>
        <Link href="/notices/new">
          <Button className="gap-2" data-testid="button-new-notice">
            <Plus className="h-4 w-4" /> 신규 공지
          </Button>
        </Link>
      </header>

      <Card className="p-4 space-y-4">
        {showFilterNotice && (
          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 transition-opacity duration-300">
            <Info className="h-4 w-4 shrink-0" />
            이전 필터가 복원되었습니다.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="제목·요약 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-notices"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <Button
                key={c}
                variant={activeCat === c ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCat(c)}
                data-testid={`filter-cat-${c}`}
              >
                {c === "all" ? "전체" : c}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-12 text-center">로딩 중…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">공지가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-2 font-medium">제목 (KO)</th>
                  <th className="px-4 py-2 font-medium">슬러그</th>
                  <th className="px-4 py-2 font-medium">카테고리</th>
                  <th className="px-4 py-2 font-medium">지역</th>
                  <th className="px-4 py-2 font-medium">게시일</th>
                  <th className="px-4 py-2 font-medium">언어</th>
                  <th className="px-4 py-2 font-medium">상태</th>
                  <th className="px-4 py-2 font-medium text-right">작업</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n) => {
                  const ko = getTr(n.translations, "ko");
                  const langCount = n.translations.filter((t) =>
                    (t.title?.trim() ?? "").length > 0,
                  ).length;
                  const missingKoTitle = !ko?.title?.trim();
                  const missingKoBody = !ko?.body?.trim();
                  const showWarning = n.published && (missingKoTitle || missingKoBody);
                  const warningMessage = missingKoTitle && missingKoBody
                    ? "게시된 공지에 한국어 제목과 본문이 없습니다. 클릭하여 수정하세요."
                    : missingKoTitle
                      ? "게시된 공지에 한국어 제목이 없습니다. 클릭하여 수정하세요."
                      : "게시된 공지에 한국어 본문이 없습니다. 클릭하여 수정하세요.";
                  return (
                    <tr
                      key={n.id}
                      className="border-b border-border last:border-0 hover:bg-muted/40"
                      data-testid={`notice-row-${n.id}`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground max-w-[320px]">
                        <div className="flex items-center gap-2 truncate">
                          <span className="truncate">
                            {ko?.title ?? <span className="text-muted-foreground">(미입력)</span>}
                          </span>
                          {showWarning && (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/notices/${n.id}`}>
                                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors cursor-pointer flex-shrink-0">
                                      <AlertTriangle className="h-4 w-4" />
                                    </span>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>{warningMessage}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {n.slug}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{n.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{n.region}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(n.publishedAt).toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{langCount}/5</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {n.published ? (
                          <Badge className="gap-1">
                            <Eye className="h-3 w-3" /> 게시
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <EyeOff className="h-3 w-3" /> 비공개
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/notices/${n.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() =>
                              setPendingDelete({ id: n.id, title: ko?.title ?? n.slug })
                            }
                            data-testid={`button-delete-notice-${n.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingDelete?.title}</strong> 및 모든 번역이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void onDelete();
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
