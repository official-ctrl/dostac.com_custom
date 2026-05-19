import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useSearch, useLocation } from "wouter";
import {
  useAdminListProducts,
  useAdminDeleteProduct,
  getAdminListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Upload, ImageOff, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, Info, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useToast } from "@/hooks/use-toast";
import { getTr } from "@/lib/langs";

export default function Products() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: products, isLoading } = useAdminListProducts();
  const deleteMut = useAdminDeleteProduct();

  const searchString = useSearch();
  const [, navigate] = useLocation();

  const initialParams = new URLSearchParams(searchString);
  const [search, setSearch] = useState(
    () => new URLSearchParams(searchString).get("q") ?? "",
  );

  const hasRestoredFilter = useRef(
    initialParams.get("cat") != null && initialParams.get("cat") !== "all",
  );
  const [showFilterNotice, setShowFilterNotice] = useState(hasRestoredFilter.current);

  useEffect(() => {
    if (!hasRestoredFilter.current) return;
    const timer = setTimeout(() => setShowFilterNotice(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);
  const [catSort, setCatSort] = useState<"asc" | "desc" | null>(null);
  const [nameSort, setNameSort] = useState<"asc" | "desc" | null>(null);
  const [orderSort, setOrderSort] = useState<"asc" | "desc" | null>(null);
  const [statusSort, setStatusSort] = useState<"asc" | "desc" | null>(null);

  const toggleCatSort = () => {
    setNameSort(null); setOrderSort(null); setStatusSort(null);
    setCatSort((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));
  };
  const toggleNameSort = () => {
    setCatSort(null); setOrderSort(null); setStatusSort(null);
    setNameSort((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));
  };
  const toggleOrderSort = () => {
    setCatSort(null); setNameSort(null); setStatusSort(null);
    setOrderSort((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));
  };
  const toggleStatusSort = () => {
    setCatSort(null); setNameSort(null); setOrderSort(null);
    setStatusSort((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    products?.forEach((p) => set.add(p.category));
    return ["all", ...Array.from(set).sort()];
  }, [products]);
  const [activeCat, setActiveCat] = useState<string>(
    () => initialParams.get("cat") ?? "all",
  );
  const [activeSubCat, setActiveSubCat] = useState<string>(() => {
    const cat = initialParams.get("cat") ?? "all";
    return cat !== "all" ? (initialParams.get("subCat") ?? "all") : "all";
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (activeCat !== "all") {
      params.set("cat", activeCat);
      if (activeSubCat !== "all") params.set("subCat", activeSubCat);
    }
    const qs = params.toString();
    navigate(`/products${qs ? `?${qs}` : ""}`, { replace: true });
  }, [search, activeCat, activeSubCat]); // eslint-disable-line react-hooks/exhaustive-deps

  const subCategories = useMemo(() => {
    if (activeCat === "all" || !products) return [];
    const set = new Set<string>();
    products
      .filter((p) => p.category === activeCat && p.subCategory)
      .forEach((p) => set.add(p.subCategory as string));
    return Array.from(set).sort();
  }, [products, activeCat]);

  const contentGaps = useMemo(() => {
    if (!products) return null;
    const published = products.filter((p) => p.published);
    if (published.length === 0) return null;
    const missingImage = published.filter((p) => !p.imageUrl).length;
    const missingKoName = published.filter((p) => {
      const ko = getTr(p.translations, "ko");
      return !ko?.name?.trim();
    }).length;
    if (missingImage === 0 && missingKoName === 0) return null;
    return { missingImage, missingKoName };
  }, [products]);

  const [gapBannerDismissed, setGapBannerDismissed] = useState(false);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (activeCat !== "all" && p.category !== activeCat) return false;
      if (activeSubCat !== "all" && p.subCategory !== activeSubCat) return false;
      if (!q) return true;
      const ko = getTr(p.translations, "ko");
      return (
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (ko?.name?.toLowerCase().includes(q) ?? false) ||
        (ko?.headline?.toLowerCase().includes(q) ?? false)
      );
    });
    if (catSort) {
      const dir = catSort === "asc" ? 1 : -1;
      return [...list].sort((a, b) => {
        const catCmp = a.category.localeCompare(b.category, "ko") * dir;
        if (catCmp !== 0) return catCmp;
        return ((a.subCategory ?? "").localeCompare(b.subCategory ?? "", "ko")) * dir;
      });
    }
    if (nameSort) {
      const dir = nameSort === "asc" ? 1 : -1;
      return [...list].sort((a, b) => {
        const aName = getTr(a.translations, "ko")?.name ?? "";
        const bName = getTr(b.translations, "ko")?.name ?? "";
        return aName.localeCompare(bName, "ko") * dir;
      });
    }
    if (orderSort) {
      const dir = orderSort === "asc" ? 1 : -1;
      return [...list].sort((a, b) => ((a.sortOrder ?? 0) - (b.sortOrder ?? 0)) * dir);
    }
    if (statusSort) {
      const dir = statusSort === "asc" ? 1 : -1;
      return [...list].sort((a, b) => {
        const aVal = a.published ? 1 : 0;
        const bVal = b.published ? 1 : 0;
        return (aVal - bVal) * dir;
      });
    }
    return list;
  }, [products, activeCat, activeSubCat, search, catSort, nameSort, orderSort, statusSort]);

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMut.mutateAsync({ id: pendingDelete.id });
      await qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
      toast({ title: "삭제됨", description: `${pendingDelete.name} 제품이 삭제되었습니다.` });
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
          <h1 className="text-3xl font-bold tracking-tight">제품 관리</h1>
          <p className="text-muted-foreground mt-1">
            5개 언어로 제품을 등록·게시하고 카테고리별로 정렬합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/products/import">
            <Button variant="outline" className="gap-2" data-testid="button-import-products">
              <Upload className="h-4 w-4" /> 일괄 가져오기
            </Button>
          </Link>
          <Link href="/products/new">
            <Button className="gap-2" data-testid="button-new-product">
              <Plus className="h-4 w-4" /> 신규 제품
            </Button>
          </Link>
        </div>
      </header>

      <Card className="p-4 space-y-4">
        {contentGaps && !gapBannerDismissed && (
          <div className="flex items-start justify-between gap-3 text-sm bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5">
            <div className="flex items-start gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <span>
                게시된 제품 중 콘텐츠 누락이 있습니다:{" "}
                {[
                  contentGaps.missingImage > 0 &&
                    `이미지 없음 ${contentGaps.missingImage}건`,
                  contentGaps.missingKoName > 0 &&
                    `한국어 이름 없음 ${contentGaps.missingKoName}건`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
            <button
              onClick={() => setGapBannerDismissed(true)}
              className="shrink-0 text-amber-500 hover:text-amber-700 transition-colors"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

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
              placeholder="이름·슬러그·카테고리 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-products"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <Button
                key={c}
                variant={activeCat === c ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveCat(c);
                  setActiveSubCat("all");
                }}
                data-testid={`filter-cat-${c}`}
              >
                {c === "all" ? "전체" : c}
              </Button>
            ))}
          </div>
        </div>

        {subCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-border">
            <span className="text-xs text-muted-foreground mr-1">하위 카테고리:</span>
            <Button
              key="all"
              variant={activeSubCat === "all" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setActiveSubCat("all")}
              data-testid="filter-subcat-all"
            >
              전체
            </Button>
            {subCategories.map((sc) => (
              <Button
                key={sc}
                variant={activeSubCat === sc ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setActiveSubCat(sc)}
                data-testid={`filter-subcat-${sc}`}
              >
                {sc}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-12 text-center">로딩 중…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">제품이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-2 font-medium">이미지</th>
                  <th className="px-4 py-2 font-medium">
                    <button
                      onClick={toggleNameSort}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      title="제품명 정렬"
                    >
                      제품명 (KO)
                      {nameSort === null && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                      {nameSort === "asc" && <ArrowUp className="h-3 w-3" />}
                      {nameSort === "desc" && <ArrowDown className="h-3 w-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-2 font-medium">슬러그</th>
                  <th className="px-4 py-2 font-medium">
                    <button
                      onClick={toggleCatSort}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      title="카테고리 정렬"
                    >
                      카테고리
                      {catSort === null && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                      {catSort === "asc" && <ArrowUp className="h-3 w-3" />}
                      {catSort === "desc" && <ArrowDown className="h-3 w-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-2 font-medium">
                    <button
                      onClick={toggleOrderSort}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      title="정렬 순서 정렬"
                    >
                      정렬
                      {orderSort === null && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                      {orderSort === "asc" && <ArrowUp className="h-3 w-3" />}
                      {orderSort === "desc" && <ArrowDown className="h-3 w-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-2 font-medium">언어</th>
                  <th className="px-4 py-2 font-medium">
                    <button
                      onClick={toggleStatusSort}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      title="상태 정렬"
                    >
                      상태
                      {statusSort === null && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                      {statusSort === "asc" && <ArrowUp className="h-3 w-3" />}
                      {statusSort === "desc" && <ArrowDown className="h-3 w-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-2 font-medium text-right">작업</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const ko = getTr(p.translations, "ko");
                  const langCount = p.translations.filter((t) =>
                    (t.name?.trim() ?? "").length > 0,
                  ).length;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-muted/40"
                      data-testid={`product-row-${p.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt=""
                              className="h-10 w-10 rounded object-cover bg-muted"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted" />
                          )}
                          {!p.imageUrl && p.published && (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/products/${p.id}`}>
                                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors cursor-pointer">
                                      <ImageOff className="h-4 w-4" />
                                    </span>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>게시된 제품에 이미지가 없습니다. 클릭하여 수정하세요.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {ko?.name ?? <span className="text-muted-foreground">(미입력)</span>}
                          {!ko?.name?.trim() && p.published && (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/products/${p.id}`}>
                                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors cursor-pointer">
                                      <AlertTriangle className="h-4 w-4" />
                                    </span>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>게시된 제품에 한국어 이름이 없습니다. 클릭하여 수정하세요.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {p.slug}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.category}
                        {p.subCategory && (
                          <span className="text-muted-foreground/60"> / {p.subCategory}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.sortOrder}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{langCount}/5</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {p.published ? (
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
                          <Link href={`/products/${p.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              data-testid={`button-edit-${p.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() =>
                              setPendingDelete({ id: p.id, name: ko?.name ?? p.slug })
                            }
                            data-testid={`button-delete-${p.id}`}
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
            <AlertDialogTitle>제품을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingDelete?.name}</strong> 제품과 모든 번역이 영구적으로 삭제됩니다. 이
              작업은 되돌릴 수 없습니다.
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
              data-testid="confirm-delete"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
