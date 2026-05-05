import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListBanners,
  useAdminDeleteBanner,
  useAdminReorderBanners,
  useAdminUpdateBanner,
  getAdminListBannersQueryKey,
  type AdminBanner,
} from "@workspace/api-client-react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";

export default function Banners() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useAdminListBanners();
  const reorderMut = useAdminReorderBanners();
  const updateMut = useAdminUpdateBanner();
  const deleteMut = useAdminDeleteBanner();
  const [order, setOrder] = useState<AdminBanner[]>([]);
  const [pendingDelete, setPendingDelete] = useState<AdminBanner | null>(null);

  useEffect(() => {
    if (data) setOrder(data);
  }, [data]);

  const dirty = useMemo(() => {
    if (!data) return false;
    if (order.length !== data.length) return true;
    return order.some((b, i) => b.id !== data[i]?.id);
  }, [order, data]);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...order];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(idx, 1);
    if (item) next.splice(target, 0, item);
    setOrder(next);
  };

  const saveOrder = async () => {
    try {
      await reorderMut.mutateAsync({
        data: { order: order.map((b) => b.id) },
      });
      await qc.invalidateQueries({ queryKey: getAdminListBannersQueryKey() });
      toast({ title: "순서 저장됨" });
    } catch (err) {
      toast({
        title: "저장 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (b: AdminBanner) => {
    try {
      await updateMut.mutateAsync({
        id: b.id,
        data: {
          imageUrl: b.imageUrl,
          linkUrl: b.linkUrl ?? null,
          active: !b.active,
          sortOrder: b.sortOrder,
          translations: b.translations,
        },
      });
      await qc.invalidateQueries({ queryKey: getAdminListBannersQueryKey() });
    } catch (err) {
      toast({
        title: "업데이트 실패",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMut.mutateAsync({ id: pendingDelete.id });
      await qc.invalidateQueries({ queryKey: getAdminListBannersQueryKey() });
      toast({ title: "삭제됨" });
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
          <h1 className="text-3xl font-bold tracking-tight">메인 배너 관리</h1>
          <p className="text-muted-foreground mt-1">
            랜딩 페이지의 풀스크린 슬라이더에 노출되는 배너를 관리합니다. 한국어로 입력 후 자동
            번역으로 5개 언어를 채워주세요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <Button
              variant="outline"
              onClick={() => void saveOrder()}
              disabled={reorderMut.isPending}
              data-testid="button-save-order"
            >
              순서 저장
            </Button>
          )}
          <Link href="/banners/new">
            <Button className="gap-2" data-testid="button-new-banner">
              <Plus className="h-4 w-4" /> 신규 배너
            </Button>
          </Link>
        </div>
      </header>

      <Card className="p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-12 text-center">로딩 중…</p>
        ) : order.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            배너가 없습니다. 신규 배너를 추가하세요.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {order.map((b, idx) => (
              <li
                key={b.id}
                className="flex items-center gap-4 py-3"
                data-testid={`banner-row-${b.id}`}
              >
                <div className="flex flex-col">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    aria-label="위로"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => move(idx, 1)}
                    disabled={idx === order.length - 1}
                    aria-label="아래로"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="h-16 w-28 rounded bg-muted overflow-hidden border border-border shrink-0">
                  {b.imageUrl ? (
                    <img
                      src={b.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-foreground truncate"
                    data-testid={`banner-title-${b.id}`}
                  >
                    {b.translations.titleKo || (
                      <span className="text-muted-foreground">(제목 없음)</span>
                    )}
                  </p>
                  {b.translations.descriptionKo && (
                    <p className="text-sm text-muted-foreground truncate">
                      {b.translations.descriptionKo}
                    </p>
                  )}
                  {b.linkUrl && (
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                      → {b.linkUrl}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void toggleActive(b)}
                  className="shrink-0"
                  data-testid={`button-toggle-active-${b.id}`}
                >
                  {b.active ? (
                    <Badge className="gap-1">
                      <Eye className="h-3 w-3" /> 게시중
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <EyeOff className="h-3 w-3" /> 비공개
                    </Badge>
                  )}
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/banners/${b.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      data-testid={`button-edit-${b.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setPendingDelete(b)}
                    data-testid={`button-delete-${b.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>배너를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingDelete?.translations.titleKo || "(제목 없음)"}</strong> 배너가
              영구적으로 삭제됩니다.
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
