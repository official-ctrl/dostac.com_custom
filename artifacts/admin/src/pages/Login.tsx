import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminLogin,
  getAdminGetMeQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const loginMut = useAdminLogin();

  const [email, setEmail] = useState("admin@dostac.co.kr");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await loginMut.mutateAsync({ data: { email, password } });
      qc.setQueryData(getAdminGetMeQueryKey(), user);
      await qc.invalidateQueries({ queryKey: getAdminGetMeQueryKey() });
      toast({ title: "환영합니다", description: `${user.name}님, 로그인 되었습니다.` });
    } catch (err) {
      toast({
        title: "로그인 실패",
        description: err instanceof Error ? err.message : "이메일/비밀번호를 확인하세요",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold tracking-tight text-primary">dostac</span>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Content Management
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>관리자 로그인</CardTitle>
            <CardDescription>등록된 이메일과 비밀번호로 로그인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMut.isPending}
                data-testid="button-login"
              >
                {loginMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                로그인
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          dostac Co., Ltd. · Admin Console
        </p>
      </div>
    </div>
  );
}
